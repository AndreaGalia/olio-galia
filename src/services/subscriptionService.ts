// services/subscriptionService.ts
import { getDatabase } from '@/lib/mongodb';
import { SubscriptionDocument, SubscriptionStatus, SubscriptionInterval, ShippingZone, PortalTokenDocument } from '@/types/subscription';
import { WithId, Document } from 'mongodb';
import crypto from 'crypto';

export class SubscriptionService {
  private static readonly COLLECTION_NAME = 'subscriptions';
  private static readonly TOKENS_COLLECTION = 'portal_tokens';

  private static mongoToSubscription(doc: WithId<Document>): SubscriptionDocument {
    const { _id, ...data } = doc;
    return {
      _id: _id.toString(),
      stripeSubscriptionId: data.stripeSubscriptionId || '',
      stripeCustomerId: data.stripeCustomerId || '',
      stripePriceId: data.stripePriceId || '',
      productId: data.productId || '',
      productName: data.productName || '',
      customerEmail: data.customerEmail || '',
      customerName: data.customerName || '',
      shippingZone: data.shippingZone || 'italia',
      interval: data.interval || 'month',
      status: data.status || 'active',
      portalAccessToken: data.portalAccessToken,
      shippingAddress: data.shippingAddress,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      canceledAt: data.canceledAt,
    } as SubscriptionDocument;
  }

  static async createSubscription(data: Omit<SubscriptionDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);

    const doc = {
      ...data,
      portalAccessToken: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId.toString();
  }

  static async subscriptionExists(stripeSubscriptionId: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);
    const count = await collection.countDocuments({ stripeSubscriptionId });
    return count > 0;
  }

  static async updateSubscriptionStatus(stripeSubscriptionId: string, status: SubscriptionStatus, extra?: Record<string, unknown>): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      ...extra,
    };

    if (status === 'canceled') {
      updateData.canceledAt = new Date();
    }

    const result = await collection.updateOne(
      { stripeSubscriptionId },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  static async findByEmail(email: string): Promise<SubscriptionDocument[]> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);

    const docs = await collection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(doc => this.mongoToSubscription(doc));
  }

  static async getAllSubscriptions(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; zone?: string }
  ): Promise<{ subscriptions: SubscriptionDocument[]; total: number; hasMore: boolean }> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);

    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.zone) query.shippingZone = filters.zone;

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    return {
      subscriptions: docs.map(doc => this.mongoToSubscription(doc)),
      total,
      hasMore: skip + docs.length < total,
    };
  }

  static async getStats(): Promise<{
    total: number;
    active: number;
    canceled: number;
    byZone: Record<string, number>;
    byInterval: Record<string, number>;
  }> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);

    const [total, active, canceled, zoneAgg, intervalAgg] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ status: 'active' }),
      collection.countDocuments({ status: 'canceled' }),
      collection.aggregate([
        { $group: { _id: '$shippingZone', count: { $sum: 1 } } },
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$interval', count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    const byZone: Record<string, number> = {};
    for (const z of zoneAgg) {
      byZone[z._id as string] = z.count;
    }

    const byInterval: Record<string, number> = {};
    for (const i of intervalAgg) {
      byInterval[i._id as string] = i.count;
    }

    return { total, active, canceled, byZone, byInterval };
  }

  static async findByPortalToken(token: string): Promise<SubscriptionDocument | null> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);
    const doc = await collection.findOne({
      portalAccessToken: token,
      status: { $ne: 'canceled' },
    });
    return doc ? this.mongoToSubscription(doc) : null;
  }

  static async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionDocument | null> {
    const db = await getDatabase();
    const collection = db.collection(this.COLLECTION_NAME);
    const doc = await collection.findOne({ stripeSubscriptionId });
    return doc ? this.mongoToSubscription(doc) : null;
  }

  static async saveTemporaryToken(email: string, stripeCustomerId: string, token: string, expiresAt: Date): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection(this.TOKENS_COLLECTION);
    await collection.insertOne({
      token,
      stripeCustomerId,
      customerEmail: email.toLowerCase().trim(),
      used: false,
      expiresAt,
      createdAt: new Date(),
    } satisfies Omit<PortalTokenDocument, '_id'>);
  }

  static async findAndUseTemporaryToken(token: string): Promise<PortalTokenDocument | null> {
    const db = await getDatabase();
    const collection = db.collection(this.TOKENS_COLLECTION);
    const doc = await collection.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!doc) return null;
    await collection.updateOne({ _id: doc._id }, { $set: { used: true } });
    return {
      _id: doc._id.toString(),
      token: doc.token,
      stripeCustomerId: doc.stripeCustomerId,
      customerEmail: doc.customerEmail,
      used: true,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }

  static async countRecentTokenRequests(email: string, minutes: number): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection(this.TOKENS_COLLECTION);
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return collection.countDocuments({
      customerEmail: email.toLowerCase().trim(),
      createdAt: { $gte: since },
    });
  }
}
