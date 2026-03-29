'use client';

import { useState } from 'react';
import type {
  ProductStory,
  ProductStorySection,
  StoryItem,
  StorySensorNote,
  StoryStep,
  StoryKeyValue,
  StorySectionLayout,
} from '@/types/productStory';

interface ProductStoryEditorProps {
  valueIt: ProductStory | undefined;
  valueEn: ProductStory | undefined;
  onChangeIt: (story: ProductStory) => void;
  onChangeEn: (story: ProductStory) => void;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const cls = {
  input: 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400',
  label: 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide',
  btn: 'text-xs px-2 py-1.5 border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors rounded',
  btnDanger: 'text-xs px-2 py-1.5 border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600 transition-colors rounded',
};

// ─── Empty defaults ───────────────────────────────────────────────────────────

const newSection = (): ProductStorySection => ({ type: 'items', title: '', layout: 'grid', items: [] });
const newItem = (): StoryItem => ({ name: '', description: '' });
const newStep = (): StoryStep => ({ label: '', value: '' });
const newKV = (): StoryKeyValue => ({ key: '', value: '' });
const newSensorNote = (): StorySensorNote => ({ label: '', value: '' });

// ─── Generic key-value row editor ─────────────────────────────────────────────
// Works for StoryItem, StorySensorNote, StoryStep, StoryKeyValue via type cast.

type LooseRecord = Record<string, string | undefined>;

function ArrayField({
  items,
  fields,
  onChange,
  empty,
}: {
  items: LooseRecord[];
  fields: { key: string; label: string; textarea?: boolean; placeholder?: string }[];
  onChange: (items: LooseRecord[]) => void;
  empty: () => LooseRecord;
}) {
  const update = (i: number, key: string, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value || undefined };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-gray-300 tabular-nums select-none">#{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className={cls.btnDanger}
            >
              Rimuovi
            </button>
          </div>
          <div className={`grid gap-2 ${fields.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {fields.map(({ key, label, textarea, placeholder }) => (
              <div key={key} className={fields.length === 1 ? 'sm:col-span-2' : ''}>
                <label className={cls.label}>{label}</label>
                {textarea ? (
                  <textarea
                    value={item[key] ?? ''}
                    onChange={(e) => update(i, key, e.target.value)}
                    placeholder={placeholder}
                    className={`${cls.input} min-h-[60px] resize-y`}
                  />
                ) : (
                  <input
                    type="text"
                    value={item[key] ?? ''}
                    onChange={(e) => update(i, key, e.target.value)}
                    placeholder={placeholder}
                    className={cls.input}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, empty()])}
        className={`${cls.btn} w-full text-center`}
      >
        + Aggiungi
      </button>
    </div>
  );
}

// ─── Type-specific field panels ───────────────────────────────────────────────

function ItemsFields({
  section,
  onChange,
}: {
  section: ProductStorySection;
  onChange: (s: ProductStorySection) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={cls.label}>Layout</label>
        <div className="flex gap-4">
          {(['grid', 'list'] as StorySectionLayout[]).map((l) => (
            <label key={l} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                checked={(section.layout ?? 'grid') === l}
                onChange={() => onChange({ ...section, layout: l })}
              />
              {l === 'grid' ? 'Grid (cards)' : 'Lista numerata'}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={cls.label}>Items</label>
        <ArrayField
          items={(section.items ?? []) as LooseRecord[]}
          fields={[
            { key: 'name', label: 'Nome', placeholder: 'Es: Polifenoli' },
            { key: 'action', label: 'Azione (opz.)', placeholder: 'Es: Antiossidante' },
            { key: 'description', label: 'Descrizione', textarea: true },
            { key: 'image', label: 'URL immagine (opz.)' },
          ]}
          onChange={(items) => onChange({ ...section, items: items as StoryItem[] })}
          empty={() => newItem() as LooseRecord}
        />
      </div>
    </div>
  );
}

function FlavorFields({
  section,
  onChange,
}: {
  section: ProductStorySection;
  onChange: (s: ProductStorySection) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={cls.label}>Cultivar</label>
        <ArrayField
          items={(section.cultivars ?? []) as LooseRecord[]}
          fields={[
            { key: 'name', label: 'Nome cultivar', placeholder: 'Es: Tonda Iblea' },
            { key: 'description', label: 'Descrizione', textarea: true },
            { key: 'image', label: 'URL immagine (opz.)' },
          ]}
          onChange={(cultivars) => onChange({ ...section, cultivars: cultivars as StoryItem[] })}
          empty={() => newItem() as LooseRecord}
        />
      </div>
      <div>
        <label className={cls.label}>Note sensoriali (Colore, Profumo, Gusto, Retrogusto...)</label>
        <ArrayField
          items={(section.sensorNotes ?? []) as LooseRecord[]}
          fields={[
            { key: 'label', label: 'Label', placeholder: 'Es: Colore' },
            { key: 'value', label: 'Valore', placeholder: 'Es: Dorato-verde brillante' },
            { key: 'image', label: 'URL foto editoriale (opz.)' },
          ]}
          onChange={(sensorNotes) => onChange({ ...section, sensorNotes: sensorNotes as StorySensorNote[] })}
          empty={() => newSensorNote() as LooseRecord}
        />
      </div>
    </div>
  );
}

function OriginFields({
  section,
  onChange,
}: {
  section: ProductStorySection;
  onChange: (s: ProductStorySection) => void;
}) {
  const set = (key: keyof ProductStorySection, value: string | undefined) =>
    onChange({ ...section, [key]: value || undefined });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={cls.label}>Località</label>
          <input
            type="text"
            value={section.location ?? ''}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Es: Ferla (Siracusa)"
            className={cls.input}
          />
        </div>
        <div>
          <label className={cls.label}>Altitudine</label>
          <input
            type="text"
            value={section.altitude ?? ''}
            onChange={(e) => set('altitude', e.target.value)}
            placeholder="Es: 450–700 m s.l.m."
            className={cls.input}
          />
        </div>
        <div>
          <label className={cls.label}>Clima</label>
          <input
            type="text"
            value={section.climate ?? ''}
            onChange={(e) => set('climate', e.target.value)}
            placeholder="Es: Mediterraneo temperato"
            className={cls.input}
          />
        </div>
      </div>
      <div>
        <label className={cls.label}>Descrizione territorio (opz.)</label>
        <textarea
          value={section.territory ?? ''}
          onChange={(e) => set('territory', e.target.value)}
          placeholder="Paragrafo descrittivo sul territorio..."
          className={`${cls.input} min-h-[80px] resize-y`}
        />
      </div>
      <div>
        <label className={cls.label}>Fasi di produzione</label>
        <ArrayField
          items={(section.steps ?? []) as LooseRecord[]}
          fields={[
            { key: 'label', label: 'Fase', placeholder: 'Es: Raccolta' },
            { key: 'value', label: 'Valore', placeholder: 'Es: Manuale, Ott–Nov' },
          ]}
          onChange={(steps) => onChange({ ...section, steps: steps as StoryStep[] })}
          empty={() => newStep() as LooseRecord}
        />
      </div>
    </div>
  );
}

function TechnicalFields({
  section,
  onChange,
}: {
  section: ProductStorySection;
  onChange: (s: ProductStorySection) => void;
}) {
  return (
    <div>
      <label className={cls.label}>Righe tabella</label>
      <ArrayField
        items={(section.keyValues ?? []) as LooseRecord[]}
        fields={[
          { key: 'key', label: 'Caratteristica', placeholder: 'Es: Aspetto' },
          { key: 'value', label: 'Valore', placeholder: 'Es: Liquido limpido, giallo tenue' },
        ]}
        onChange={(keyValues) => onChange({ ...section, keyValues: keyValues as StoryKeyValue[] })}
        empty={() => newKV() as LooseRecord}
      />
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

const SECTION_TYPE_LABELS: Record<ProductStorySection['type'], string> = {
  items: 'Items',
  flavorProfile: 'Flavor Profile',
  origin: 'Origin & Craft',
  technicalData: 'Technical Data',
};

function SectionCard({
  section,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: {
  section: ProductStorySection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (s: ProductStorySection) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <span className="text-[11px] text-gray-300 tabular-nums select-none w-5">
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-gray-900 truncate"
        >
          {section.title || <span className="text-gray-300 italic font-normal">Sezione senza titolo</span>}
        </button>
        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded shrink-0">
          {SECTION_TYPE_LABELS[section.type]}
        </span>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={isFirst} className={`${cls.btn} disabled:opacity-25`}>↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={isLast} className={`${cls.btn} disabled:opacity-25`}>↓</button>
          <button type="button" onClick={onRemove} className={cls.btnDanger}>✕</button>
          <button type="button" onClick={() => setOpen((v) => !v)} className={cls.btn}>
            {open ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="p-4 space-y-4">
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={cls.label}>Tipo sezione</label>
              <select
                value={section.type}
                onChange={(e) => onChange({ ...section, type: e.target.value as ProductStorySection['type'] })}
                className={cls.input}
              >
                <option value="items">Items — benefici, uso, ingredienti, punti di forza</option>
                <option value="flavorProfile">Flavor Profile — cultivar + note sensoriali con foto</option>
                <option value="origin">Origin & Craft — territorio + fasi di produzione</option>
                <option value="technicalData">Technical Data — tabella chiave / valore</option>
              </select>
            </div>
            <div>
              <label className={cls.label}>Titolo sezione *</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onChange({ ...section, title: e.target.value })}
                placeholder="Es: Benefici dell'Olio"
                className={cls.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={cls.label}>Badge (opz.)</label>
              <input
                type="text"
                value={section.badge ?? ''}
                onChange={(e) => onChange({ ...section, badge: e.target.value || undefined })}
                placeholder="Es: 100% Biologico Certificato"
                className={cls.input}
              />
            </div>
            <div>
              <label className={cls.label}>Intro paragrafo (opz.)</label>
              <input
                type="text"
                value={section.description ?? ''}
                onChange={(e) => onChange({ ...section, description: e.target.value || undefined })}
                className={cls.input}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Type-specific fields */}
          {section.type === 'items' && <ItemsFields section={section} onChange={onChange} />}
          {section.type === 'flavorProfile' && <FlavorFields section={section} onChange={onChange} />}
          {section.type === 'origin' && <OriginFields section={section} onChange={onChange} />}
          {section.type === 'technicalData' && <TechnicalFields section={section} onChange={onChange} />}
        </div>
      )}
    </div>
  );
}

// ─── Story builder (single locale) ───────────────────────────────────────────

function StoryBuilder({
  story,
  onChange,
}: {
  story: ProductStory;
  onChange: (s: ProductStory) => void;
}) {
  const sections = story.sections ?? [];

  const updateSection = (i: number, s: ProductStorySection) => {
    const next = [...sections];
    next[i] = s;
    onChange({ sections: next });
  };

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ sections: next });
  };

  return (
    <div className="space-y-2">
      {sections.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded">
          Nessuna sezione. Aggiungi la prima per iniziare.
        </p>
      )}
      {sections.map((section, i) => (
        <SectionCard
          key={i}
          section={section}
          index={i}
          isFirst={i === 0}
          isLast={i === sections.length - 1}
          onChange={(s) => updateSection(i, s)}
          onRemove={() => onChange({ sections: sections.filter((_, idx) => idx !== i) })}
          onMove={(dir) => moveSection(i, dir)}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange({ sections: [...sections, newSection()] })}
        className="w-full py-3 border border-dashed border-gray-300 rounded text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Aggiungi sezione
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ProductStoryEditor({
  valueIt,
  valueEn,
  onChangeIt,
  onChangeEn,
}: ProductStoryEditorProps) {
  const [locale, setLocale] = useState<'it' | 'en'>('it');

  const storyIt = valueIt ?? { sections: [] };
  const storyEn = valueEn ?? { sections: [] };

  return (
    <div>
      {/* IT / EN tab switcher */}
      <div className="flex border-b border-gray-200 mb-4">
        {(['it', 'en'] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              locale === loc
                ? 'border-olive text-olive'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {loc.toUpperCase()} — {loc === 'it' ? 'Italiano' : 'English'}
            <span className="ml-2 text-xs opacity-60">
              ({(loc === 'it' ? storyIt : storyEn).sections?.length ?? 0})
            </span>
          </button>
        ))}
      </div>

      {locale === 'it' ? (
        <StoryBuilder story={storyIt} onChange={onChangeIt} />
      ) : (
        <StoryBuilder story={storyEn} onChange={onChangeEn} />
      )}
    </div>
  );
}
