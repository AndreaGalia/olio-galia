import { ObjectId } from 'mongodb';

/**
 * Documento MongoDB per template email
 */
export interface EmailTemplateDocument {
  _id?: ObjectId;
  templateKey: string; // 'order_confirmation', 'shipping_notification', etc.
  name: string; // "Conferma Ordine", "Notifica Spedizione"
  isSystem: boolean; // true per i template base (non eliminabili)
  translations: {
    it: {
      subject: string; // Oggetto email
      htmlBody: string; // Corpo HTML dell'email
    };
    en: {
      subject: string;
      htmlBody: string;
    };
  };
  availableVariables: string[]; // ['customerName', 'orderNumber', ...]
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}

/**
 * Input per creazione nuovo template
 */
export interface CreateEmailTemplateInput {
  templateKey: string;
  name: string;
  subjectIT: string;
  htmlBodyIT: string;
  subjectEN: string;
  htmlBodyEN: string;
  availableVariables?: string[];
}

/**
 * Input per aggiornamento template esistente
 */
export interface UpdateEmailTemplateInput {
  name?: string;
  subjectIT?: string;
  htmlBodyIT?: string;
  subjectEN?: string;
  htmlBodyEN?: string;
  availableVariables?: string[];
  isActive?: boolean;
}

/**
 * Template keys di sistema (non eliminabili)
 */
export const SYSTEM_TEMPLATE_KEYS = [
  'order_confirmation',
  'shipping_notification',
  'delivery_notification',
  'quote_email',
  'review_request',
  'newsletter_welcome',
] as const;

export type SystemTemplateKey = typeof SYSTEM_TEMPLATE_KEYS[number];

/**
 * Variabili disponibili per ogni tipo di template
 * Usate per sostituire {{variabile}} con valori reali
 */
export const TEMPLATE_VARIABLES: Record<string, string[]> = {
  order_confirmation: [
    'logoUrl',
    'customerName',
    'orderNumber',
    'orderDate',
    'items',
    'subtotal',
    'shipping',
    'total',
    'shippingAddress',
    'receiptUrl',
    'hasInvoice'
  ],
  shipping_notification: [
    'logoUrl',
    'customerName',
    'orderNumber',
    'shippingTrackingId',
    'shippingCarrier',
    'expectedDelivery'
  ],
  delivery_notification: [
    'logoUrl',
    'customerName',
    'orderNumber',
    'shippingTrackingId',
    'deliveryDate',
    'feedbackUrl'
  ],
  quote_email: [
    'logoUrl',
    'customerName',
    'orderId',
    'items',
    'subtotal',
    'shipping',
    'total',
    'customerEmail',
    'customerPhone',
    'iban',
    'beneficiary',
    'supportEmail',
    'supportPhone'
  ],
  review_request: [
    'logoUrl',
    'customerName',
    'orderNumber',
    'orderType',
    'feedbackUrl'
  ],
  newsletter_welcome: [
    'logoUrl',
    'firstName',
    'lastName',
    'email',
    'siteUrl'
  ],
};

/**
 * Descrizioni variabili per UI
 */
export const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  logoUrl: 'URL pubblico del logo OLIO GALIA',
  customerName: 'Nome completo del cliente',
  orderNumber: 'Numero ordine (es. ORD-12345)',
  orderDate: 'Data ordine formattata',
  items: 'Lista prodotti (HTML)',
  subtotal: 'Subtotale ordine',
  shipping: 'Costo spedizione',
  total: 'Totale ordine',
  shippingAddress: 'Indirizzo di spedizione completo',
  receiptUrl: 'URL ricevuta/fattura',
  hasInvoice: 'Se include fattura (Sì/No)',
  shippingTrackingId: 'ID tracciamento spedizione',
  shippingCarrier: 'Corriere (es. DHL)',
  expectedDelivery: 'Data consegna prevista',
  deliveryDate: 'Data consegna effettiva',
  feedbackUrl: 'URL pagina feedback',
  orderId: 'ID preventivo',
  customerEmail: 'Email cliente',
  customerPhone: 'Telefono cliente',
  orderType: 'Tipo (order/quote)',
  firstName: 'Nome',
  lastName: 'Cognome',
  email: 'Email',
  siteUrl: 'URL sito web',
  iban: 'IBAN per bonifico bancario',
  beneficiary: 'Intestatario conto bancario',
  supportEmail: 'Email assistenza/contatto aziendale',
  supportPhone: 'Telefono assistenza/contatto aziendale',
};

/**
 * Nomi visualizzati per i template di sistema
 */
export const TEMPLATE_NAMES: Record<SystemTemplateKey, string> = {
  order_confirmation: 'Conferma Ordine',
  shipping_notification: 'Notifica Spedizione',
  delivery_notification: 'Notifica Consegna',
  quote_email: 'Email Preventivo',
  review_request: 'Richiesta Recensione',
  newsletter_welcome: 'Benvenuto Newsletter',
};
