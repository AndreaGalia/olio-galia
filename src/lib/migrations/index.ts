import type { Migration } from './types';
import { seedProductStories } from './seedProductStories';
import { seedMoreProductStories } from './seedMoreProductStories';
import { seedWaitingListTemplate } from './seedWaitingListTemplate';

/**
 * Registry di tutte le migrazioni disponibili.
 * Aggiungere nuove migrazioni qui — saranno automaticamente
 * esposte nell'API e nella pagina /admin/tools.
 */
export const migrations: Migration[] = [
  seedProductStories,
  seedMoreProductStories,
  seedWaitingListTemplate,
  // future migrations go here
];

export function getMigration(id: string): Migration | undefined {
  return migrations.find((m) => m.id === id);
}

export type { Migration, MigrationRunResult, MigrationTarget } from './types';
