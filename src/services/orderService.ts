// services/orderService.ts
import { getDatabase } from '@/lib/mongodb';
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { WithId, Document, ObjectId } from 'mongodb';

// Tipo esteso per l'ordine salvato in MongoDB
interface MongoOrderDetails extends OrderDetails {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
}

export class OrderService {
  private static readonly COLLECTION_NAME = 'orders';

  // Helper per convertire da documento MongoDB a OrderDetails
  private static mongoToOrderDetails(mongoDoc: WithId<Document>): OrderDetails {
    // Rimuovi _id e altri campi MongoDB specifici
    const { _id, createdAt, updatedAt, orderId, ...orderData } = mongoDoc;
    
    // Assicurati che i campi richiesti siano presenti
    return {
      id: orderData.id || '',
      customer: orderData.customer || { name: '', email: '', phone: '' },
      shipping: orderData.shipping || { address: '', method: '' },
      items: orderData.items || [],
      pricing: orderData.pricing || { subtotal: 0, shippingCost: 0, total: 0 },
      total: orderData.total || 0,
      status: orderData.status || 'unknown',
      created: orderData.created || new Date().toISOString(),
      currency: orderData.currency || 'EUR',
      paymentStatus: orderData.paymentStatus || 'unknown',
      paymentIntent: orderData.paymentIntent || null,
      ...orderData // Mantieni altri campi se presenti
    } as OrderDetails;
  }

  // Salva un nuovo ordine
  static async createOrder(orderData: OrderDetails): Promise<string> {
    try {
      const db = await getDatabase();
      const collection = db.collection<MongoOrderDetails>(this.COLLECTION_NAME);

      // Prepara i dati dell'ordine con timestamp
      const orderToSave: MongoOrderDetails = {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Assicurati che l'ID sia unico
        orderId: orderData.id,
        // Aggiungi shippingStatus di default se non presente
        shippingStatus: orderData.shippingStatus || 'pending',
      } as any;

      const result = await collection.insertOne(orderToSave);
      
      console.log(`Ordine salvato con ID: ${result.insertedId}`);
      return result.insertedId.toString();
    } catch (error) {
      console.error('Errore nel salvare l\'ordine:', error);
      throw new Error('Impossibile salvare l\'ordine nel database');
    }
  }

  // Trova un ordine per session ID
  static async findOrderBySessionId(sessionId: string): Promise<OrderDetails | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const order = await collection.findOne({ id: sessionId });
      
      if (!order) {
        return null;
      }

      return this.mongoToOrderDetails(order);
    } catch (error) {
      console.error('Errore nel recuperare l\'ordine:', error);
      return null;
    }
  }

  // Aggiorna lo stato di un ordine
  static async updateOrderStatus(sessionId: string, status: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const result = await collection.updateOne(
        { id: sessionId },
        { 
          $set: { 
            status: status,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Errore nell\'aggiornare lo stato ordine:', error);
      return false;
    }
  }

  // Trova ordini per email cliente
  static async findOrdersByEmail(email: string): Promise<OrderDetails[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const orders = await collection
        .find({ 'customer.email': email })
        .sort({ createdAt: -1 })
        .toArray();

      // Converti ogni documento MongoDB in OrderDetails
      return orders.map(order => this.mongoToOrderDetails(order));
    } catch (error) {
      console.error('Errore nel recuperare ordini per email:', error);
      return [];
    }
  }

  // Verifica se un ordine esiste già
  static async orderExists(sessionId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const count = await collection.countDocuments({ id: sessionId });
      return count > 0;
    } catch (error) {
      console.error('Errore nel verificare esistenza ordine:', error);
      return false;
    }
  }

  // NUOVO: Metodo per ottenere tutti gli ordini con paginazione
  static async getAllOrders(
    page: number = 1, 
    limit: number = 20
  ): Promise<{ orders: OrderDetails[]; total: number; hasMore: boolean }> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        collection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments({})
      ]);

      return {
        orders: orders.map(order => this.mongoToOrderDetails(order)),
        total,
        hasMore: skip + orders.length < total
      };
    } catch (error) {
      console.error('Errore nel recuperare tutti gli ordini:', error);
      return { orders: [], total: 0, hasMore: false };
    }
  }

  // NUOVO: Metodo per cercare ordini per stato
  static async findOrdersByStatus(status: string): Promise<OrderDetails[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const orders = await collection
        .find({ status })
        .sort({ createdAt: -1 })
        .toArray();

      return orders.map(order => this.mongoToOrderDetails(order));
    } catch (error) {
      console.error('Errore nel recuperare ordini per stato:', error);
      return [];
    }
  }
}