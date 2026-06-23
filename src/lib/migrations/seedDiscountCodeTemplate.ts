import type { Db } from 'mongodb';
import type { Migration, MigrationRunResult } from './types';
import { createDiscountCodeHTML, getDiscountCodeEmailSubject } from '@/lib/email/discount-template';
import { TEMPLATE_VARIABLES } from '@/types/emailTemplate';

const TEMPLATE_KEY = 'discount_code';
const COLLECTION = 'email_templates';

export const seedDiscountCodeTemplate: Migration = {
  id: 'seed-discount-code-template',
  name: 'Seed Template Codice Sconto',
  description: 'Crea il template email "discount_code" in MongoDB (IT + EN). Usato quando l\'admin invia un codice coupon Stripe ai clienti.',
  params: [],

  async run(db: Db, { dryRun, force }): Promise<MigrationRunResult> {
    const existing = await db.collection(COLLECTION).findOne({ templateKey: TEMPLATE_KEY });

    const alreadyApplied = !!existing;
    const label = 'Template — discount_code';

    if (alreadyApplied && !force) {
      return {
        dryRun,
        targets: [{
          label,
          found: true,
          name: existing.name,
          alreadyApplied: true,
          action: 'Nessuna azione — template già presente. Usa Force per sovrascrivere.',
          updated: false,
          skipped: true,
        }],
      };
    }

    const doc = {
      templateKey: TEMPLATE_KEY,
      name: 'Codice Sconto',
      isSystem: true,
      translations: {
        it: {
          subject: getDiscountCodeEmailSubject('it'),
          htmlBody: createDiscountCodeHTML('it'),
        },
        en: {
          subject: getDiscountCodeEmailSubject('en'),
          htmlBody: createDiscountCodeHTML('en'),
        },
      },
      availableVariables: TEMPLATE_VARIABLES[TEMPLATE_KEY] ?? [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    };

    if (!dryRun) {
      if (alreadyApplied) {
        await db.collection(COLLECTION).updateOne(
          { templateKey: TEMPLATE_KEY },
          { $set: { ...doc, 'metadata.updatedAt': new Date() } }
        );
      } else {
        await db.collection(COLLECTION).insertOne(doc);
      }
    }

    return {
      dryRun,
      targets: [{
        label,
        found: alreadyApplied,
        name: doc.name,
        alreadyApplied,
        action: dryRun
          ? `Verrebbe ${alreadyApplied ? 'aggiornato' : 'creato'} il template con soggetto IT: "${doc.translations.it.subject}"`
          : `Template ${alreadyApplied ? 'aggiornato' : 'creato'} con successo`,
        updated: !dryRun,
        skipped: false,
      }],
    };
  },
};
