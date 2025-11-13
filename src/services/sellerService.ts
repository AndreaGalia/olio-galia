// services/sellerService.ts
import { getDatabase } from '@/lib/mongodb';
import {
  SellerDocument,
  SellerWithStats,
  SellerWithDetails,
  CreateSellerInput,
  UpdateSellerInput,
  AddPaymentInput,
  QuoteDetail,
  Payment
} from '@/types/sellerTypes';
import { ObjectId } from 'mongodb';

export class SellerService {
  private static readonly COLLECTION_NAME = 'sellers';

  /**
   * Calcola le statistiche per un venditore basate sui suoi preventivi confermati
   */
  private static async calculateSellerStats(
    quoteIds: string[],
    commissionPercentage: number,
    payments: Payment[]
  ): Promise<{
    totalSales: number;
    totalCommission: number;
    totalPaid: number;
    totalUnpaid: number;
    confirmedQuotesCount: number;
  }> {
    if (!quoteIds || quoteIds.length === 0) {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        totalSales: 0,
        totalCommission: 0,
        totalPaid,
        totalUnpaid: -totalPaid, // Se ha pagamenti ma nessuna vendita, è negativo
        confirmedQuotesCount: 0
      };
    }

    const db = await getDatabase();
    const formsCollection = db.collection('forms');

    // Recupera solo preventivi confermati
    const confirmedQuotes = await formsCollection
      .find({
        _id: { $in: quoteIds.map(id => new ObjectId(id)) },
        status: 'confermato'
      })
      .toArray();

    // Calcola totale vendite in centesimi
    const totalSales = confirmedQuotes.reduce((sum, quote: any) => {
      // finalTotal può essere in finalPricing.finalTotal oppure direttamente in finalTotal
      const finalTotal = quote.finalPricing?.finalTotal || quote.finalTotal || 0;
      return sum + Math.round(finalTotal * 100);
    }, 0);

    // Calcola commissione totale dovuta
    const totalCommission = Math.round(totalSales * (commissionPercentage / 100));

    // Calcola totale già pagato
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calcola totale da pagare
    const totalUnpaid = totalCommission - totalPaid;

    return {
      totalSales,
      totalCommission,
      totalPaid,
      totalUnpaid,
      confirmedQuotesCount: confirmedQuotes.length
    };
  }

  /**
   * Recupera tutti i venditori con statistiche
   * @param page Numero pagina (default 1)
   * @param limit Numero risultati per pagina (default 20)
   * @param search Termine di ricerca (nome, email, telefono)
   * @param sortBy Campo per ordinamento (default 'totalSales')
   * @param sortOrder Ordine (asc/desc, default 'desc')
   * @param includeInactive Includere venditori archiviati (default false)
   */
  static async getAllSellers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    sortBy: 'name' | 'totalSales' | 'totalCommission' | 'totalUnpaid' | 'createdAt' = 'totalSales',
    sortOrder: 'asc' | 'desc' = 'desc',
    includeInactive: boolean = false
  ): Promise<{
    sellers: SellerWithStats[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    const skip = (page - 1) * limit;

    // Costruisci il filtro
    let filter: any = {};

    // Filtra venditori attivi (a meno che includeInactive = true)
    if (!includeInactive) {
      filter['metadata.isActive'] = true;
    }

    // Ricerca
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Recupera venditori
    const sellers = await collection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Calcola statistiche per ogni venditore
    const sellersWithStats: SellerWithStats[] = await Promise.all(
      sellers.map(async (seller) => {
        const stats = await this.calculateSellerStats(
          seller.quotes,
          seller.commissionPercentage,
          seller.payments
        );

        return {
          ...seller,
          ...stats
        };
      })
    );

    // Ordina in-memory perché i campi calcolati non sono nel DB
    sellersWithStats.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalSales':
          aValue = a.totalSales;
          bValue = b.totalSales;
          break;
        case 'totalCommission':
          aValue = a.totalCommission;
          bValue = b.totalCommission;
          break;
        case 'totalUnpaid':
          aValue = a.totalUnpaid;
          bValue = b.totalUnpaid;
          break;
        case 'createdAt':
          aValue = a.metadata.createdAt.getTime();
          bValue = b.metadata.createdAt.getTime();
          break;
        default:
          aValue = a.totalSales;
          bValue = b.totalSales;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return {
      sellers: sellersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Recupera un singolo venditore con dettagli completi
   */
  static async getSellerById(sellerId: string): Promise<SellerWithDetails | null> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    const seller = await collection.findOne({ _id: new ObjectId(sellerId) });

    if (!seller) {
      return null;
    }

    // Calcola statistiche
    const stats = await this.calculateSellerStats(
      seller.quotes,
      seller.commissionPercentage,
      seller.payments
    );

    // Recupera dettagli preventivi
    const quoteDetails = await this.getQuoteDetails(seller.quotes, seller.commissionPercentage);

    return {
      ...seller,
      ...stats,
      quoteDetails
    };
  }

  /**
   * Recupera dettagli preventivi con commissioni
   */
  private static async getQuoteDetails(
    quoteIds: string[],
    commissionPercentage: number
  ): Promise<QuoteDetail[]> {
    if (!quoteIds || quoteIds.length === 0) {
      return [];
    }

    const db = await getDatabase();
    const formsCollection = db.collection('forms');

    const quotes = await formsCollection
      .find({ _id: { $in: quoteIds.map(id => new ObjectId(id)) } })
      .sort({ createdAt: -1 })
      .toArray();

    return quotes.map((quote: any) => {
      // finalTotal può essere in finalPricing.finalTotal oppure direttamente in finalTotal
      const finalTotal = quote.finalPricing?.finalTotal || quote.finalTotal || 0;
      const totalInCents = Math.round(finalTotal * 100);
      const commission = Math.round(totalInCents * (commissionPercentage / 100));

      return {
        _id: quote._id.toString(),
        orderId: quote.orderId,
        customerName: quote.customer?.name || `${quote.firstName || ''} ${quote.lastName || ''}`.trim(),
        customerEmail: quote.customer?.email || quote.email,
        total: totalInCents,
        commission,
        status: quote.status,
        createdAt: quote.createdAt,
        confirmedAt: quote.status === 'confermato' ? quote.updatedAt || quote.createdAt : undefined
      };
    });
  }

  /**
   * Crea un nuovo venditore
   */
  static async createSeller(input: CreateSellerInput): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    // Verifica se email esiste già
    const existingSeller = await collection.findOne({
      email: input.email.toLowerCase(),
      'metadata.isActive': true
    });

    if (existingSeller) {
      throw new Error(`Un venditore con email ${input.email} esiste già`);
    }

    // Validazione percentuale
    if (input.commissionPercentage < 0 || input.commissionPercentage > 100) {
      throw new Error('La percentuale di commissione deve essere tra 0 e 100');
    }

    const now = new Date();

    const newSeller: SellerDocument = {
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.toLowerCase().trim(),
      commissionPercentage: input.commissionPercentage,
      quotes: [],
      payments: [],
      metadata: {
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    };

    const result = await collection.insertOne(newSeller as any);
    return result.insertedId.toString();
  }

  /**
   * Aggiorna un venditore
   */
  static async updateSeller(
    sellerId: string,
    input: UpdateSellerInput
  ): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    // Se viene cambiata l'email, verifica che non esista già
    if (input.email) {
      const existingSeller = await collection.findOne({
        email: input.email.toLowerCase(),
        _id: { $ne: new ObjectId(sellerId) },
        'metadata.isActive': true
      });

      if (existingSeller) {
        throw new Error(`Un venditore con email ${input.email} esiste già`);
      }
    }

    // Validazione percentuale
    if (input.commissionPercentage !== undefined) {
      if (input.commissionPercentage < 0 || input.commissionPercentage > 100) {
        throw new Error('La percentuale di commissione deve essere tra 0 e 100');
      }
    }

    const updateData: any = {
      'metadata.updatedAt': new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.phone !== undefined) {
      updateData.phone = input.phone.trim();
    }

    if (input.email !== undefined) {
      updateData.email = input.email.toLowerCase().trim();
    }

    if (input.commissionPercentage !== undefined) {
      updateData.commissionPercentage = input.commissionPercentage;
    }

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      { $set: updateData }
    );
  }

  /**
   * Soft delete di un venditore
   */
  static async deleteSeller(sellerId: string): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $set: {
          'metadata.isActive': false,
          'metadata.updatedAt': new Date()
        }
      }
    );
  }

  /**
   * Ripristina un venditore archiviato
   */
  static async restoreSeller(sellerId: string): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $set: {
          'metadata.isActive': true,
          'metadata.updatedAt': new Date()
        }
      }
    );
  }

  /**
   * Aggiunge un pagamento al venditore
   */
  static async addPayment(
    sellerId: string,
    input: AddPaymentInput
  ): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    // Validazione importo
    if (input.amount <= 0) {
      throw new Error('L\'importo deve essere maggiore di 0');
    }

    const payment: Payment = {
      _id: new ObjectId(),
      amount: input.amount,
      date: input.date,
      notes: input.notes?.trim(),
      createdAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $push: { payments: payment as any },
        $set: { 'metadata.updatedAt': new Date() }
      }
    );

    return payment._id!.toString();
  }

  /**
   * Rimuove un pagamento dal venditore
   */
  static async removePayment(
    sellerId: string,
    paymentId: string
  ): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $pull: { payments: { _id: new ObjectId(paymentId) } as any },
        $set: { 'metadata.updatedAt': new Date() }
      }
    );
  }

  /**
   * Aggiunge un preventivo all'array quotes del venditore
   */
  static async addQuoteToSeller(
    sellerId: string,
    quoteId: string
  ): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $addToSet: { quotes: quoteId }, // addToSet evita duplicati
        $set: { 'metadata.updatedAt': new Date() }
      }
    );
  }

  /**
   * Rimuove un preventivo dall'array quotes del venditore
   */
  static async removeQuoteFromSeller(
    sellerId: string,
    quoteId: string
  ): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(sellerId) },
      {
        $pull: { quotes: quoteId },
        $set: { 'metadata.updatedAt': new Date() }
      }
    );
  }

  /**
   * Recupera lista semplificata di venditori per dropdown
   */
  static async getSellersForDropdown(): Promise<Array<{
    _id: string;
    name: string;
    email: string;
  }>> {
    const db = await getDatabase();
    const collection = db.collection<SellerDocument>(this.COLLECTION_NAME);

    const sellers = await collection
      .find({ 'metadata.isActive': true })
      .project({ name: 1, email: 1 })
      .sort({ name: 1 })
      .toArray();

    return sellers.map(seller => ({
      _id: seller._id!.toString(),
      name: seller.name,
      email: seller.email
    }));
  }
}
