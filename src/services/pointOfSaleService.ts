// services/pointOfSaleService.ts
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  PointOfSaleDocument,
  POSCategoryDocument,
  CreatePointOfSaleInput,
  UpdatePointOfSaleInput,
  CreatePOSCategoryInput,
  UpdatePOSCategoryInput,
  PointOfSalePublic,
  POSCategoryPublic,
  PointsOfSaleResponse,
  PointOfSaleAdmin,
  POSCategoryAdmin,
  POSProductRef,
  Coordinates,
} from '@/types/pointOfSale';

/** Trasforma una stringa in slug utilizzabile in URL */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // rimuove gli accenti
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export class PointOfSaleService {
  private static readonly COLLECTION_NAME = 'pointsOfSale';
  private static readonly CATEGORY_COLLECTION_NAME = 'pointOfSaleCategories';

  /* ------------------------------------------------------------------ */
  /*                              Helpers                                */
  /* ------------------------------------------------------------------ */

  /**
   * Verifica che le coordinate siano valide.
   * Un punto con coordinate fuori range romperebbe il fitBounds della mappa.
   */
  static isValidCoordinates(coordinates?: Coordinates | null): boolean {
    if (!coordinates) return false;
    const { lat, lng } = coordinates;
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Genera uno slug univoco a partire da nome e città.
   * In caso di collisione aggiunge un suffisso numerico progressivo.
   */
  private static async generateUniqueSlug(
    name: string,
    city: string,
    excludeId?: string
  ): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<PointOfSaleDocument>(this.COLLECTION_NAME);

    const base = slugify(`${name}-${city}`) || 'punto-vendita';
    let slug = base;
    let suffix = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const filter: Record<string, unknown> = { slug };
      if (excludeId) {
        filter._id = { $ne: new ObjectId(excludeId) };
      }
      const existing = await collection.findOne(filter);
      if (!existing) return slug;
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
  }

  /** Recupera i prodotti referenziati dai punti vendita, in forma ridotta */
  private static async getProductRefs(
    productIds: string[],
    locale: 'it' | 'en'
  ): Promise<Map<string, POSProductRef>> {
    const map = new Map<string, POSProductRef>();
    if (productIds.length === 0) return map;

    const db = await getDatabase();
    const products = await db
      .collection('products')
      .find(
        { id: { $in: productIds }, 'metadata.isActive': true },
        { projection: { id: 1, slug: 1, images: 1, 'translations.it.name': 1, 'translations.en.name': 1 } }
      )
      .toArray();

    for (const product of products) {
      const doc = product as unknown as {
        id: string;
        slug?: { it?: string; en?: string };
        images?: string[];
        translations?: { it?: { name?: string }; en?: { name?: string } };
      };

      map.set(doc.id, {
        id: doc.id,
        name: doc.translations?.[locale]?.name || doc.translations?.it?.name || doc.id,
        slug: doc.slug?.[locale] || doc.slug?.it || doc.id,
        image: doc.images?.[0],
      });
    }

    return map;
  }

  /* ------------------------------------------------------------------ */
  /*                          Lettura pubblica                           */
  /* ------------------------------------------------------------------ */

  /**
   * Restituisce punti vendita e categorie attive, già localizzati,
   * in un unico payload pronto per la pagina "Dove trovarci".
   */
  static async getAllPublic(locale: 'it' | 'en' = 'it'): Promise<PointsOfSaleResponse> {
    try {
      const db = await getDatabase();

      const [documents, categoryDocuments] = await Promise.all([
        db
          .collection<PointOfSaleDocument>(this.COLLECTION_NAME)
          .find({ 'metadata.isActive': true })
          .sort({ displayOrder: 1, name: 1 })
          .toArray(),
        db
          .collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME)
          .find({ 'metadata.isActive': true })
          .sort({ displayOrder: 1 })
          .toArray(),
      ]);

      // Scarta i punti con coordinate non valide: non sono mappabili
      const validDocuments = documents.filter(doc => this.isValidCoordinates(doc.coordinates));

      const allProductIds = Array.from(
        new Set(validDocuments.flatMap(doc => doc.productIds || []))
      );
      const productMap = await this.getProductRefs(allProductIds, locale);

      const pointsOfSale: PointOfSalePublic[] = validDocuments.map(doc => ({
        id: doc._id!.toString(),
        slug: doc.slug,
        name: doc.name,
        categoryId: doc.categoryId,
        address: doc.address,
        coordinates: doc.coordinates,
        products: (doc.productIds || [])
          .map(id => productMap.get(id))
          .filter((p): p is POSProductRef => Boolean(p)),
        notes: doc.notes?.[locale] || undefined,
        displayOrder: doc.displayOrder,
      }));

      // Mostra solo le categorie che hanno almeno un punto vendita visibile
      const categories: POSCategoryPublic[] = categoryDocuments
        .map(category => ({
          id: category.id,
          name: category.translations[locale]?.name || category.translations.it.name,
          description:
            category.translations[locale]?.description || category.translations.it.description,
          icon: category.icon,
          displayOrder: category.displayOrder,
          count: pointsOfSale.filter(pos => pos.categoryId === category.id).length,
        }))
        .filter(category => category.count > 0);

      return { pointsOfSale, categories };
    } catch (error) {
      console.error('Error fetching points of sale:', error);
      throw new Error('Impossibile recuperare i punti vendita');
    }
  }

  /* ------------------------------------------------------------------ */
  /*                        Lettura lato admin                           */
  /* ------------------------------------------------------------------ */

  private static serializeAdmin(doc: PointOfSaleDocument): PointOfSaleAdmin {
    return {
      id: doc._id!.toString(),
      slug: doc.slug,
      name: doc.name,
      categoryId: doc.categoryId,
      address: doc.address,
      coordinates: doc.coordinates,
      productIds: doc.productIds || [],
      notes: doc.notes,
      displayOrder: doc.displayOrder,
      metadata: {
        createdAt: doc.metadata.createdAt.toISOString(),
        updatedAt: doc.metadata.updatedAt.toISOString(),
        isActive: doc.metadata.isActive,
      },
    };
  }

  /** Lista admin, con inattivi opzionali e ricerca su nome/città/indirizzo */
  static async getAllAdmin(options?: {
    includeInactive?: boolean;
    search?: string;
    categoryId?: string;
  }): Promise<PointOfSaleAdmin[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection<PointOfSaleDocument>(this.COLLECTION_NAME);

      const filter: Record<string, unknown> = {};

      if (!options?.includeInactive) {
        filter['metadata.isActive'] = true;
      }

      if (options?.categoryId) {
        filter.categoryId = options.categoryId;
      }

      if (options?.search?.trim()) {
        const searchRegex = { $regex: options.search.trim(), $options: 'i' };
        filter.$or = [
          { name: searchRegex },
          { 'address.city': searchRegex },
          { 'address.street': searchRegex },
          { 'address.province': searchRegex },
        ];
      }

      const documents = await collection
        .find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .toArray();

      return documents.map(doc => this.serializeAdmin(doc));
    } catch (error) {
      console.error('Error fetching points of sale for admin:', error);
      throw new Error('Impossibile recuperare i punti vendita');
    }
  }

  static async getById(id: string): Promise<PointOfSaleAdmin | null> {
    try {
      if (!ObjectId.isValid(id)) return null;

      const db = await getDatabase();
      const doc = await db
        .collection<PointOfSaleDocument>(this.COLLECTION_NAME)
        .findOne({ _id: new ObjectId(id) });

      return doc ? this.serializeAdmin(doc) : null;
    } catch (error) {
      console.error('Error fetching point of sale by id:', error);
      throw new Error('Impossibile recuperare il punto vendita');
    }
  }

  /* ------------------------------------------------------------------ */
  /*                        Scrittura punti vendita                      */
  /* ------------------------------------------------------------------ */

  static async create(input: CreatePointOfSaleInput): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<PointOfSaleDocument>(this.COLLECTION_NAME);

    if (!input.name?.trim()) {
      throw new Error('Il nome del punto vendita è obbligatorio');
    }
    if (!input.categoryId?.trim()) {
      throw new Error('La categoria è obbligatoria');
    }
    if (!this.isValidCoordinates(input.coordinates)) {
      throw new Error('Coordinate non valide: latitudine tra -90 e 90, longitudine tra -180 e 180');
    }

    // La categoria deve esistere ed essere attiva
    const category = await db
      .collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME)
      .findOne({ id: input.categoryId, 'metadata.isActive': true });

    if (!category) {
      throw new Error('La categoria selezionata non esiste o non è attiva');
    }

    // Se displayOrder non è specificato, mette il punto in fondo
    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const last = await collection.find({}).sort({ displayOrder: -1 }).limit(1).toArray();
      displayOrder = last.length > 0 ? (last[0].displayOrder || 0) + 1 : 0;
    }

    const slug = await this.generateUniqueSlug(input.name, input.address.city);
    const now = new Date();

    const document: PointOfSaleDocument = {
      slug,
      name: input.name.trim(),
      categoryId: input.categoryId,
      address: {
        street: input.address.street?.trim() || '',
        city: input.address.city?.trim() || '',
        province: input.address.province?.trim().toUpperCase() || '',
        postalCode: input.address.postalCode?.trim() || undefined,
        country: input.address.country?.trim().toUpperCase() || 'IT',
      },
      coordinates: {
        lat: input.coordinates.lat,
        lng: input.coordinates.lng,
      },
      productIds: input.productIds || [],
      notes:
        input.notesIT?.trim() || input.notesEN?.trim()
          ? { it: input.notesIT?.trim() || '', en: input.notesEN?.trim() || '' }
          : undefined,
      displayOrder,
      metadata: {
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    };

    const result = await collection.insertOne(document as PointOfSaleDocument);
    return result.insertedId.toString();
  }

  static async update(id: string, input: UpdatePointOfSaleInput): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID punto vendita non valido');
    }

    const db = await getDatabase();
    const collection = db.collection<PointOfSaleDocument>(this.COLLECTION_NAME);

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      throw new Error('Punto vendita non trovato');
    }

    if (input.coordinates !== undefined && !this.isValidCoordinates(input.coordinates)) {
      throw new Error('Coordinate non valide: latitudine tra -90 e 90, longitudine tra -180 e 180');
    }

    if (input.categoryId !== undefined) {
      const category = await db
        .collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME)
        .findOne({ id: input.categoryId, 'metadata.isActive': true });

      if (!category) {
        throw new Error('La categoria selezionata non esiste o non è attiva');
      }
    }

    const updateData: Record<string, unknown> = {
      'metadata.updatedAt': new Date(),
    };

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new Error('Il nome del punto vendita è obbligatorio');
      }
      updateData.name = input.name.trim();
    }

    if (input.categoryId !== undefined) {
      updateData.categoryId = input.categoryId;
    }

    if (input.address !== undefined) {
      updateData.address = {
        street: input.address.street?.trim() || '',
        city: input.address.city?.trim() || '',
        province: input.address.province?.trim().toUpperCase() || '',
        postalCode: input.address.postalCode?.trim() || undefined,
        country: input.address.country?.trim().toUpperCase() || 'IT',
      };
    }

    if (input.coordinates !== undefined) {
      updateData.coordinates = {
        lat: input.coordinates.lat,
        lng: input.coordinates.lng,
      };
    }

    if (input.productIds !== undefined) {
      updateData.productIds = input.productIds;
    }

    if (input.notesIT !== undefined || input.notesEN !== undefined) {
      const it = input.notesIT !== undefined ? input.notesIT.trim() : existing.notes?.it || '';
      const en = input.notesEN !== undefined ? input.notesEN.trim() : existing.notes?.en || '';
      updateData.notes = it || en ? { it, en } : undefined;
    }

    if (input.displayOrder !== undefined) {
      updateData.displayOrder = input.displayOrder;
    }

    if (input.isActive !== undefined) {
      updateData['metadata.isActive'] = input.isActive;
    }

    // Se cambia nome o città, rigenera lo slug mantenendolo univoco
    const newName = input.name?.trim() ?? existing.name;
    const newCity = input.address?.city?.trim() ?? existing.address.city;
    if (newName !== existing.name || newCity !== existing.address.city) {
      updateData.slug = await this.generateUniqueSlug(newName, newCity, id);
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  }

  /** Soft delete, coerente con FAQ e categorie prodotto */
  static async softDelete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID punto vendita non valido');
    }

    const db = await getDatabase();
    await db.collection<PointOfSaleDocument>(this.COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'metadata.isActive': false,
          'metadata.updatedAt': new Date(),
        },
      }
    );
  }

  /** Inverte lo stato attivo/inattivo e restituisce il nuovo valore */
  static async toggleActive(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID punto vendita non valido');
    }

    const db = await getDatabase();
    const collection = db.collection<PointOfSaleDocument>(this.COLLECTION_NAME);

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      throw new Error('Punto vendita non trovato');
    }

    const newValue = !existing.metadata.isActive;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'metadata.isActive': newValue,
          'metadata.updatedAt': new Date(),
        },
      }
    );

    return newValue;
  }

  /* ------------------------------------------------------------------ */
  /*                             Categorie                               */
  /* ------------------------------------------------------------------ */

  /** Lista categorie per l'admin, con conteggio dei punti vendita associati */
  static async getCategoriesAdmin(includeInactive = true): Promise<POSCategoryAdmin[]> {
    try {
      const db = await getDatabase();
      const filter = includeInactive ? {} : { 'metadata.isActive': true };

      const categories = await db
        .collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME)
        .find(filter)
        .sort({ displayOrder: 1 })
        .toArray();

      return Promise.all(
        categories.map(async category => {
          const pointOfSaleCount = await db
            .collection<PointOfSaleDocument>(this.COLLECTION_NAME)
            .countDocuments({ categoryId: category.id, 'metadata.isActive': true });

          return {
            id: category.id,
            translations: category.translations,
            icon: category.icon,
            displayOrder: category.displayOrder,
            pointOfSaleCount,
            metadata: {
              createdAt: category.metadata.createdAt.toISOString(),
              updatedAt: category.metadata.updatedAt.toISOString(),
              isActive: category.metadata.isActive,
            },
          };
        })
      );
    } catch (error) {
      console.error('Error fetching point of sale categories:', error);
      throw new Error('Impossibile recuperare le categorie');
    }
  }

  static async createCategory(input: CreatePOSCategoryInput): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME);

    if (!input.nameIT?.trim() || !input.nameEN?.trim()) {
      throw new Error('Il nome della categoria è obbligatorio in italiano e in inglese');
    }

    const id = slugify(input.nameIT);
    if (!id) {
      throw new Error('Il nome della categoria non è valido');
    }

    const existing = await collection.findOne({ id });
    if (existing) {
      throw new Error(`Esiste già una categoria con identificativo "${id}"`);
    }

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const last = await collection.find({}).sort({ displayOrder: -1 }).limit(1).toArray();
      displayOrder = last.length > 0 ? (last[0].displayOrder || 0) + 1 : 0;
    }

    const now = new Date();

    await collection.insertOne({
      id,
      translations: {
        it: {
          name: input.nameIT.trim(),
          description: input.descriptionIT?.trim() || undefined,
        },
        en: {
          name: input.nameEN.trim(),
          description: input.descriptionEN?.trim() || undefined,
        },
      },
      icon: input.icon?.trim() || undefined,
      displayOrder,
      metadata: {
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    } as POSCategoryDocument);

    return id;
  }

  static async updateCategory(id: string, input: UpdatePOSCategoryInput): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME);

    const existing = await collection.findOne({ id });
    if (!existing) {
      throw new Error('Categoria non trovata');
    }

    const updateData: Record<string, unknown> = {
      'metadata.updatedAt': new Date(),
    };

    if (input.nameIT !== undefined) {
      if (!input.nameIT.trim()) throw new Error('Il nome italiano è obbligatorio');
      updateData['translations.it.name'] = input.nameIT.trim();
    }
    if (input.nameEN !== undefined) {
      if (!input.nameEN.trim()) throw new Error('Il nome inglese è obbligatorio');
      updateData['translations.en.name'] = input.nameEN.trim();
    }
    if (input.descriptionIT !== undefined) {
      updateData['translations.it.description'] = input.descriptionIT.trim() || undefined;
    }
    if (input.descriptionEN !== undefined) {
      updateData['translations.en.description'] = input.descriptionEN.trim() || undefined;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon.trim() || undefined;
    }
    if (input.displayOrder !== undefined) {
      updateData.displayOrder = input.displayOrder;
    }

    // Disattivare una categoria nasconderebbe i suoi punti vendita dal filtro pubblico
    if (input.isActive !== undefined) {
      if (input.isActive === false) {
        const count = await db
          .collection<PointOfSaleDocument>(this.COLLECTION_NAME)
          .countDocuments({ categoryId: id, 'metadata.isActive': true });

        if (count > 0) {
          throw new Error(
            `Impossibile disattivare la categoria: è associata a ${count} punti vendita attivi`
          );
        }
      }
      updateData['metadata.isActive'] = input.isActive;
    }

    await collection.updateOne({ id }, { $set: updateData });
  }

  /**
   * Elimina definitivamente una categoria.
   * Bloccata se ci sono punti vendita associati, altrimenti resterebbero orfani.
   */
  static async deleteCategory(id: string): Promise<void> {
    const db = await getDatabase();

    const count = await db
      .collection<PointOfSaleDocument>(this.COLLECTION_NAME)
      .countDocuments({ categoryId: id });

    if (count > 0) {
      throw new Error(
        `Impossibile eliminare la categoria: è associata a ${count} punti vendita. Spostali in un'altra categoria prima di procedere.`
      );
    }

    await db.collection<POSCategoryDocument>(this.CATEGORY_COLLECTION_NAME).deleteOne({ id });
  }
}
