import { ObjectId } from "mongodb";

/**
 * Singolo pagamento effettuato al venditore
 */
export interface Payment {
  _id?: ObjectId;
  amount: number; // Importo in centesimi
  date: Date;
  notes?: string;
  createdAt: Date;
}

/**
 * Documento MongoDB per Venditori
 */
export interface SellerDocument {
  _id?: ObjectId;
  name: string; // Nome completo venditore
  phone: string; // Numero di telefono
  email: string; // Email (unique, lowercase)
  commissionPercentage: number; // % di guadagno (es. 10 = 10%)
  quotes: string[]; // Array di quote IDs (MongoDB _id come stringa)
  payments: Payment[]; // Array di pagamenti ricevuti
  metadata: {
    isActive: boolean; // Soft delete flag
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Interfaccia estesa con statistiche calcolate
 */
export interface SellerWithStats extends SellerDocument {
  totalSales: number; // Totale vendite confermato in centesimi
  totalCommission: number; // Totale commissioni dovute in centesimi
  totalPaid: number; // Totale già pagato in centesimi
  totalUnpaid: number; // Totale ancora da pagare in centesimi
  confirmedQuotesCount: number; // Numero preventivi confermati
}

/**
 * Input per creazione venditore
 */
export interface CreateSellerInput {
  name: string;
  phone: string;
  email: string;
  commissionPercentage: number;
}

/**
 * Input per aggiornamento venditore
 */
export interface UpdateSellerInput {
  name?: string;
  phone?: string;
  email?: string;
  commissionPercentage?: number;
}

/**
 * Input per aggiungere un pagamento
 */
export interface AddPaymentInput {
  amount: number; // Importo in centesimi
  date: Date;
  notes?: string;
}

/**
 * Dettaglio preventivo per pagina venditore
 */
export interface QuoteDetail {
  _id: string; // MongoDB _id
  orderId: string; // orderId del preventivo
  customerName: string;
  customerEmail: string;
  total: number; // Totale in centesimi
  commission: number; // Commissione in centesimi per questo preventivo
  status: string;
  createdAt: Date;
  confirmedAt?: Date;
}

/**
 * Interfaccia completa venditore con dettagli preventivi
 */
export interface SellerWithDetails extends SellerWithStats {
  quoteDetails: QuoteDetail[];
}
