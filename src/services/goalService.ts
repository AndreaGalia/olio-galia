// services/goalService.ts
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface RevenueGoal {
  _id?: ObjectId;
  target: number;
  startDate: Date;
  endDate: Date;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface GoalProgress {
  goal: RevenueGoal;
  currentRevenue: number;
  percentage: number;
  remaining: number;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  averagePerDay: number;
  requiredAveragePerDay: number;
  isOnTrack: boolean;
}

export class GoalService {
  private static readonly COLLECTION = 'revenue_goals';

  /**
   * Recupera l'obiettivo attualmente attivo
   */
  static async getActiveGoal(): Promise<RevenueGoal | null> {
    try {
      const db = await getDatabase();
      const goalsCollection = db.collection(this.COLLECTION);

      const activeGoal = await goalsCollection.findOne(
        { isActive: true },
        { sort: { createdAt: -1 } }
      );

      if (!activeGoal) return null;

      return this.mapToRevenueGoal(activeGoal);
    } catch (error) {
      console.error('Errore recupero obiettivo attivo:', error);
      return null;
    }
  }

  /**
   * Calcola il progresso dell'obiettivo attivo
   */
  static async calculateProgress(): Promise<GoalProgress | null> {
    try {
      const goal = await this.getActiveGoal();
      if (!goal) return null;

      const currentRevenue = await this.getCurrentRevenue(goal.startDate, goal.endDate);
      const percentage = goal.target > 0 ? (currentRevenue / goal.target) * 100 : 0;
      const remaining = goal.target - currentRevenue;

      const now = new Date();
      const startTime = new Date(goal.startDate).getTime();
      const endTime = new Date(goal.endDate).getTime();
      const nowTime = now.getTime();

      const totalDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((nowTime - startTime) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24)));

      const averagePerDay = daysElapsed > 0 ? currentRevenue / daysElapsed : 0;
      const requiredAveragePerDay = daysRemaining > 0 ? remaining / daysRemaining : 0;

      const expectedRevenue = (daysElapsed / totalDays) * goal.target;
      const isOnTrack = currentRevenue >= expectedRevenue;

      return {
        goal,
        currentRevenue,
        percentage,
        remaining,
        daysElapsed,
        daysRemaining,
        totalDays,
        averagePerDay,
        requiredAveragePerDay,
        isOnTrack,
      };
    } catch (error) {
      console.error('Errore calcolo progresso:', error);
      return null;
    }
  }

  /**
   * Recupera il fatturato corrente nel periodo specificato
   * Somma sia gli ordini (orders) che i preventivi (forms)
   */
  private static async getCurrentRevenue(startDate: Date, endDate: Date): Promise<number> {
    try {
      const db = await getDatabase();
      const ordersCollection = db.collection('orders');
      const formsCollection = db.collection('forms');

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Recupera fatturato dagli ordini Stripe (orders collection)
      const ordersResult = await ordersCollection.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]).toArray();

      // Recupera fatturato dai preventivi (forms collection)
      const formsResult = await formsCollection.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
            'finalPricing.finalTotal': { $exists: true },
            updatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$finalPricing.finalTotal' },
          },
        },
      ]).toArray();

      const ordersRevenue = ordersResult.length > 0 ? ordersResult[0].total : 0;
      const formsRevenue = formsResult.length > 0 ? formsResult[0].total : 0;

      // Somma entrambi i fatturati
      return ordersRevenue + formsRevenue;
    } catch (error) {
      console.error('Errore recupero fatturato:', error);
      return 0;
    }
  }

  /**
   * Crea un nuovo obiettivo
   */
  static async createGoal(
    target: number,
    startDate: Date,
    endDate: Date,
    createdBy: string
  ): Promise<{ success: boolean; goalId?: string; error?: string }> {
    try {
      // Validazioni
      if (target <= 0) {
        return { success: false, error: 'L\'obiettivo deve essere maggiore di zero' };
      }

      if (new Date(endDate) <= new Date(startDate)) {
        return { success: false, error: 'La data di fine deve essere successiva alla data di inizio' };
      }

      const db = await getDatabase();
      const goalsCollection = db.collection(this.COLLECTION);

      // Disattiva eventuali obiettivi attivi precedenti
      await goalsCollection.updateMany(
        { isActive: true },
        { $set: { isActive: false, updatedAt: new Date() } }
      );

      const year = new Date(startDate).getFullYear();
      const now = new Date();

      const newGoal: Omit<RevenueGoal, '_id'> = {
        target,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        year,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      const result = await goalsCollection.insertOne(newGoal);

      if (!result.insertedId) {
        return { success: false, error: 'Errore durante la creazione dell\'obiettivo' };
      }

      return { success: true, goalId: result.insertedId.toString() };
    } catch (error) {
      console.error('Errore creazione obiettivo:', error);
      return { success: false, error: 'Errore interno del server' };
    }
  }

  /**
   * Aggiorna un obiettivo esistente
   */
  static async updateGoal(
    goalId: string,
    updates: Partial<Pick<RevenueGoal, 'target' | 'startDate' | 'endDate' | 'isActive'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ObjectId.isValid(goalId)) {
        return { success: false, error: 'ID obiettivo non valido' };
      }

      // Validazioni
      if (updates.target !== undefined && updates.target <= 0) {
        return { success: false, error: 'L\'obiettivo deve essere maggiore di zero' };
      }

      if (updates.startDate && updates.endDate && new Date(updates.endDate) <= new Date(updates.startDate)) {
        return { success: false, error: 'La data di fine deve essere successiva alla data di inizio' };
      }

      const db = await getDatabase();
      const goalsCollection = db.collection(this.COLLECTION);

      // Se si sta attivando questo obiettivo, disattiva gli altri
      if (updates.isActive === true) {
        await goalsCollection.updateMany(
          { _id: { $ne: new ObjectId(goalId) }, isActive: true },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
      }

      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      // Converti le date in Date objects
      if (updates.startDate) {
        updateData.startDate = new Date(updates.startDate);
        updateData.year = updateData.startDate.getFullYear();
      }
      if (updates.endDate) {
        updateData.endDate = new Date(updates.endDate);
      }

      const result = await goalsCollection.updateOne(
        { _id: new ObjectId(goalId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Obiettivo non trovato' };
      }

      return { success: true };
    } catch (error) {
      console.error('Errore aggiornamento obiettivo:', error);
      return { success: false, error: 'Errore interno del server' };
    }
  }

  /**
   * Elimina un obiettivo
   */
  static async deleteGoal(goalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ObjectId.isValid(goalId)) {
        return { success: false, error: 'ID obiettivo non valido' };
      }

      const db = await getDatabase();
      const goalsCollection = db.collection(this.COLLECTION);

      const result = await goalsCollection.deleteOne({ _id: new ObjectId(goalId) });

      if (result.deletedCount === 0) {
        return { success: false, error: 'Obiettivo non trovato' };
      }

      return { success: true };
    } catch (error) {
      console.error('Errore eliminazione obiettivo:', error);
      return { success: false, error: 'Errore interno del server' };
    }
  }

  /**
   * Recupera tutti gli obiettivi (con paginazione)
   */
  static async getAllGoals(page: number = 1, limit: number = 10): Promise<{
    goals: RevenueGoal[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const db = await getDatabase();
      const goalsCollection = db.collection(this.COLLECTION);

      const skip = (page - 1) * limit;

      const [goals, total] = await Promise.all([
        goalsCollection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        goalsCollection.countDocuments({}),
      ]);

      return {
        goals: goals.map(this.mapToRevenueGoal),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Errore recupero obiettivi:', error);
      return { goals: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Mappa un documento MongoDB a RevenueGoal
   */
  private static mapToRevenueGoal(doc: any): RevenueGoal {
    return {
      _id: doc._id,
      target: doc.target,
      startDate: doc.startDate,
      endDate: doc.endDate,
      year: doc.year,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
    };
  }
}
