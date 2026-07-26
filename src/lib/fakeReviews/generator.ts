// lib/fakeReviews/generator.ts
// Logica di generazione recensioni fittizie (pura, usabile anche client-side per l'anteprima).

import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  SURNAMES,
  EMAIL_DOMAINS,
  COMMENT_POOLS_BY_TYPE,
  CommentPoolType,
} from './pools';

export type { CommentPoolType };

/** Distribuzione stelle: quante recensioni per ciascun rating (1-5) */
export type StarDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export interface GenerateConfig {
  productId: string;
  productName: string;
  distribution: StarDistribution;
  anonymousPercent: number; // 0-100
  monthsBack: number;       // distribuisci le date negli ultimi N mesi
  poolType: CommentPoolType; // 'food' (olio EVO) o 'beauty' (cosmetici)
}

export interface GeneratedReview {
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  customerName: string;
  customerEmail: string;
  isAnonymous: boolean;
  createdAt: string; // ISO string
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function removeAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Probabilità di nome femminile per tipo di pool: i prodotti beauty
// hanno un pubblico prevalentemente femminile, l'olio alimentare è bilanciato
const FEMALE_NAME_PROBABILITY: Record<CommentPoolType, number> = {
  food: 0.5,
  beauty: 0.8,
};

/** Genera un nome cliente in uno dei formati tipici delle recensioni reali */
function generateCustomerName(poolType: CommentPoolType): { name: string; email: string } {
  const useFemale = Math.random() < FEMALE_NAME_PROBABILITY[poolType];
  const first = pick(useFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
  const last = pick(SURNAMES);
  const format = randomInt(1, 4);

  let name: string;
  switch (format) {
    case 1: // "Marco R."
      name = `${first} ${last.charAt(0)}.`;
      break;
    case 2: // "Marco Rossi"
      name = `${first} ${last}`;
      break;
    case 3: // "Marco72"
      name = `${first}${randomInt(55, 95)}`;
      break;
    default: // solo nome
      name = first;
      break;
  }

  const emailLocal = removeAccents(`${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, ''));
  const email = `${emailLocal}${randomInt(1, 99)}@${pick(EMAIL_DOMAINS)}`;

  return { name, email };
}

/** Data casuale negli ultimi `monthsBack` mesi */
function generateDate(monthsBack: number): Date {
  const now = Date.now();
  const start = new Date();
  start.setMonth(start.getMonth() - Math.max(1, monthsBack));
  const timestamp = randomInt(start.getTime(), now - 1000 * 60 * 60); // almeno 1h fa
  const date = new Date(timestamp);
  // Orari plausibili (8:00 - 23:00)
  date.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
}

/** Genera un commento per il rating dato, evitando i commenti già usati se possibile */
export function generateComment(
  rating: number,
  productName: string,
  poolType: CommentPoolType = 'food',
  used: Set<string> = new Set()
): string {
  const pools = COMMENT_POOLS_BY_TYPE[poolType] || COMMENT_POOLS_BY_TYPE.food;
  const pool = pools[rating] || pools[5];
  const available = pool.filter((c) => !used.has(c));
  const template = pick(available.length > 0 ? available : pool);
  used.add(template);
  return template.replace(/\{prodotto\}/g, productName);
}

/**
 * Genera le recensioni per un prodotto in base alla configurazione.
 * Nomi e commenti non si ripetono all'interno dello stesso prodotto (finché il pool lo consente).
 */
export function generateReviewsForProduct(config: GenerateConfig): GeneratedReview[] {
  const { productId, productName, distribution, anonymousPercent, monthsBack, poolType } = config;
  const reviews: GeneratedReview[] = [];
  const usedComments = new Set<string>();
  const usedNames = new Set<string>();

  const ratings: number[] = [];
  ([5, 4, 3, 2, 1] as const).forEach((star) => {
    const count = Math.max(0, Math.floor(distribution[star] || 0));
    for (let i = 0; i < count; i++) ratings.push(star);
  });

  // Mischia i rating così le date non risultano ordinate per stelle
  for (const rating of shuffle(ratings)) {
    let person = generateCustomerName(poolType);
    let attempts = 0;
    while (usedNames.has(person.name) && attempts < 20) {
      person = generateCustomerName(poolType);
      attempts++;
    }
    usedNames.add(person.name);

    reviews.push({
      productId,
      productName,
      rating,
      comment: generateComment(rating, productName, poolType, usedComments),
      customerName: person.name,
      customerEmail: person.email,
      isAnonymous: Math.random() * 100 < anonymousPercent,
      createdAt: generateDate(monthsBack).toISOString(),
    });
  }

  // Ordina per data decrescente per un'anteprima più leggibile
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return reviews;
}

export function totalFromDistribution(distribution: StarDistribution): number {
  return ([1, 2, 3, 4, 5] as const).reduce((sum, star) => sum + Math.max(0, Math.floor(distribution[star] || 0)), 0);
}
