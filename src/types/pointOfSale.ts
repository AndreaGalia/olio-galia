// types/pointOfSale.ts
import { ObjectId } from 'mongodb';

/* -------------------------------------------------------------------------- */
/*                                 Categorie                                   */
/* -------------------------------------------------------------------------- */

export interface POSCategoryTranslation {
  name: string;
  description?: string;
}

/** Categoria di punto vendita (supermercato, macelleria, mercato, ...) */
export interface POSCategoryDocument {
  _id?: ObjectId;
  id: string; // slug stabile, es. 'supermercato' — referenziato da PointOfSaleDocument.categoryId
  translations: {
    it: POSCategoryTranslation;
    en: POSCategoryTranslation;
  };
  icon?: string; // nome icona lucide-react, es. 'ShoppingCart'
  displayOrder: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}

export interface CreatePOSCategoryInput {
  nameIT: string;
  nameEN: string;
  descriptionIT?: string;
  descriptionEN?: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdatePOSCategoryInput {
  nameIT?: string;
  nameEN?: string;
  descriptionIT?: string;
  descriptionEN?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Punti vendita                                  */
/* -------------------------------------------------------------------------- */

export interface PointOfSaleAddress {
  street: string;
  city: string;
  province: string; // sigla, es. 'CT'
  postalCode?: string;
  country: string; // ISO 2 lettere, default 'IT'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PointOfSaleDocument {
  _id?: ObjectId;
  slug: string; // usato dal deep link ?punto=<slug>
  name: string; // nome insegna — non tradotto
  categoryId: string; // ref a POSCategoryDocument.id
  address: PointOfSaleAddress;
  coordinates: Coordinates;
  productIds: string[]; // prodotti disponibili in questo punto vendita
  notes?: {
    it: string;
    en: string;
  };
  displayOrder?: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}

export interface CreatePointOfSaleInput {
  name: string;
  categoryId: string;
  address: PointOfSaleAddress;
  coordinates: Coordinates;
  productIds?: string[];
  notesIT?: string;
  notesEN?: string;
  displayOrder?: number;
}

export interface UpdatePointOfSaleInput {
  name?: string;
  categoryId?: string;
  address?: PointOfSaleAddress;
  coordinates?: Coordinates;
  productIds?: string[];
  notesIT?: string;
  notesEN?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            Payload lato client                              */
/* -------------------------------------------------------------------------- */

/** Prodotto in forma ridotta, per i chip nella card del punto vendita */
export interface POSProductRef {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

/** Punto vendita serializzato per il client (niente ObjectId, niente Date) */
export interface PointOfSalePublic {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  address: PointOfSaleAddress;
  coordinates: Coordinates;
  products: POSProductRef[];
  notes?: string; // già localizzato
  displayOrder?: number;
}

/** Categoria serializzata per il client */
export interface POSCategoryPublic {
  id: string;
  name: string; // già localizzato
  description?: string; // già localizzato
  icon?: string;
  displayOrder: number;
  count: number; // numero di punti vendita attivi in questa categoria
}

export interface PointsOfSaleResponse {
  pointsOfSale: PointOfSalePublic[];
  categories: POSCategoryPublic[];
}

/** Punto vendita per l'admin: documento serializzato senza localizzazione */
export interface PointOfSaleAdmin {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  address: PointOfSaleAddress;
  coordinates: Coordinates;
  productIds: string[];
  notes?: { it: string; en: string };
  displayOrder?: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

/** Categoria per l'admin, con conteggio punti vendita associati */
export interface POSCategoryAdmin {
  id: string;
  translations: {
    it: POSCategoryTranslation;
    en: POSCategoryTranslation;
  };
  icon?: string;
  displayOrder: number;
  pointOfSaleCount: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

/* -------------------------------------------------------------------------- */
/*                                Geocoding                                    */
/* -------------------------------------------------------------------------- */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}
