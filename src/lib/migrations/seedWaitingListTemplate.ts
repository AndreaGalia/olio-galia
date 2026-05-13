import type { Db } from 'mongodb';
import type { Migration, MigrationRunResult } from './types';
import { createWaitingListNotificationHTML, getWaitingListEmailSubject } from '@/lib/email/waiting-list-template';
import { TEMPLATE_VARIABLES } from '@/types/emailTemplate';

const TEMPLATE_KEY = 'waiting_list_notification';
const COLLECTION = 'email_templates';

export const seedWaitingListTemplate: Migration = {
  id: 'seed-waiting-list-template',
  name: 'Seed Template Lista d\'attesa',
  description: 'Crea il template email "waiting_list_notification" in MongoDB. Usato quando un prodotto diventa disponibile per notificare gli iscritti alla lista d\'attesa.',
  params: [],

  async run(db: Db, { dryRun, force }): Promise<MigrationRunResult> {
    const existing = await db.collection(COLLECTION).findOne({ templateKey: TEMPLATE_KEY });

    const alreadyApplied = !!existing;
    const label = 'Template — waiting_list_notification';

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
      name: 'Notifica Lista d\'attesa',
      isSystem: true,
      translations: {
        it: {
          subject: getWaitingListEmailSubject('it'),
          htmlBody: createWaitingListNotificationHTML('it'),
        },
        en: {
          subject: getWaitingListEmailSubject('en'),
          htmlBody: createWaitingListNotificationHTML('en'),
        },
      },
      availableVariables: TEMPLATE_VARIABLES[TEMPLATE_KEY] ?? ['productName', 'productUrl'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    };

    if (!dryRun) {
      if (alreadyApplied) {
        // force: aggiorna il documento esistente
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
