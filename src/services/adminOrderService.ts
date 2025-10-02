import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface AdminOrderSummary {
  id: string;
  sessionId: string;
  paymentIntent: string | null;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  created: string;
  itemCount: number;
  shippingTrackingId?: string;
  shipping?: {
    address: string;
    method: string;
  };
}

export interface AdminOrderDetails extends AdminOrderSummary {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }>;
  pricing: {
    subtotal: number;
    shippingCost: number;
    total: number;
  };
  paymentIntent: string | null;
  mongoId?: string;
  orderId?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export class AdminOrderService {
  private static ORDERS_COLLECTION = 'orders';

  // Genera un ID ordine user-friendly dal MongoDB _id o dalla data di creazione
  private static generateOrderDisplayId(order: any): string {
    try {
      // Se abbiamo createdAt, usa la data + ObjectId suffix
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const idSuffix = order._id ? order._id.toString().slice(-4).toUpperCase() : 'XXXX';
        return `ORD${year}${month}${day}${idSuffix}`;
      }
      
      // Fallback: usa ObjectId o sessionId
      if (order._id) {
        return `ORD${order._id.toString().slice(-8).toUpperCase()}`;
      }
      
      if (order.sessionId) {
        return `ORD${order.sessionId.slice(-8).toUpperCase()}`;
      }
      
      return 'ORD-N/D';
    } catch (error) {
      console.error('Errore generazione ID ordine:', error);
      return `ORD${(order._id?.toString() || order.sessionId || 'UNKNOWN').slice(-8).toUpperCase()}`;
    }
  }

  // Recupera tutti gli ordini con paginazione
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    includeStripe: boolean = false
  ): Promise<{ orders: AdminOrderSummary[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Costruisci il filtro
      let filter: any = {};
      let statusFilter: any = null;

      if (status && status !== 'all') {
        if (status === 'paid') {
          filter.paymentStatus = 'paid';
        } else if (status === 'pending') {
          // Salva il filtro pending per combinarlo dopo con la ricerca
          statusFilter = {
            $or: [
              { shippingStatus: 'pending' },
              { shippingStatus: { $exists: false } }
            ]
          };
        } else if (status === 'shipping') {
          filter.shippingStatus = 'shipping';
        } else if (status === 'shipped') {
          filter.shippingStatus = 'shipped';
        } else if (status === 'delivered') {
          filter.shippingStatus = 'delivered';
        } else if (status === 'cancelled') {
          filter.status = 'cancelled';
        } else {
          filter.paymentStatus = status; // fallback per compatibilità
        }
      }

      // Aggiungi ricerca unificata
      if (search && search.trim()) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        const searchConditions = [
          { sessionId: searchRegex },
          { orderId: searchRegex },
          { 'customer.name': searchRegex },
          { 'customer.email': searchRegex },
          { customerName: searchRegex },
          { customerEmail: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ];

        // Se abbiamo un filtro pending, combina con AND
        if (statusFilter) {
          filter.$and = [
            statusFilter,
            { $or: searchConditions }
          ];
        } else {
          filter.$or = searchConditions;
        }
      } else if (statusFilter) {
        // Se non c'è ricerca ma c'è filtro pending, applicalo direttamente
        Object.assign(filter, statusFilter);
      }

      // Prima prova a recuperare da MongoDB (ordini salvati)
      const db = await getDatabase();
      const collection = db.collection(this.ORDERS_COLLECTION);
      
      const mongoOrders = await collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalMongo = await collection.countDocuments(filter);

      let allOrders: AdminOrderSummary[] = [];
      let totalOrders = 0;

      // Aggiungi ordini da MongoDB se presenti
      if (mongoOrders.length > 0) {
        const mongoOrdersData: AdminOrderSummary[] = mongoOrders.map(order => ({
          id: order._id.toString(),
          sessionId: order.sessionId || order.stripeSessionId || order.id || order._id.toString(),
          paymentIntent: order.paymentIntent || null,
          customerName: order.customer?.name || order.customerName || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'N/D',
          customerEmail: order.customer?.email || order.customerEmail || order.email || 'N/D',
          total: order.total || 0,
          currency: order.currency || 'eur',
          status: order.status || 'completed',
          paymentStatus: order.paymentStatus || 'paid',
          shippingStatus: order.shippingStatus || 'pending',
          created: order.createdAt?.toISOString() || new Date().toISOString(),
          itemCount: order.items?.length || 0,
          shippingTrackingId: order.shippingTrackingId,
          shipping: order.shipping,
        }));

        allOrders = [...mongoOrdersData];
        totalOrders = totalMongo;
      }

      // Aggiungi ordini da Stripe solo se richiesto esplicitamente
      if (includeStripe) {
        try {
          const sessions = await stripe.checkout.sessions.list({
            limit: Math.min(limit, 100),
            expand: ['data.line_items'],
          });

          const paidSessions = sessions.data.filter(session =>
            session.payment_status === 'paid' &&
            (!status || status === 'all' || session.payment_status === status)
          );

          const stripeOrders: AdminOrderSummary[] = paidSessions.map(session => ({
            id: `stripe_${session.id}`,
            sessionId: session.id,
            paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
            customerName: session.customer_details?.name || 'N/D',
            customerEmail: session.customer_details?.email || 'N/D',
            total: (session.amount_total || 0) / 100,
            currency: session.currency || 'eur',
            status: 'completed',
            paymentStatus: session.payment_status,
            shippingStatus: 'pending', // Default per ordini da Stripe
            created: new Date(session.created * 1000).toISOString(),
            itemCount: session.line_items?.data?.length || 0,
            shipping: session.customer_details?.address ? {
              address: this.formatAddress(session.customer_details.address),
              method: 'Standard'
            } : undefined,
          }));

          // Filtra gli ordini Stripe che non sono già in MongoDB
          const mongoSessionIds = new Set(allOrders.map(order => order.sessionId));
          const uniqueStripeOrders = stripeOrders.filter(order =>
            !mongoSessionIds.has(order.sessionId)
          );

          allOrders = [...allOrders, ...uniqueStripeOrders];
          totalOrders += uniqueStripeOrders.length;
        } catch (stripeError) {
          console.warn('Errore recupero ordini Stripe (ignorato):', stripeError);
        }
      }

      // Se non ci sono ordini e non è stato richiesto Stripe, restituisci vuoto
      if (allOrders.length === 0) {
        return {
          orders: [],
          total: 0,
          page,
          totalPages: 0
        };
      }

      // Ordina tutti gli ordini per data di creazione (più recenti prima)
      allOrders.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      // Applica paginazione manuale se necessario
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = allOrders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total: totalOrders,
        page,
        totalPages: Math.ceil(totalOrders / limit)
      };
    } catch (error) {
      console.error('Errore recupero ordini admin:', error);
      throw error;
    }
  }

  // Recupera dettagli di un ordine specifico
  static async getOrderDetails(sessionId: string): Promise<AdminOrderDetails | null> {
    try {
      // Prima prova MongoDB
      const db = await getDatabase();
      const collection = db.collection(this.ORDERS_COLLECTION);
      
      // Prova prima con sessionId/stripeSessionId
      let mongoOrder = await collection.findOne({
        $or: [
          { sessionId },
          { stripeSessionId: sessionId }
        ]
      });

      // Se non trovato e sessionId sembra un ObjectId, prova con _id
      if (!mongoOrder && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        mongoOrder = await collection.findOne({ _id: new ObjectId(sessionId) });
      }

      if (mongoOrder) {
        return {
          id: mongoOrder._id.toString(),
          sessionId: mongoOrder.sessionId || mongoOrder.stripeSessionId || mongoOrder.id || mongoOrder._id.toString(),
          customerName: mongoOrder.customer?.name || mongoOrder.customerName || `${mongoOrder.firstName || ''} ${mongoOrder.lastName || ''}`.trim() || 'N/D',
          customerEmail: mongoOrder.customer?.email || mongoOrder.customerEmail || mongoOrder.email || 'N/D',
          total: mongoOrder.total || 0,
          currency: mongoOrder.currency || 'eur',
          status: mongoOrder.status || 'completed',
          paymentStatus: mongoOrder.paymentStatus || 'paid',
          shippingStatus: mongoOrder.shippingStatus || 'pending',
          created: mongoOrder.created ? new Date(mongoOrder.created).toISOString() : mongoOrder.createdAt?.toISOString() || new Date().toISOString(),
          itemCount: mongoOrder.items?.length || 0,
          items: mongoOrder.items || [],
          pricing: mongoOrder.pricing || {
            subtotal: mongoOrder.total || 0,
            shippingCost: 0,
            total: mongoOrder.total || 0
          },
          shipping: mongoOrder.shipping,
          paymentIntent: mongoOrder.paymentIntent,
          mongoId: mongoOrder._id.toString(),
          orderId: mongoOrder.orderId || mongoOrder.sessionId || mongoOrder.id,
          customer: {
            name: mongoOrder.customer?.name || mongoOrder.customerName || `${mongoOrder.firstName || ''} ${mongoOrder.lastName || ''}`.trim() || 'N/D',
            email: mongoOrder.customer?.email || mongoOrder.customerEmail || mongoOrder.email || 'N/D',
            phone: mongoOrder.customer?.phone || 'N/D'
          },
          createdAt: mongoOrder.createdAt?.toISOString(),
          updatedAt: mongoOrder.updatedAt?.toISOString(),
          shippingTrackingId: mongoOrder.shippingTrackingId,
        };
      }

      // Fallback: recupera da Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
      });

      if (session.payment_status !== 'paid') {
        return null;
      }

      const items = session.line_items?.data?.map(item => {
        const product = item.price?.product as Stripe.Product;
        return {
          id: product?.id || '',
          name: product?.name || 'Prodotto',
          price: (item.price?.unit_amount || 0) / 100,
          quantity: item.quantity || 0,
          image: product?.images?.[0] || null,
        };
      }) || [];

      return {
        id: session.id,
        sessionId: session.id,
        customerName: session.customer_details?.name || 'N/D',
        customerEmail: session.customer_details?.email || 'N/D',
        total: (session.amount_total || 0) / 100,
        currency: session.currency || 'eur',
        status: 'completed',
        paymentStatus: session.payment_status,
        shippingStatus: 'pending', // Default per ordini da Stripe
        created: new Date(session.created * 1000).toISOString(),
        itemCount: items.length,
        items,
        pricing: {
          subtotal: (session.amount_subtotal || 0) / 100,
          shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
          total: (session.amount_total || 0) / 100,
        },
        shipping: session.customer_details?.address ? {
          address: this.formatAddress(session.customer_details.address),
          method: 'Standard'
        } : undefined,
        paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
      };
    } catch (error) {
      console.error('Errore recupero dettagli ordine:', error);
      return null;
    }
  }

  // Statistiche dashboard
  static async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersToday: number;
    revenueToday: number;
  }> {
    try {
      const db = await getDatabase();
      const ordersCollection = db.collection(this.ORDERS_COLLECTION);
      const formsCollection = db.collection('forms');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Statistiche ordini classici
      const [totalOrdersStats, todayOrdersStats] = await Promise.all([
        ordersCollection.aggregate([
          { $match: { paymentStatus: 'paid' } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$total' }
            }
          }
        ]).toArray(),
        ordersCollection.aggregate([
          {
            $match: {
              paymentStatus: 'paid',
              createdAt: { $gte: today, $lt: tomorrow }
            }
          },
          {
            $group: {
              _id: null,
              ordersToday: { $sum: 1 },
              revenueToday: { $sum: '$total' }
            }
          }
        ]).toArray()
      ]);

      // Statistiche preventivi pagati (inclusi tutti gli stati dopo il pagamento)
      const [totalFormsStats, todayFormsStats] = await Promise.all([
        formsCollection.aggregate([
          {
            $match: {
              status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
              'finalPricing.finalTotal': { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              totalForms: { $sum: 1 },
              totalRevenue: { $sum: '$finalPricing.finalTotal' }
            }
          }
        ]).toArray(),
        formsCollection.aggregate([
          {
            $match: {
              status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
              'finalPricing.finalTotal': { $exists: true },
              updatedAt: { $gte: today, $lt: tomorrow }
            }
          },
          {
            $group: {
              _id: null,
              formsToday: { $sum: 1 },
              revenueToday: { $sum: '$finalPricing.finalTotal' }
            }
          }
        ]).toArray()
      ]);

      // Combina i risultati
      const ordersTotal = totalOrdersStats[0]?.totalOrders || 0;
      const ordersRevenue = totalOrdersStats[0]?.totalRevenue || 0;
      const ordersToday = todayOrdersStats[0]?.ordersToday || 0;
      const ordersTodayRevenue = todayOrdersStats[0]?.revenueToday || 0;

      const formsTotal = totalFormsStats[0]?.totalForms || 0;
      const formsRevenue = totalFormsStats[0]?.totalRevenue || 0;
      const formsToday = todayFormsStats[0]?.formsToday || 0;
      const formsTodayRevenue = todayFormsStats[0]?.revenueToday || 0;

      return {
        totalOrders: ordersTotal + formsTotal,
        totalRevenue: ordersRevenue + formsRevenue,
        ordersToday: ordersToday + formsToday,
        revenueToday: ordersTodayRevenue + formsTodayRevenue,
      };
    } catch (error) {
      console.error('Errore statistiche ordini:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        ordersToday: 0,
        revenueToday: 0,
      };
    }
  }

  // Aggiorna informazioni di spedizione dell'ordine
  static async updateOrderShipping(sessionId: string, updateData: {
    shippingTrackingId?: string;
    shippingStatus: string;
  }): Promise<AdminOrderDetails | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.ORDERS_COLLECTION);
      
      // Cerca l'ordine con sessionId, stripeSessionId o _id
      let filter: any = {
        $or: [
          { sessionId },
          { stripeSessionId: sessionId }
        ]
      };

      // Se sessionId sembra un ObjectId, aggiungi anche la ricerca per _id
      if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ _id: new ObjectId(sessionId) });
      }

      // Prepara i dati da aggiornare
      const updateFields: any = {
        shippingStatus: updateData.shippingStatus,
        updatedAt: new Date(),
      };

      // Solo se viene fornito l'ID spedizione, aggiornalo
      if (updateData.shippingTrackingId) {
        updateFields.shippingTrackingId = updateData.shippingTrackingId;
      }

      const updateResult = await collection.updateOne(
        filter,
        { $set: updateFields }
      );

      if (updateResult.matchedCount === 0) {
        return null;
      }

      // Recupera l'ordine aggiornato
      const updatedOrder = await this.getOrderDetails(sessionId);
      return updatedOrder;

    } catch (error) {
      console.error('Errore aggiornamento spedizione ordine:', error);
      return null;
    }
  }

  private static formatAddress(address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
  }): string {
    const { line1, line2, city, postal_code, country } = address;
    return `${line1} ${line2 || ''}, ${city} ${postal_code}, ${country}`.trim();
  }
}