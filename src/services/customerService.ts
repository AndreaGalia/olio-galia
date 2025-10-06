// services/customerService.ts
import { getDatabase } from '@/lib/mongodb';
import {
  CustomerDocument,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerWithOrders
} from '@/types/customerTypes';
import { ObjectId } from 'mongodb';

export class CustomerService {
  private static readonly COLLECTION_NAME = 'customers';

  /**
   * Crea o aggiorna un cliente automaticamente da un ordine
   */
  static async createOrUpdateFromOrder(
    email: string,
    firstName: string,
    lastName: string,
    phone: string | undefined,
    address: {
      line1?: string;
      city?: string;
      postal_code?: string;
      country?: string;
      state?: string;
    } | undefined,
    orderId: string,
    orderTotal: number, // In centesimi
    source: 'order' | 'quote' = 'order'
  ): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      // Cerca cliente esistente per email
      const existingCustomer = await collection.findOne({ email: email.toLowerCase() });

      if (existingCustomer) {
        // Aggiorna cliente esistente
        await collection.updateOne(
          { email: email.toLowerCase() },
          {
            $addToSet: { orders: orderId }, // Aggiungi orderId se non esiste già
            $inc: {
              totalOrders: 1,
              totalSpent: orderTotal
            },
            $set: {
              'metadata.updatedAt': new Date(),
              // Aggiorna dati solo se forniti
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(phone && { phone }),
              ...(address && {
                address: {
                  street: address.line1 || existingCustomer.address?.street || '',
                  city: address.city || existingCustomer.address?.city || '',
                  postalCode: address.postal_code || existingCustomer.address?.postalCode || '',
                  country: address.country || existingCustomer.address?.country || '',
                  province: address.state || existingCustomer.address?.province,
                }
              })
            }
          }
        );
      } else {
        // Crea nuovo cliente
        const newCustomer: CustomerDocument = {
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone,
          address: address ? {
            street: address.line1 || '',
            city: address.city || '',
            postalCode: address.postal_code || '',
            country: address.country || '',
            province: address.state,
          } : undefined,
          orders: [orderId],
          totalOrders: 1,
          totalSpent: orderTotal,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            source,
          }
        };

        await collection.insertOne(newCustomer);
      }
    } catch (error) {
      console.error('Errore nel creare/aggiornare cliente:', error);
      throw new Error('Impossibile salvare il cliente nel database');
    }
  }

  /**
   * Ottiene tutti i clienti con paginazione e ricerca
   */
  static async getAllCustomers(
    page: number = 1,
    limit: number = 20,
    searchQuery?: string,
    sortBy: 'name' | 'totalOrders' | 'totalSpent' | 'createdAt' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ customers: CustomerDocument[]; total: number; hasMore: boolean }> {
    try {
      const db = await getDatabase();
      const customersCollection = db.collection<CustomerDocument>(this.COLLECTION_NAME);
      const ordersCollection = db.collection('orders');
      const formsCollection = db.collection('forms');

      const skip = (page - 1) * limit;

      // Costruisci filtro di ricerca
      const filter: any = {};
      if (searchQuery) {
        const searchRegex = { $regex: searchQuery, $options: 'i' };
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ];
      }

      // Costruisci sorting
      const sortField: any = {};
      if (sortBy === 'name') {
        sortField.firstName = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'totalOrders') {
        sortField.totalOrders = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'totalSpent') {
        sortField.totalSpent = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortField['metadata.createdAt'] = sortOrder === 'asc' ? 1 : -1;
      }

      const [customers, total] = await Promise.all([
        customersCollection
          .find(filter)
          .sort(sortField)
          .skip(skip)
          .limit(limit)
          .toArray(),
        customersCollection.countDocuments(filter)
      ]);

      // Ottimizzazione: Recupera tutti gli orderIds una sola volta
      const allOrderIds = customers.flatMap(c => c.orders);

      // Recupera tutti gli ordini in una query
      const allOrders = await ordersCollection
        .find({ id: { $in: allOrderIds } })
        .toArray();

      // Recupera tutti i preventivi pagati in una query
      const allQuotes = await formsCollection
        .find({
          orderId: { $in: allOrderIds },
          status: 'paid'
        })
        .toArray();

      // Crea mappe per accesso veloce
      const ordersMap = new Map<string, any[]>();
      allOrders.forEach((order: any) => {
        const id = order.id;
        if (!ordersMap.has(id)) {
          ordersMap.set(id, []);
        }
        ordersMap.get(id)!.push(order);
      });

      const quotesMap = new Map<string, any[]>();
      allQuotes.forEach((quote: any) => {
        const id = quote.orderId;
        if (!quotesMap.has(id)) {
          quotesMap.set(id, []);
        }
        quotesMap.get(id)!.push(quote);
      });

      // Calcola totali per ogni cliente
      const customersWithRealTotals = customers.map(customer => {
        const customerOrders = customer.orders.flatMap(orderId => ordersMap.get(orderId) || []);
        const customerQuotes = customer.orders.flatMap(orderId => quotesMap.get(orderId) || []);

        // Calcola totale ordini (in centesimi)
        const ordersTotal = customerOrders.reduce((sum, order: any) => {
          const totalInEuros = order.total || order.pricing?.total || 0;
          return sum + Math.round(totalInEuros * 100);
        }, 0);

        // Calcola totale preventivi (in centesimi)
        const quotesTotal = customerQuotes.reduce((sum, quote: any) => {
          const totalInEuros = quote.finalPricing?.finalTotal || 0;
          return sum + Math.round(totalInEuros * 100);
        }, 0);

        return {
          ...customer,
          totalSpent: ordersTotal + quotesTotal,
          totalOrders: customerOrders.length + customerQuotes.length
        };
      });

      return {
        customers: customersWithRealTotals,
        total,
        hasMore: skip + customers.length < total
      };
    } catch (error) {
      console.error('Errore nel recuperare i clienti:', error);
      return { customers: [], total: 0, hasMore: false };
    }
  }

  /**
   * Ottiene un singolo cliente per ID con dettagli ordini
   */
  static async getCustomerById(customerId: string): Promise<CustomerWithOrders | null> {
    try {
      const db = await getDatabase();
      const customersCollection = db.collection<CustomerDocument>(this.COLLECTION_NAME);
      const ordersCollection = db.collection('orders');
      const formsCollection = db.collection('forms');

      const customer = await customersCollection.findOne({
        _id: new ObjectId(customerId)
      });

      if (!customer) {
        return null;
      }

      // Recupera dettagli ordini dalla collection orders
      const orders = await ordersCollection
        .find({ id: { $in: customer.orders } })
        .sort({ createdAt: -1 })
        .toArray();

      // Recupera anche i preventivi pagati dalla collection forms (orderId corrisponde)
      const quotes = await formsCollection
        .find({
          orderId: { $in: customer.orders },
          status: 'paid'
        })
        .sort({ createdAt: -1 })
        .toArray();

      // Combina ordini e preventivi
      const allOrders = [
        ...orders.map((order: any) => {
          // Il total nel database è in euro, convertiamo in centesimi
          const totalInEuros = order.total || order.pricing?.total || 0;
          const totalInCents = Math.round(totalInEuros * 100);

          return {
            orderId: order.id || order.orderId,
            date: order.createdAt || new Date(order.created),
            total: totalInCents,
            status: order.status || 'unknown',
            items: order.items?.length || 0,
            type: 'order' as const,
          };
        }),
        ...quotes.map((quote: any) => {
          // Il total nel database è in euro, convertiamo in centesimi
          const totalInEuros = quote.finalPricing?.finalTotal || 0;
          const totalInCents = Math.round(totalInEuros * 100);

          return {
            orderId: quote.orderId,
            date: quote.createdAt || new Date(quote.timestamp),
            total: totalInCents,
            status: 'paid',
            items: quote.cart?.length || 0,
            type: 'quote' as const,
          };
        })
      ];

      // Ordina per data decrescente
      allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        ...customer,
        orderDetails: allOrders,
      };
    } catch (error) {
      console.error('Errore nel recuperare il cliente:', error);
      return null;
    }
  }

  /**
   * Ottiene un cliente per email
   */
  static async getCustomerByEmail(email: string): Promise<CustomerDocument | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      return await collection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Errore nel recuperare cliente per email:', error);
      return null;
    }
  }

  /**
   * Crea un nuovo cliente manualmente
   */
  static async createCustomer(input: CreateCustomerInput): Promise<string> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      // Verifica se esiste già
      const existing = await collection.findOne({ email: input.email.toLowerCase() });
      if (existing) {
        throw new Error('Un cliente con questa email esiste già');
      }

      const newCustomer: CustomerDocument = {
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        address: input.address,
        orders: [],
        totalOrders: 0,
        totalSpent: 0,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'manual',
        }
      };

      const result = await collection.insertOne(newCustomer);
      return result.insertedId.toString();
    } catch (error: any) {
      console.error('Errore nel creare cliente:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un cliente esistente
   */
  static async updateCustomer(
    customerId: string,
    input: UpdateCustomerInput
  ): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      const updateFields: any = {
        'metadata.updatedAt': new Date(),
      };

      if (input.firstName) updateFields.firstName = input.firstName;
      if (input.lastName) updateFields.lastName = input.lastName;
      if (input.phone !== undefined) updateFields.phone = input.phone;
      if (input.address) updateFields.address = input.address;

      const result = await collection.updateOne(
        { _id: new ObjectId(customerId) },
        { $set: updateFields }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Errore nell\'aggiornare cliente:', error);
      return false;
    }
  }

  /**
   * Elimina un cliente
   */
  static async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      const result = await collection.deleteOne({
        _id: new ObjectId(customerId)
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Errore nell\'eliminare cliente:', error);
      return false;
    }
  }

  /**
   * Ottiene statistiche clienti per dashboard
   */
  static async getCustomerStats(): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    topCustomers: Array<{
      name: string;
      email: string;
      totalSpent: number;
      totalOrders: number;
    }>;
  }> {
    try {
      const db = await getDatabase();
      const collection = db.collection<CustomerDocument>(this.COLLECTION_NAME);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalCustomers, newCustomersThisMonth, topCustomers] = await Promise.all([
        collection.countDocuments({}),
        collection.countDocuments({
          'metadata.createdAt': { $gte: firstDayOfMonth }
        }),
        collection
          .find({})
          .sort({ totalSpent: -1 })
          .limit(5)
          .toArray()
      ]);

      return {
        totalCustomers,
        newCustomersThisMonth,
        topCustomers: topCustomers.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          totalSpent: c.totalSpent,
          totalOrders: c.totalOrders,
        }))
      };
    } catch (error) {
      console.error('Errore nel recuperare statistiche clienti:', error);
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        topCustomers: []
      };
    }
  }
}
