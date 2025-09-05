// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Aggiungi MONGODB_URI alle variabili ambiente');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, usa una variabile globale per preservare il valore
  // attraverso i module reload causati da HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, è meglio non usare una variabile globale
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Funzione helper per ottenere il database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('ecommerce'); // Cambia con il nome del tuo database
}

export default clientPromise;