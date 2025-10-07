import { getDatabase } from '@/lib/mongodb';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export interface AdminUser {
  _id?: string;
  email: string;
  password: string;
  role: 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface AdminLogin {
  email: string;
  password: string;
}

export class AdminService {
  private static COLLECTION_NAME = 'admin_users';

  // Crea un admin (da usare solo per setup iniziale)
  static async createAdmin(email: string, password: string): Promise<string> {
    try {
      const db = await getDatabase();
      const collection = db.collection<AdminUser>(this.COLLECTION_NAME);

      // Controlla se esiste già
      const existingAdmin = await collection.findOne({ email });
      if (existingAdmin) {
        throw new Error('Admin già esistente');
      }

      const hashedPassword = await hashPassword(password);
      const adminUser: AdminUser = {
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      };

      const result = await collection.insertOne(adminUser);
      return result.insertedId.toString();
    } catch (error) {
      throw error;
    }
  }

  // Login admin
  static async loginAdmin(credentials: AdminLogin): Promise<AdminUser | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection<AdminUser>(this.COLLECTION_NAME);

      const admin = await collection.findOne({ email: credentials.email });
      if (!admin) {
        return null;
      }

      const isValidPassword = await verifyPassword(credentials.password, admin.password);
      if (!isValidPassword) {
        return null;
      }

      // Aggiorna lastLogin
      await collection.updateOne(
        { _id: admin._id },
        { $set: { lastLogin: new Date() } }
      );

      return admin;
    } catch (error) {
      throw error;
    }
  }

  // Recupera admin by ID
  static async getAdminById(adminId: string): Promise<AdminUser | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection<AdminUser>(this.COLLECTION_NAME);
      
      const { ObjectId } = require('mongodb');
      const admin = await collection.findOne({ _id: new ObjectId(adminId) });

      return admin;
    } catch (error) {
      return null;
    }
  }
}