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
  totalOrders: number;
  totalSpent: number; // In centesimi
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: "manual" | "order" | "quote";
  };
}

export interface CustomerWithOrders extends CustomerDocument {
  orderDetails?: Array<{
    orderId: string;
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
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: CustomerAddress;
}
