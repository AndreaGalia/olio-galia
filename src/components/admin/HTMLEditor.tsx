'use client';

import { useState, useMemo, useCallback } from 'react';
import { sanitizeHTMLPreview } from '@/lib/sanitize';

interface HTMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  height?: string;
}

/**
 * Editor HTML con preview per il pannello admin
 * Permette di modificare HTML personalizzato con anteprima sanitizzata
 */
export default function HTMLEditor({
  value,
  onChange,
  label,
  placeholder = 'Inserisci il codice HTML personalizzato...',
  height = '400px',
}: HTMLEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Memoizza l'HTML sanitizzato per evitare ricalcoli ad ogni render
  const sanitizedHTML = useMemo(() => sanitizeHTMLPreview(value), [value]);

  // Memoizza il template per evitare ricreazione ad ogni render
  const template = useMemo(() => `<div class="custom-product-layout">
  <section class="hero-section" style="background: linear-gradient(135deg, #789262 0%, #556B2F 100%); color: white; padding: 3rem; border-radius: 1rem; margin-bottom: 2rem;">
    <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Titolo Prodotto Personalizzato</h2>
    <p style="font-size: 1.2rem; opacity: 0.9;">Sottotitolo o descrizione breve del prodotto</p>
  </section>

  <div class="content-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
    <div class="feature-card" style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color: #556B2F; margin-bottom: 1rem;">Caratteristica 1</h3>
      <p>Descrizione della caratteristica principale del prodotto.</p>
    </div>

    <div class="feature-card" style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color: #556B2F; margin-bottom: 1rem;">Caratteristica 2</h3>
      <p>Descrizione di un'altra caratteristica importante.</p>
    </div>
  </div>

  <div class="info-section" style="background: #ECE8DF; padding: 2rem; border-radius: 0.5rem;">
    <h3 style="color: #556B2F; margin-bottom: 1rem;">Informazioni Aggiuntive</h3>
    <ul style="list-style: disc; padding-left: 1.5rem; color: #333;">
      <li>Informazione 1</li>
      <li>Informazione 2</li>
      <li>Informazione 3</li>
    </ul>
  </div>
</div>`, []);

  // Usa useCallback per evitare ricreazione delle funzioni ad ogni render
  const insertTemplate = useCallback(() => {
    onChange(template);
  }, [onChange, template]);

  const clearHTML = useCallback(() => {
    if (confirm('Sei sicuro di voler cancellare tutto il contenuto HTML?')) {
      onChange('');
    }
  }, [onChange]);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  return (
    <div className="space-y-3">
      {/* Label e controlli */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className="px-3 py-1 text-xs font-medium text-white bg-olive hover:bg-olive/90 rounded transition-colors"
            aria-label={showPreview ? 'Passa alla modalità modifica' : 'Passa alla modalità anteprima'}
          >
            {showPreview ? 'Modifica HTML' : 'Anteprima'}
          </button>
          <button
            type="button"
            onClick={insertTemplate}
            className="px-3 py-1 text-xs font-medium text-olive bg-beige hover:bg-sabbia rounded transition-colors"
            aria-label="Inserisci template HTML predefinito"
          >
            Inserisci Template
          </button>
          {value && (
            <button
              type="button"
              onClick={clearHTML}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
              aria-label="Cancella tutto il contenuto HTML"
            >
              Cancella
            </button>
          )}
        </div>
      </div>

      {/* Editor o Preview */}
      {showPreview ? (
        <div
          className="w-full border border-gray-300 rounded-lg p-4 bg-white overflow-auto"
          style={{ minHeight: height }}
        >
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>Anteprima:</strong> Questo è come apparirà il tuo HTML personalizzato (sanitizzato per sicurezza)
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            className="prose max-w-none"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-olive focus:border-transparent font-mono text-sm resize-none"
            style={{ height }}
          />
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Suggerimenti:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Usa i colori del tema: <code className="bg-gray-100 px-1 rounded">#556B2F</code> (olive), <code className="bg-gray-100 px-1 rounded">#789262</code> (salvia), <code className="bg-gray-100 px-1 rounded">#ECE8DF</code> (beige)</li>
              <li>Tailwind CSS è disponibile: puoi usare classi come <code className="bg-gray-100 px-1 rounded">grid</code>, <code className="bg-gray-100 px-1 rounded">flex</code>, <code className="bg-gray-100 px-1 rounded">p-4</code>, ecc.</li>
              <li>HTML permesso: div, p, h1-h6, ul/ol/li, img, video, table, ecc. (script rimossi per sicurezza)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Caratteri contati */}
      <div className="text-xs text-gray-500 text-right">
        {value.length} caratteri
      </div>
    </div>
  );
}
