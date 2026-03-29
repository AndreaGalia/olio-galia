'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface MigrationParam {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
}

interface MigrationInfo {
  id: string;
  name: string;
  description: string;
  params: MigrationParam[];
}

interface MigrationTarget {
  label: string;
  found: boolean;
  slug?: string;
  name?: string;
  alreadyApplied: boolean;
  action: string;
  updated: boolean;
  skipped: boolean;
  error?: string;
}

interface MigrationResult {
  success: boolean;
  migration: string;
  dryRun: boolean;
  targets: MigrationTarget[];
  error?: string;
}

interface MigrationState {
  loading: boolean;
  result: MigrationResult | null;
  /** Valori correnti degli input params */
  paramValues: Record<string, string>;
}

export default function AdminToolsPage() {
  const [migrations, setMigrations] = useState<MigrationInfo[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [states, setStates] = useState<Record<string, MigrationState>>({});

  useEffect(() => {
    fetch('/api/admin/migrations')
      .then((r) => r.json())
      .then((data) => {
        const list: MigrationInfo[] = data.migrations ?? [];
        setMigrations(list);
        const initial: Record<string, MigrationState> = {};
        list.forEach((m) => {
          const paramValues: Record<string, string> = {};
          m.params.forEach((p) => { paramValues[p.name] = p.defaultValue ?? ''; });
          initial[m.id] = { loading: false, result: null, paramValues };
        });
        setStates(initial);
      })
      .finally(() => setLoadingList(false));
  }, []);

  const setParamValue = useCallback((id: string, paramName: string, value: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        paramValues: { ...prev[id].paramValues, [paramName]: value },
      },
    }));
  }, []);

  const run = useCallback(async (id: string, dryRun: boolean, force = false) => {
    const currentParams = states[id]?.paramValues;
    // Invia solo i params con valore non vuoto
    const params: Record<string, string> = {};
    if (currentParams) {
      Object.entries(currentParams).forEach(([k, v]) => { if (v.trim()) params[k] = v.trim(); });
    }

    setStates((prev) => ({ ...prev, [id]: { ...prev[id], loading: true, result: null } }));
    try {
      const res = await fetch(`/api/admin/migrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun, force, params: Object.keys(params).length ? params : undefined }),
      });
      const data: MigrationResult = await res.json();
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], loading: false, result: data } }));
    } catch {
      setStates((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          loading: false,
          result: { success: false, migration: id, dryRun, targets: [], error: 'Errore di rete' },
        },
      }));
    }
  }, [states]);

  return (
    <AdminLayout
      title="Strumenti"
      subtitle="Migrazioni e operazioni sul database"
    >
      {loadingList ? (
        <p className="text-sm text-black/40">Caricamento migrazioni\u2026</p>
      ) : migrations.length === 0 ? (
        <p className="text-sm text-black/40">Nessuna migrazione registrata.</p>
      ) : (
        <div className="space-y-6">
          {migrations.map((m) => {
            const state = states[m.id];
            const result = state?.result;
            const isLoading = state?.loading;
            const hasParams = m.params.length > 0;

            return (
              <div key={m.id} className="border border-black/10 bg-white">
                {/* Header */}
                <div className="px-6 py-5 border-b border-black/10">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 mb-1">{m.id}</p>
                  <h2 className="text-sm font-medium text-black">{m.name}</h2>
                  <p className="text-xs text-black/50 mt-1">{m.description}</p>
                </div>

                {/* Params configurabili */}
                {hasParams && (
                  <div className="px-6 py-4 border-b border-black/5 bg-black/[0.02]">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-black/30 mb-3">
                      Configurazione
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {m.params.map((p) => (
                        <div key={p.name}>
                          <label className="block text-xs text-black/50 mb-1">{p.label}</label>
                          <input
                            type="text"
                            value={state?.paramValues[p.name] ?? ''}
                            onChange={(e) => setParamValue(m.id, p.name, e.target.value)}
                            placeholder={p.placeholder ?? ''}
                            className="w-full px-3 py-2 text-xs border border-black/15 bg-white text-black placeholder:text-black/25 focus:outline-none focus:border-black/40"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Azioni */}
                <div className="px-6 py-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => run(m.id, true, false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs tracking-wide border border-black/20 text-black hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isLoading ? 'Caricamento\u2026' : 'Anteprima'}
                  </button>
                  <button
                    onClick={() => run(m.id, false, false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs tracking-wide bg-olive text-white hover:bg-salvia disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Applica
                  </button>
                  {result && !result.dryRun && result.targets.some((t) => t.alreadyApplied) && (
                    <button
                      onClick={() => run(m.id, false, true)}
                      disabled={isLoading}
                      className="px-4 py-2 text-xs tracking-wide border border-black/20 text-black/60 hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Force
                    </button>
                  )}
                </div>

                {/* Results */}
                {result && (
                  <div className="px-6 pb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-black/30">
                        {result.dryRun ? 'Anteprima' : 'Risultato'}
                      </span>
                      {result.error && (
                        <span className="text-xs text-red-600">{result.error}</span>
                      )}
                    </div>

                    {result.targets.length > 0 && (
                      <div className="border border-black/10">
                        {result.targets.map((t, i) => (
                          <div
                            key={i}
                            className={`px-4 py-3 flex items-start gap-4 text-xs ${i > 0 ? 'border-t border-black/5' : ''}`}
                          >
                            <span className="shrink-0 mt-0.5 w-4 text-center">
                              {t.error ? (
                                <span className="text-red-500">\u2717</span>
                              ) : t.skipped ? (
                                <span className="text-black/25">\u2014</span>
                              ) : t.updated ? (
                                <span className="text-olive">\u2713</span>
                              ) : (
                                <span className="text-black/25">\u25cb</span>
                              )}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black">{t.label}</p>
                              {t.name && (
                                <p className="text-black/40 truncate">
                                  {t.name}{t.slug ? ` \u2014 ${t.slug}` : ''}
                                </p>
                              )}
                              <p className={`mt-0.5 ${t.error ? 'text-red-500' : 'text-black/50'}`}>
                                {t.error ?? t.action}
                              </p>
                            </div>

                            <div className="shrink-0 flex gap-1 flex-wrap justify-end">
                              {!t.found && (
                                <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] tracking-wide">
                                  NON TROVATO
                                </span>
                              )}
                              {t.found && t.alreadyApplied && (
                                <span className="px-1.5 py-0.5 bg-black/5 text-black/40 text-[10px] tracking-wide">
                                  GI\u00c0 APPLICATO
                                </span>
                              )}
                              {t.updated && (
                                <span className="px-1.5 py-0.5 bg-olive/10 text-olive text-[10px] tracking-wide">
                                  AGGIORNATO
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
