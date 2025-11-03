// types/feedback.ts

import { ObjectId } from 'mongodb';

/**
 * Documento Feedback in MongoDB
 */
export interface FeedbackDocument {
  _id?: ObjectId;
  orderId: string;             // ID dell'ordine/preventivo MongoDB
  productId?: string;          // ID del prodotto (opzionale per retrocompatibilità)
  productName: string;         // Nome del prodotto
  rating: number;              // Valutazione da 1 a 5 stelle
  comment: string;             // Commento del cliente (max 500 caratteri)
  customerEmail: string;       // Email del cliente
  customerName: string;        // Nome del cliente
  orderType: 'order' | 'quote'; // Tipo: ordine o preventivo
  createdAt: Date;             // Data creazione feedback
}

/**
 * Dati per creare un nuovo feedback
 */
export interface CreateFeedbackData {
  orderId: string;
  productId?: string;
  productName: string;
  rating: number;
  comment: string;
  customerEmail: string;
  customerName: string;
  orderType: 'order' | 'quote';
}

/**
 * Feedback singolo prodotto (per batch submit)
 */
export interface ProductFeedbackData {
  productId?: string;
  productName: string;
  rating: number;
  comment: string;
}

/**
 * Batch di feedback multipli per un ordine
 */
export interface BatchFeedbackData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderType: 'order' | 'quote';
  feedbacks: ProductFeedbackData[];
}

/**
 * Risposta API feedback
 */
export interface FeedbackResponse {
  success: boolean;
  message?: string;
  feedback?: FeedbackDocument;
  error?: string;
}

/**
 * Verifica esistenza feedback
 */
export interface FeedbackExistsResponse {
  exists: boolean;
  feedbacks?: FeedbackDocument[]; // Array di feedback per prodotti
  allProductsFeedback: boolean; // true se tutti i prodotti hanno feedback
}

/**
 * Dati ordine per pagina feedback
 */
export interface OrderFeedbackInfo {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderType: 'order' | 'quote';
  items: Array<{
    productId?: string | null;
    name: string;
    quantity: number;
  }>;
}
