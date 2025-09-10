// Script per creare il primo admin
// Esegui con: npx tsx src/scripts/create-admin.ts

// Carica le variabili d'ambiente PRIMA di qualsiasi altro import
require('dotenv').config({ path: '.env.local' });

import { AdminService } from '../services/adminService';

async function createFirstAdmin() {
  try {
    // Cambia questi valori con le tue credenziali
    const email = 'admin@olio-galia.com';
    const password = 'admin123!'; // CAMBIA QUESTA PASSWORD!
    
    console.log('🔐 Creazione primo admin...');
    
    const adminId = await AdminService.createAdmin(email, password);
    
    console.log('✅ Admin creato con successo!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 ID: ${adminId}`);
    console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo login!');
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('già esistente')) {
      console.log('ℹ️  Admin già esistente');
    } else {
      console.error('❌ Errore:', error);
    }
  } finally {
    process.exit(0);
  }
}

createFirstAdmin();