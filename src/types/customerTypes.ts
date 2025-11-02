import { ObjectId } from "mongodb";

export interface CustomerAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  province?: string;
}

export interface CustomerDocument {
  _id?: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: CustomerAddress;
  orders: string[]; // Array di orderIds
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: "manual" | "order" | "quote" | "newsletter";
  };
}

// Interfaccia estesa con campi calcolati
export interface CustomerWithStats extends CustomerDocument {
  totalOrders: number;
  totalSpent: number; // In centesimi
}

export interface CustomerWithOrders extends CustomerDocument {
  orderDetails?: Array<{
    orderId: string;
    mongoId: string; // _id di MongoDB per navigazione admin
    date: Date;
    total: number;
    status: string;
    items: number;
    type?: 'order' | 'quote';
  }>;
}

export interface CreateCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: CustomerAddress;
  source?: "manual" | "order" | "quote" | "newsletter";
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: CustomerAddress;
}
