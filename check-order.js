// Script per verificare ordini nel database
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkOrder() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Cerca l'ordine specifico
    const sessionId = 'cs_test_a19asMbgZjakah94Vuwf2qqaYXf8luUj27W64BPCaWCXEVDLxKQaIsTllH';

    console.log('🔍 Cerco ordine con session_id:', sessionId);
    console.log('');

    // Prova diverse query
    const queries = [
      { id: sessionId },
      { stripeSessionId: sessionId },
      { sessionId: sessionId },
      { orderId: sessionId }
    ];

    for (const query of queries) {
      const order = await db.collection('orders').findOne(query);
      if (order) {
        console.log('✅ TROVATO con query:', JSON.stringify(query));
        console.log('📦 Ordine:', JSON.stringify(order, null, 2));
        return;
      } else {
        console.log('❌ NON trovato con query:', JSON.stringify(query));
      }
    }

    console.log('');
    console.log('📋 Tutti gli ordini nel database:');
    const allOrders = await db.collection('orders').find({}).limit(5).toArray();
    console.log(`Trovati ${allOrders.length} ordini totali`);

    if (allOrders.length > 0) {
      console.log('');
      console.log('🔍 Esempio primo ordine:');
      console.log(JSON.stringify(allOrders[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.close();
  }
}

checkOrder();
