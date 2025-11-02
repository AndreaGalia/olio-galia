import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface DashboardStats {
  // Stats base (esistenti)
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;

  // Stats ieri per calcolo trend
  ordersYesterday: number;
  revenueYesterday: number;

  // Alerts & Priorità
  pendingOrdersCount: number;
  lowStockProductsCount: number;
  pendingQuotesCount: number;

  // Ordini recenti (ultimi 5)
  recentOrders: RecentOrder[];

  // Top prodotti
  topProducts: TopProduct[];

  // Vendite ultimi 7 giorni
  salesLast7Days: DailySales[];

  // Clienti nuovi (ultimo mese)
  newCustomersCount: number;
  recentCustomers: RecentCustomer[];

  // Statistiche generali
  totalCustomers: number;
  totalProducts: number;
}

export interface RecentOrder {
  id: string;
  orderId: string;
  customerName: string;
  total: number;
  itemCount: number;
  status: string;
  shippingStatus: string;
  createdAt: Date;
  type: 'order' | 'quote';
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  image?: string;
}

export interface DailySales {
  date: string; // YYYY-MM-DD
  orders: number;
  revenue: number;
}

export interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export class DashboardService {
  /**
   * Recupera tutte le statistiche per la dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const db = await getDatabase();

      // Esegui tutte le query in parallelo per performance
      const [
        baseStats,
        yesterdayStats,
        alerts,
        recentOrders,
        topProducts,
        salesLast7Days,
        customerStats,
      ] = await Promise.all([
        this.getBaseStats(db),
        this.getYesterdayStats(db),
        this.getAlerts(db),
        this.getRecentOrders(db),
        this.getTopProducts(db),
        this.getSalesLast7Days(db),
        this.getCustomerStats(db),
      ]);

      return {
        ...baseStats,
        ...yesterdayStats,
        ...alerts,
        recentOrders,
        topProducts,
        salesLast7Days,
        ...customerStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Statistiche base (totalOrders, totalRevenue, ordersToday, revenueToday)
   */
  private static async getBaseStats(db: any) {
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ordini totali e oggi
    const [totalOrdersStats, todayOrdersStats] = await Promise.all([
      ordersCollection.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
          },
        },
      ]).toArray(),
      ordersCollection.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            ordersToday: { $sum: 1 },
            revenueToday: { $sum: '$total' },
          },
        },
      ]).toArray(),
    ]);

    // Preventivi totali e oggi
    const [totalFormsStats, todayFormsStats] = await Promise.all([
      formsCollection.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
            'finalPricing.finalTotal': { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            totalForms: { $sum: 1 },
            totalRevenue: { $sum: '$finalPricing.finalTotal' },
          },
        },
      ]).toArray(),
      formsCollection.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
            'finalPricing.finalTotal': { $exists: true },
            updatedAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            formsToday: { $sum: 1 },
            revenueToday: { $sum: '$finalPricing.finalTotal' },
          },
        },
      ]).toArray(),
    ]);

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
  }

  /**
   * Statistiche di ieri per calcolo trend
   */
  private static async getYesterdayStats(db: any) {
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [yesterdayOrdersStats, yesterdayFormsStats] = await Promise.all([
      ordersCollection.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: yesterday, $lt: today },
          },
        },
        {
          $group: {
            _id: null,
            ordersYesterday: { $sum: 1 },
            revenueYesterday: { $sum: '$total' },
          },
        },
      ]).toArray(),
      formsCollection.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
            'finalPricing.finalTotal': { $exists: true },
            updatedAt: { $gte: yesterday, $lt: today },
          },
        },
        {
          $group: {
            _id: null,
            formsYesterday: { $sum: 1 },
            revenueYesterday: { $sum: '$finalPricing.finalTotal' },
          },
        },
      ]).toArray(),
    ]);

    const ordersYesterday = yesterdayOrdersStats[0]?.ordersYesterday || 0;
    const ordersYesterdayRevenue = yesterdayOrdersStats[0]?.revenueYesterday || 0;
    const formsYesterday = yesterdayFormsStats[0]?.formsYesterday || 0;
    const formsYesterdayRevenue = yesterdayFormsStats[0]?.revenueYesterday || 0;

    return {
      ordersYesterday: ordersYesterday + formsYesterday,
      revenueYesterday: ordersYesterdayRevenue + formsYesterdayRevenue,
    };
  }

  /**
   * Alerts: ordini pending, prodotti low stock, preventivi pending
   */
  private static async getAlerts(db: any) {
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');
    const formsCollection = db.collection('forms');

    const [pendingOrdersCount, lowStockProducts, pendingQuotesCount] = await Promise.all([
      // Ordini in attesa di spedizione
      ordersCollection.countDocuments({
        paymentStatus: 'paid',
        $or: [
          { shippingStatus: 'pending' },
          { shippingStatus: { $exists: false } },
        ],
      }),
      // Prodotti con stock < 10
      productsCollection.find({
        'metadata.isActive': true,
        stockQuantity: { $lt: 10, $gte: 0 },
      }).toArray(),
      // Preventivi pending o quote_sent (non gestiti)
      formsCollection.countDocuments({
        status: { $in: ['pending', 'quote_sent'] },
      }),
    ]);

    return {
      pendingOrdersCount,
      lowStockProductsCount: lowStockProducts.length,
      pendingQuotesCount,
    };
  }

  /**
   * Ultimi 5 ordini recenti (solo da MongoDB: ordini + preventivi, no Stripe)
   */
  private static async getRecentOrders(db: any): Promise<RecentOrder[]> {
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    // Ultimi 3 ordini da MongoDB
    const recentOrders = await ordersCollection
      .find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // Ultimi 2 preventivi pagati da MongoDB
    const recentQuotes = await formsCollection
      .find({
        status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
      })
      .sort({ updatedAt: -1 })
      .limit(2)
      .toArray();

    const orders: RecentOrder[] = recentOrders.map((order: any) => ({
      id: order._id.toString(),
      orderId: order.orderId || order.sessionId || order._id.toString(),
      customerName: order.customer?.name || order.customerName || 'N/D',
      total: order.total || 0,
      itemCount: order.items?.length || 0,
      status: order.paymentStatus || 'paid',
      shippingStatus: order.shippingStatus || 'pending',
      createdAt: order.createdAt || new Date(),
      type: 'order' as const,
    }));

    const quotes: RecentOrder[] = recentQuotes.map((form: any) => ({
      id: form._id.toString(),
      orderId: form.orderId || form._id.toString(),
      customerName: `${form.firstName} ${form.lastName}`,
      total: form.finalPricing?.finalTotal || 0,
      itemCount: form.products?.length || 0,
      status: form.status || 'paid',
      shippingStatus: form.status === 'shipped' ? 'shipped' : 'pending',
      createdAt: form.updatedAt || form.createdAt || new Date(),
      type: 'quote' as const,
    }));

    // Combina e ordina per data (solo dati da MongoDB)
    const combined = [...orders, ...quotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return combined.slice(0, 5);
  }

  /**
   * Top 5 prodotti più venduti
   */
  private static async getTopProducts(db: any): Promise<TopProduct[]> {
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');

    // Aggrega prodotti venduti da ordini
    const topProductsData = await ordersCollection.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.id',
          productName: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]).toArray();

    // Recupera immagini prodotti
    const productIds = topProductsData.map((p: any) => p._id);
    const productsWithImages = await productsCollection
      .find({ id: { $in: productIds } })
      .project({ id: 1, images: 1 })
      .toArray();

    const imageMap = new Map(productsWithImages.map((p: any) => [p.id, p.images?.[0]]));

    return topProductsData.map((product: any) => ({
      productId: product._id,
      productName: product.productName || 'Prodotto Sconosciuto',
      quantity: product.quantity,
      revenue: product.revenue,
      image: imageMap.get(product._id),
    }));
  }

  /**
   * Vendite ultimi 7 giorni
   */
  private static async getSalesLast7Days(db: any): Promise<DailySales[]> {
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    const dates: DailySales[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateString = date.toISOString().split('T')[0];

      // Ordini del giorno
      const [ordersStats, formsStats] = await Promise.all([
        ordersCollection.aggregate([
          {
            $match: {
              paymentStatus: 'paid',
              createdAt: { $gte: date, $lt: nextDate },
            },
          },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              revenue: { $sum: '$total' },
            },
          },
        ]).toArray(),
        formsCollection.aggregate([
          {
            $match: {
              status: { $in: ['paid', 'in_preparazione', 'shipped', 'confermato', 'delivered'] },
              'finalPricing.finalTotal': { $exists: true },
              updatedAt: { $gte: date, $lt: nextDate },
            },
          },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              revenue: { $sum: '$finalPricing.finalTotal' },
            },
          },
        ]).toArray(),
      ]);

      const ordersCount = (ordersStats[0]?.orders || 0) + (formsStats[0]?.orders || 0);
      const revenue = (ordersStats[0]?.revenue || 0) + (formsStats[0]?.revenue || 0);

      dates.push({
        date: dateString,
        orders: ordersCount,
        revenue,
      });
    }

    return dates;
  }

  /**
   * Statistiche clienti
   */
  private static async getCustomerStats(db: any) {
    const customersCollection = db.collection('customers');
    const ordersCollection = db.collection('orders');
    const formsCollection = db.collection('forms');

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [totalCustomers, newCustomers, recentCustomersList] = await Promise.all([
      customersCollection.countDocuments(),
      customersCollection.countDocuments({
        'metadata.createdAt': { $gte: lastMonth },
      }),
      customersCollection
        .find()
        .sort({ 'metadata.createdAt': -1 })
        .limit(5)
        .toArray(),
    ]);

    // Calcola totalOrders e totalSpent per ogni cliente recente
    const recentCustomers: RecentCustomer[] = await Promise.all(
      recentCustomersList.map(async (customer: any) => {
        const orderIds = customer.orders || [];

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
        const ordersTotal = orders.reduce((sum: number, order: any) => {
          const totalInEuros = order.total || order.pricing?.total || 0;
          return sum + Math.round(totalInEuros * 100);
        }, 0);

        // Calcola totale preventivi (in centesimi)
        const quotesTotal = quotes.reduce((sum: number, quote: any) => {
          const totalInEuros = quote.finalPricing?.finalTotal || 0;
          return sum + Math.round(totalInEuros * 100);
        }, 0);

        return {
          id: customer._id.toString(),
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          totalOrders: orders.length + quotes.length,
          totalSpent: ordersTotal + quotesTotal,
          createdAt: customer.metadata?.createdAt || new Date(),
        };
      })
    );

    return {
      totalCustomers,
      newCustomersCount: newCustomers,
      recentCustomers,
      totalProducts: 0, // Placeholder, aggiungiamo dopo
    };
  }
}
