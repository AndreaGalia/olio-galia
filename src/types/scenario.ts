import { ObjectId } from 'mongodb';

/**
 * Costo generico (dominio, hosting, pubblicità, packaging, ecc.)
 */
export interface CostItem {
  id: string;
  name: string;
  amount: number; // in centesimi (es. 5000 = €50.00)
  description?: string;
}

/**
 * Costo per prodotto specifico
 */
export interface ProductCost {
  id: string; // ID unico generato (non legato a products collection)
  productName: string;
  unitCost: number; // costo unitario in centesimi
  quantity: number; // quantità acquistata/prodotta
  totalCost: number; // unitCost * quantity
}

/**
 * Stima di vendita per prodotto
 */
export interface SalesEstimate {
  productId: string; // ID del ProductCost corrispondente
  productName: string;
  estimatedQuantity: number; // quantità che si stima di vendere
}

/**
 * Prezzo di vendita per prodotto
 */
export interface ProductPricing {
  productId: string; // ID del ProductCost corrispondente
  productName: string;
  sellingPrice: number; // prezzo di vendita unitario in centesimi
}

/**
 * Calcoli automatici del scenario
 */
export interface ScenarioCalculations {
  // Costi
  totalVariousCosts: number; // somma di tutti i CostItem
  totalProductCosts: number; // somma di tutti i ProductCost
  totalCosts: number; // totalVariousCosts + totalProductCosts

  // Ricavi
  expectedRevenue: number; // somma di (sellingPrice * estimatedQuantity) per ogni prodotto

  // Guadagno
  expectedProfit: number; // expectedRevenue - totalCosts
  profitMargin: number; // (expectedProfit / expectedRevenue) * 100 (percentuale)

  // ROI
  roi: number; // (expectedProfit / totalCosts) * 100 (percentuale)
}

/**
 * Documento completo dello scenario (MongoDB)
 */
export interface ScenarioDocument {
  _id?: ObjectId;
  name: string;
  description?: string;

  // Dati inseriti dall'utente
  variousCosts: CostItem[]; // costi vari
  productCosts: ProductCost[]; // costi prodotti
  salesEstimates: SalesEstimate[]; // stime vendita
  productPricing: ProductPricing[]; // prezzi vendita

  // Calcoli automatici
  calculations: ScenarioCalculations;

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean; // scenario attivo/archiviato
  };
}

/**
 * Dati per creare un nuovo scenario
 */
export interface CreateScenarioData {
  name: string;
  description?: string;
  variousCosts: CostItem[];
  productCosts: ProductCost[];
  salesEstimates: SalesEstimate[];
  productPricing: ProductPricing[];
}

/**
 * Dati per aggiornare uno scenario esistente
 */
export interface UpdateScenarioData {
  name?: string;
  description?: string;
  variousCosts?: CostItem[];
  productCosts?: ProductCost[];
  salesEstimates?: SalesEstimate[];
  productPricing?: ProductPricing[];
  metadata?: {
    isActive?: boolean;
  };
}

/**
 * Risposta API con scenario
 */
export interface ScenarioResponse {
  success: boolean;
  scenario?: ScenarioDocument;
  scenarios?: ScenarioDocument[];
  error?: string;
}

/**
 * Statistiche comparative tra scenari
 */
export interface ScenarioComparison {
  scenarioId: string;
  scenarioName: string;
  totalCosts: number;
  expectedRevenue: number;
  expectedProfit: number;
  profitMargin: number;
  roi: number;
}
