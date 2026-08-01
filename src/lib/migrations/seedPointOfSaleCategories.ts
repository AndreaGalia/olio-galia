import type { Db } from 'mongodb';
import type { Migration, MigrationRunResult } from './types';
import type { POSCategoryDocument, PointOfSaleDocument } from '@/types/pointOfSale';

const CATEGORY_COLLECTION = 'pointOfSaleCategories';
const POS_COLLECTION = 'pointsOfSale';

interface SeedCategory {
  id: string;
  nameIT: string;
  nameEN: string;
  icon: string;
  displayOrder: number;
}

// Icone: nomi di lucide-react, già dipendenza del progetto
const DEFAULT_CATEGORIES: SeedCategory[] = [
  { id: 'supermercato', nameIT: 'Supermercati', nameEN: 'Supermarkets', icon: 'ShoppingCart', displayOrder: 0 },
  { id: 'macelleria', nameIT: 'Macellerie', nameEN: 'Butcher shops', icon: 'Beef', displayOrder: 1 },
  { id: 'alimentari', nameIT: 'Negozi di alimentari', nameEN: 'Grocery stores', icon: 'Store', displayOrder: 2 },
  { id: 'mercato', nameIT: 'Mercati', nameEN: 'Markets', icon: 'Tent', displayOrder: 3 },
  { id: 'ristorante', nameIT: 'Ristoranti', nameEN: 'Restaurants', icon: 'UtensilsCrossed', displayOrder: 4 },
];

export const seedPointOfSaleCategories: Migration = {
  id: 'seed-point-of-sale-categories',
  name: 'Seed Categorie Punti Vendita',
  description:
    'Crea le categorie di partenza per la pagina "Dove trovarci" (supermercati, macellerie, alimentari, mercati, ristoranti) e gli indici sulla collection pointsOfSale. Prerequisito per poter aggiungere punti vendita.',
  params: [],

  async run(db: Db, { dryRun, force }): Promise<MigrationRunResult> {
    const collection = db.collection<POSCategoryDocument>(CATEGORY_COLLECTION);
    const targets: MigrationRunResult['targets'] = [];

    for (const category of DEFAULT_CATEGORIES) {
      const label = `Categoria — ${category.nameIT}`;
      const existing = await collection.findOne({ id: category.id });
      const alreadyApplied = !!existing;

      if (alreadyApplied && !force) {
        targets.push({
          label,
          found: true,
          slug: category.id,
          name: existing.translations?.it?.name,
          alreadyApplied: true,
          action: 'Nessuna azione — categoria già presente. Usa Force per sovrascrivere nome e icona.',
          updated: false,
          skipped: true,
        });
        continue;
      }

      try {
        if (!dryRun) {
          const now = new Date();

          if (alreadyApplied) {
            // force: aggiorna traduzioni, icona e ordine mantenendo l'id, così i
            // punti vendita già associati restano collegati
            await collection.updateOne(
              { id: category.id },
              {
                $set: {
                  'translations.it.name': category.nameIT,
                  'translations.en.name': category.nameEN,
                  icon: category.icon,
                  displayOrder: category.displayOrder,
                  'metadata.updatedAt': now,
                },
              }
            );
          } else {
            await collection.insertOne({
              id: category.id,
              translations: {
                it: { name: category.nameIT },
                en: { name: category.nameEN },
              },
              icon: category.icon,
              displayOrder: category.displayOrder,
              metadata: {
                createdAt: now,
                updatedAt: now,
                isActive: true,
              },
            } as POSCategoryDocument);
          }
        }

        targets.push({
          label,
          found: alreadyApplied,
          slug: category.id,
          name: category.nameIT,
          alreadyApplied,
          action: dryRun
            ? `Verrebbe ${alreadyApplied ? 'aggiornata' : 'creata'} la categoria "${category.nameIT}" (${category.nameEN})`
            : `Categoria ${alreadyApplied ? 'aggiornata' : 'creata'} con successo`,
          updated: !dryRun,
          skipped: false,
        });
      } catch (error) {
        targets.push({
          label,
          found: alreadyApplied,
          slug: category.id,
          alreadyApplied,
          action: 'Errore durante la scrittura',
          updated: false,
          skipped: true,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
        });
      }
    }

    // Indici su pointsOfSale — createIndex è idempotente
    const indexLabel = 'Indici — pointsOfSale (slug unico, isActive + categoryId)';
    try {
      const posCollection = db.collection<PointOfSaleDocument>(POS_COLLECTION);
      const existingIndexes = await posCollection.indexes();
      const hasSlugIndex = existingIndexes.some(index => index.key?.slug === 1);

      if (!dryRun) {
        await posCollection.createIndex({ slug: 1 }, { unique: true });
        await posCollection.createIndex({ 'metadata.isActive': 1, categoryId: 1 });
      }

      targets.push({
        label: indexLabel,
        found: hasSlugIndex,
        alreadyApplied: hasSlugIndex,
        action: dryRun
          ? hasSlugIndex
            ? 'Indici già presenti — nessuna modifica'
            : 'Verrebbero creati gli indici su slug e su metadata.isActive + categoryId'
          : 'Indici creati o già esistenti',
        updated: !dryRun,
        skipped: false,
      });
    } catch (error) {
      targets.push({
        label: indexLabel,
        found: false,
        alreadyApplied: false,
        action: 'Errore durante la creazione degli indici',
        updated: false,
        skipped: true,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      });
    }

    return { dryRun, targets };
  },
};
