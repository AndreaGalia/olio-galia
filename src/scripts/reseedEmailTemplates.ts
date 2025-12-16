/**
 * Script per eliminare e ricreare i template email di sistema
 * Utile quando si aggiornano i template con nuove modifiche
 *
 * Esegui con: npx tsx src/scripts/reseedEmailTemplates.ts
 */

// Carica variabili d'ambiente
import { config } from 'dotenv';
import { resolve } from 'path';

// Carica .env.local (se esiste) o .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDatabase } from '../lib/mongodb';
import { EmailTemplateDocument, TEMPLATE_VARIABLES } from '../types/emailTemplate';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function reseedEmailTemplates() {
  console.log('🔄 Inizio re-seeding template email...\n');

  try {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>('email_templates');

    // 1. Elimina i vecchi template di sistema
    const existingCount = await collection.countDocuments({ isSystem: true });

    if (existingCount > 0) {
      console.log(`🗑️  Eliminazione di ${existingCount} template di sistema esistenti...`);
      const deleteResult = await collection.deleteMany({ isSystem: true });
      console.log(`✅ Eliminati ${deleteResult.deletedCount} template\n`);
    } else {
      console.log('ℹ️  Nessun template di sistema da eliminare\n');
    }

    // 2. Chiudi la connessione MongoDB prima di eseguire il seed
    console.log('📝 Esecuzione script di seeding...\n');

    // Esegui il seed script
    try {
      const { stdout, stderr } = await execAsync('npx tsx src/scripts/seedEmailTemplates.ts');

      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.error('⚠️  Stderr:', stderr);
      }

      console.log('\n✅ Re-seeding completato con successo!\n');
    } catch (error: any) {
      if (error.stdout) {
        console.log(error.stdout);
      }
      if (error.code === 0) {
        console.log('\n✅ Re-seeding completato con successo!\n');
      } else {
        throw error;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante il re-seeding:', error);
    process.exit(1);
  }
}

// Esegui lo script
reseedEmailTemplates();
