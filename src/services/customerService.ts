// services/customerService.ts
import { getDatabase } from '@/lib/mongodb';
import {
  CustomerDocument,
  CustomerWithStats,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerWithOrders
} from '@/types/customerTypes';
import { ObjectId } from 'mongodb';

export class CustomerService {
  private static readonly COLLECTION_NAME = 'customers';

  /**
   * Calcola totalOrders e totalSpent per un cliente dato l'array di orderIds
   */
  private static async calculateCustomerTotals(orderIds: string[]): Promise<{
    totalOrders: number;
    totalSpent: number;
  }> {
    if (!orderIds || orderIds.length === 0) {
      return { totalOrders: 0, totalSpent: 0 };
    }

    const db = await getDatabase();
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    // Recupera ordini
    const orders = await ordersCollection
      .find({ id: { $in: orderIds } })
      .toArray();

    // Recupera preventivi (escludi pending)
    const quotes = await formsCollection
      .find({
        orderId: { $in: orderIds },
        status: { $ne: 'pending' }
      })
      .toArray();

    // Calcola totale ordini (in centesimi)
    const ordersTotal = orders.reduce((sum, order: any) => {
      const totalInEuros = order.total || order.pricing?.total || 0;
      return sum + Math.round(totalInEuros * 100);
    }, 0);

    // Calcola totale preventivi (in centesimi)
    const quotesTotal = quotes.reduce((sum, quote: any) => {
      const totalInEuros = quote.finalPricing?.finalTotal || 0;
      return sum + Math.round(totalInEuros * 100);
    }, 0);

    return {
      totalOrders: orders.length + quotes.length,
      totalSpent: ordersTotal + quotesTotal
    };
  }

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
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            source,
          }
        };

        await collection.insertOne(newCustomer);
      }
    } catch (error) {
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
  ): Promise<{ customers: CustomerWithStats[]; total: number; hasMore: boolean }> {
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

      // Se sorting per totalOrders/totalSpent, dobbiamo recuperare tutti i clienti e ordinare in memoria
      const needsMemorySort = sortBy === 'totalOrders' || sortBy === 'totalSpent';

      // Costruisci sorting per DB (solo se non serve sorting in memoria)
      const sortField: any = {};
      if (sortBy === 'name') {
        sortField.firstName = sortOrder === 'asc' ? 1 : -1;
      } else {
        // Default sorting per createdAt se serve sorting in memoria
        sortField['metadata.createdAt'] = sortOrder === 'asc' ? 1 : -1;
      }

      const total = await customersCollection.countDocuments(filter);

      // Se serve sorting in memoria, recupera tutti i clienti che matchano il filtro
      // Altrimenti, applica skip e limit sul DB
      const customers = await customersCollection
        .find(filter)
        .sort(sortField)
        .skip(needsMemorySort ? 0 : skip)
        .limit(needsMemorySort ? 0 : limit)
        .toArray();

      // Ottimizzazione: Recupera tutti gli orderIds una sola volta
      const allOrderIds = customers.flatMap(c => c.orders);

      // Recupera tutti gli ordini in una query
      const allOrders = await ordersCollection
        .find({ id: { $in: allOrderIds } })
        .toArray();

      // Recupera i preventivi in una query (escludi pending)
      const allQuotes = await formsCollection
        .find({
          orderId: { $in: allOrderIds },
          status: { $ne: 'pending' }
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
      let customersWithRealTotals: CustomerWithStats[] = customers.map(customer => {
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

      // Se serve sorting in memoria, applica e poi fai skip/limit
      if (needsMemorySort) {
        customersWithRealTotals.sort((a, b) => {
          const aValue = sortBy === 'totalOrders' ? a.totalOrders : a.totalSpent;
          const bValue = sortBy === 'totalOrders' ? b.totalOrders : b.totalSpent;
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
        customersWithRealTotals = customersWithRealTotals.slice(skip, skip + limit);
      }

      return {
        customers: customersWithRealTotals,
        total,
        hasMore: skip + customersWithRealTotals.length < total
      };
    } catch (error) {
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

      // Recupera i preventivi dalla collection forms (escludi pending)
      const quotes = await formsCollection
        .find({
          orderId: { $in: customer.orders },
          status: { $ne: 'pending' }
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
            mongoId: order._id?.toString() || '',
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
            mongoId: quote._id?.toString() || '',
            date: quote.createdAt || new Date(quote.timestamp),
            total: totalInCents,
            status: quote.status || 'pending',
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
        firstName: input.firstName || '',
        lastName: input.lastName || '',
        phone: input.phone,
        address: input.address,
        orders: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          source: input.source || 'manual',
        }
      };

      const result = await collection.insertOne(newCustomer);
      return result.insertedId.toString();
    } catch (error: any) {
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

      const [totalCustomers, newCustomersThisMonth, allCustomers] = await Promise.all([
        collection.countDocuments({}),
        collection.countDocuments({
          'metadata.createdAt': { $gte: firstDayOfMonth }
        }),
        collection.find({}).toArray()
      ]);

      // Calcola totali per ogni cliente
      const customersWithTotals = await Promise.all(
        allCustomers.map(async (customer) => {
          const totals = await this.calculateCustomerTotals(customer.orders);
          return {
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            totalSpent: totals.totalSpent,
            totalOrders: totals.totalOrders,
          };
        })
      );

      // Ordina per totalSpent e prendi top 5
      const topCustomers = customersWithTotals
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      return {
        totalCustomers,
        newCustomersThisMonth,
        topCustomers
      };
    } catch (error) {
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        topCustomers: []
      };
    }
  }
}
