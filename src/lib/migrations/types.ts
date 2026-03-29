import type { Db } from 'mongodb';

export interface MigrationTarget {
  /** Label leggibile del prodotto/documento cercato */
  label: string;
  /** Trovato nel DB */
  found: boolean;
  /** Slug IT se trovato */
  slug?: string;
  /** Nome del prodotto se trovato */
  name?: string;
  /** Il campo target è già presente (migrazione già applicata) */
  alreadyApplied: boolean;
  /** Cosa farebbe la migrazione su questo target */
  action: string;
}

export interface MigrationRunResult {
  dryRun: boolean;
  targets: (MigrationTarget & {
    updated: boolean;
    skipped: boolean;
    error?: string;
  })[];
}

/** Parametro configurabile esposto nell'UI prima di eseguire la migrazione */
export interface MigrationParam {
  /** Chiave usata in opts.params */
  name: string;
  /** Label mostrata nell'UI */
  label: string;
  /** Testo suggerito nell'input */
  placeholder?: string;
  /** Valore di default (fallback se l'utente non inserisce nulla) */
  defaultValue?: string;
}

export interface Migration {
  /** ID univoco — usato nell'URL dell'API */
  id: string;
  /** Nome leggibile */
  name: string;
  /** Cosa fa questa migrazione */
  description: string;
  /**
   * Parametri configurabili dall'utente (es. slug prodotto).
   * Se presenti, l'UI mostra un form prima di eseguire la migrazione.
   */
  params?: MigrationParam[];
  /**
   * Esegue la migrazione.
   * - `dryRun: true`  → calcola i target senza scrivere
   * - `force: false`  → salta i target dove il dato è già presente (idempotente)
   * - `force: true`   → sovrascrive anche se già presente
   * - `params`        → valori configurati dall'utente nell'UI
   */
  run: (
    db: Db,
    opts: { dryRun: boolean; force: boolean; params?: Record<string, string> }
  ) => Promise<MigrationRunResult>;
}
