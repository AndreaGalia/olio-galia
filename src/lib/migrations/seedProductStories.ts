import type { Db } from 'mongodb';
import type { Migration, MigrationParam, MigrationRunResult, MigrationTarget } from './types';
import {
  LATTA_5L_STORY_IT,
  LATTA_5L_STORY_EN,
  BEAUTY_OIL_STORY_IT,
  BEAUTY_OIL_STORY_EN,
} from '@/data/productStories';

interface ProductTarget {
  label: string;
  paramName: string;
  fallbackPatterns: RegExp[];
  storyIt: typeof LATTA_5L_STORY_IT;
  storyEn: typeof LATTA_5L_STORY_EN;
}

const TARGETS: ProductTarget[] = [
  {
    label: 'Latta 5L',
    paramName: 'slug_latta_5l',
    fallbackPatterns: [/latta/i, /5l/i],
    storyIt: LATTA_5L_STORY_IT,
    storyEn: LATTA_5L_STORY_EN,
  },
  {
    label: 'Beauty Oil 100ml',
    paramName: 'slug_beauty_oil',
    fallbackPatterns: [/beauty/i, /mandorle/i, /almond/i],
    storyIt: BEAUTY_OIL_STORY_IT,
    storyEn: BEAUTY_OIL_STORY_EN,
  },
];

async function findProduct(db: Db, slug: string | undefined, fallbackPatterns: RegExp[]) {
  if (slug) {
    const doc = await db.collection('products').findOne({
      $or: [{ 'slug.it': slug }, { 'slug.en': slug }],
    });
    if (doc) return doc;
  }

  for (const pattern of fallbackPatterns) {
    const doc = await db.collection('products').findOne({
      $or: [
        { 'slug.it': pattern },
        { 'slug.en': pattern },
        { 'translations.it.name': pattern },
      ],
    });
    if (doc) return doc;
  }

  return null;
}

export const seedProductStories: Migration = {
  id: 'seed-product-stories',
  name: 'Product Stories \u2014 Latta 5L & Beauty Oil',
  description:
    'Aggiunge il campo productStory (IT + EN) per Latta 5L e Beauty Oil 100ml, abilitando il layout editoriale strutturato al posto del customHTML.',

  params: [
    {
      name: 'slug_latta_5l',
      label: 'Slug Latta 5L',
      placeholder: 'es. latta-olio-5l',
    },
    {
      name: 'slug_beauty_oil',
      label: 'Slug Beauty Oil 100ml',
      placeholder: 'es. beauty-oil-100ml',
    },
  ] satisfies MigrationParam[],

  async run(db, { dryRun, force, params }): Promise<MigrationRunResult> {
    const results: MigrationRunResult['targets'] = [];

    for (const target of TARGETS) {
      const slugOverride = params?.[target.paramName]?.trim() || undefined;
      const doc = await findProduct(db, slugOverride, target.fallbackPatterns);

      const base: MigrationTarget = {
        label: target.label,
        found: Boolean(doc),
        slug: doc?.slug?.it,
        name: doc?.translations?.it?.name,
        alreadyApplied: Boolean(doc?.translations?.it?.productStory?.sections?.length),
        action: '',
      };

      if (!doc) {
        base.action = slugOverride
          ? `Slug \u201c${slugOverride}\u201d non trovato \u2014 verifica il valore inserito`
          : 'Non trovato \u2014 configura lo slug o verifica il nome in MongoDB';
        results.push({ ...base, updated: false, skipped: true });
        continue;
      }

      if (base.alreadyApplied && !force) {
        base.action = `productStory gi\u00e0 presente (${doc.translations.it.productStory.sections.length} sezioni IT) \u2014 usa force per sovrascrivere`;
        results.push({ ...base, updated: false, skipped: true });
        continue;
      }

      base.action = base.alreadyApplied
        ? `Sovrascrive productStory esistente con ${target.storyIt.sections.length} sezioni IT / ${target.storyEn.sections.length} EN`
        : `Aggiunge productStory: ${target.storyIt.sections.length} sezioni IT / ${target.storyEn.sections.length} EN`;

      if (!dryRun) {
        try {
          await db.collection('products').updateOne(
            { _id: doc._id },
            {
              $set: {
                'translations.it.productStory': target.storyIt,
                'translations.en.productStory': target.storyEn,
                'metadata.updatedAt': new Date(),
              },
            }
          );
          results.push({ ...base, updated: true, skipped: false });
        } catch (err) {
          results.push({
            ...base,
            updated: false,
            skipped: false,
            error: err instanceof Error ? err.message : 'Errore sconosciuto',
          });
        }
      } else {
        results.push({ ...base, updated: false, skipped: false });
      }
    }

    return { dryRun, targets: results };
  },
};
