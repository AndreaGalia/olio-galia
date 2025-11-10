import type {
  CostItem,
  ProductCost,
  SalesEstimate,
  ProductPricing,
  ScenarioCalculations,
} from '@/types/scenario';

/**
 * Calcola automaticamente tutti i dati finanziari del scenario
 */
export function calculateScenario(
  variousCosts: CostItem[],
  productCosts: ProductCost[],
  salesEstimates: SalesEstimate[],
  productPricing: ProductPricing[]
): ScenarioCalculations {
  // Calcola totale costi vari
  const totalVariousCosts = variousCosts.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );

  // Calcola totale costi prodotti
  const totalProductCosts = productCosts.reduce(
    (sum, cost) => sum + cost.totalCost,
    0
  );

  // Totale costi
  const totalCosts = totalVariousCosts + totalProductCosts;

  // Calcola fatturato previsto
  // Per ogni prodotto: prezzo vendita × quantità stimata
  let expectedRevenue = 0;

  for (const estimate of salesEstimates) {
    const pricing = productPricing.find(
      (p) => p.productId === estimate.productId
    );

    if (pricing) {
      expectedRevenue += pricing.sellingPrice * estimate.estimatedQuantity;
    }
  }

  // Guadagno previsto
  const expectedProfit = expectedRevenue - totalCosts;

  // Margine di profitto (%)
  const profitMargin =
    expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0;

  // ROI - Return on Investment (%)
  const roi = totalCosts > 0 ? (expectedProfit / totalCosts) * 100 : 0;

  return {
    totalVariousCosts,
    totalProductCosts,
    totalCosts,
    expectedRevenue,
    expectedProfit,
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
  };
}

/**
 * Calcola il costo totale di un prodotto
 */
export function calculateProductTotalCost(
  unitCost: number,
  quantity: number
): number {
  return unitCost * quantity;
}

/**
 * Formatta un importo in centesimi in euro
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100);
}

/**
 * Formatta una percentuale
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Valida i dati del scenario
 */
export function validateScenarioData(data: {
  variousCosts: CostItem[];
  productCosts: ProductCost[];
  salesEstimates: SalesEstimate[];
  productPricing: ProductPricing[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Valida costi vari
  data.variousCosts.forEach((cost, index) => {
    if (!cost.name || cost.name.trim() === '') {
      errors.push(`Costo vario ${index + 1}: nome mancante`);
    }
    if (cost.amount < 0) {
      errors.push(`Costo vario ${index + 1}: importo negativo`);
    }
  });

  // Valida costi prodotti
  data.productCosts.forEach((cost, index) => {
    if (!cost.id) {
      errors.push(`Costo prodotto ${index + 1}: ID mancante`);
    }
    if (!cost.productName || cost.productName.trim() === '') {
      errors.push(`Costo prodotto ${index + 1}: nome prodotto mancante`);
    }
    if (cost.unitCost < 0) {
      errors.push(`Costo prodotto ${index + 1}: costo unitario negativo`);
    }
    if (cost.quantity <= 0) {
      errors.push(`Costo prodotto ${index + 1}: quantità deve essere > 0`);
    }
  });

  // Valida stime vendita
  data.salesEstimates.forEach((estimate, index) => {
    if (!estimate.productId) {
      errors.push(`Stima vendita ${index + 1}: ID prodotto mancante`);
    }
    if (estimate.estimatedQuantity < 0) {
      errors.push(`Stima vendita ${index + 1}: quantità negativa`);
    }
  });

  // Valida prezzi vendita
  data.productPricing.forEach((pricing, index) => {
    if (!pricing.productId) {
      errors.push(`Prezzo vendita ${index + 1}: ID prodotto mancante`);
    }
    if (pricing.sellingPrice <= 0) {
      errors.push(`Prezzo vendita ${index + 1}: prezzo deve essere > 0`);
    }
  });

  // Verifica coerenza: ogni prodotto in productCosts deve avere stima e prezzo
  const productIds = new Set(data.productCosts.map((p) => p.id));
  const estimateIds = new Set(data.salesEstimates.map((e) => e.productId));
  const pricingIds = new Set(data.productPricing.map((p) => p.productId));

  productIds.forEach((id) => {
    if (!estimateIds.has(id)) {
      errors.push(`Prodotto ${id}: mancante stima di vendita`);
    }
    if (!pricingIds.has(id)) {
      errors.push(`Prodotto ${id}: mancante prezzo di vendita`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
