import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import type {
  ScenarioDocument,
  CreateScenarioData,
  UpdateScenarioData,
} from '@/types/scenario';
import { calculateScenario } from './calculations';

const COLLECTION_NAME = 'scenarios';

/**
 * Crea un nuovo scenario
 */
export async function createScenario(
  data: CreateScenarioData
): Promise<ScenarioDocument> {
  const { db } = await connectToDatabase();

  // Calcola automaticamente i dati finanziari
  const calculations = calculateScenario(
    data.variousCosts,
    data.productCosts,
    data.salesEstimates,
    data.productPricing
  );

  const now = new Date();

  const scenario: Omit<ScenarioDocument, '_id'> = {
    name: data.name,
    description: data.description,
    variousCosts: data.variousCosts,
    productCosts: data.productCosts,
    salesEstimates: data.salesEstimates,
    productPricing: data.productPricing,
    calculations,
    metadata: {
      createdAt: now,
      updatedAt: now,
      isActive: true,
    },
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(scenario);

  return {
    ...scenario,
    _id: result.insertedId,
  };
}

/**
 * Recupera tutti gli scenari
 */
export async function getAllScenarios(): Promise<ScenarioDocument[]> {
  const { db } = await connectToDatabase();

  const scenarios = await db
    .collection<ScenarioDocument>(COLLECTION_NAME)
    .find({})
    .sort({ 'metadata.updatedAt': -1 })
    .toArray();

  return scenarios;
}

/**
 * Recupera un singolo scenario per ID
 */
export async function getScenarioById(
  id: string
): Promise<ScenarioDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const { db } = await connectToDatabase();

  const scenario = await db
    .collection<ScenarioDocument>(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(id) });

  return scenario;
}

/**
 * Aggiorna uno scenario esistente
 */
export async function updateScenario(
  id: string,
  data: UpdateScenarioData
): Promise<ScenarioDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const { db } = await connectToDatabase();

  // Recupera lo scenario corrente
  const currentScenario = await getScenarioById(id);
  if (!currentScenario) {
    return null;
  }

  // Prepara i dati aggiornati
  const updatedData: Partial<ScenarioDocument> = {
    ...currentScenario,
    ...data,
    metadata: {
      ...currentScenario.metadata,
      updatedAt: new Date(),
      ...(data.metadata?.isActive !== undefined && {
        isActive: data.metadata.isActive,
      }),
    },
  };

  // Ricalcola se necessario
  if (
    data.variousCosts ||
    data.productCosts ||
    data.salesEstimates ||
    data.productPricing
  ) {
    updatedData.calculations = calculateScenario(
      updatedData.variousCosts!,
      updatedData.productCosts!,
      updatedData.salesEstimates!,
      updatedData.productPricing!
    );
  }

  // Rimuovi _id dall'update
  const { _id, ...updateFields } = updatedData;

  await db
    .collection(COLLECTION_NAME)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  return getScenarioById(id);
}

/**
 * Elimina uno scenario
 */
export async function deleteScenario(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const { db } = await connectToDatabase();

  const result = await db
    .collection(COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount === 1;
}

/**
 * Recupera solo gli scenari attivi
 */
export async function getActiveScenarios(): Promise<ScenarioDocument[]> {
  const { db } = await connectToDatabase();

  const scenarios = await db
    .collection<ScenarioDocument>(COLLECTION_NAME)
    .find({ 'metadata.isActive': true })
    .sort({ 'metadata.updatedAt': -1 })
    .toArray();

  return scenarios;
}

/**
 * Archivia/riattiva uno scenario
 */
export async function toggleScenarioActive(
  id: string,
  isActive: boolean
): Promise<ScenarioDocument | null> {
  return updateScenario(id, {
    metadata: { isActive },
  });
}
