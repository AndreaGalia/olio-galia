export interface StoryItem {
  [k: string]: string | undefined;
  name: string;
  description: string;
  image?: string;
  action?: string; // e.g. "Emolliente, idratante" for cosmetic ingredients
}

export interface StorySensorNote {
  [k: string]: string | undefined;
  label: string;  // e.g. "Colore", "Profumo", "Gusto", "Retrogusto"
  value: string;  // e.g. "Dorato-verde brillante"
  image?: string; // editorial photo for this note
}

export interface StoryStep {
  [k: string]: string | undefined;
  label: string; // e.g. "Raccolta"
  value: string; // e.g. "Manuale, Ottobre-Novembre"
}

export interface StoryKeyValue {
  [k: string]: string | undefined;
  key: string;
  value: string;
}

export type StorySectionLayout = 'grid' | 'list';

export interface ProductStorySection {
  /** Rendering strategy for this section */
  type: 'items' | 'flavorProfile' | 'origin' | 'technicalData';
  /** Section title (already localised — stored per-locale in MongoDB) */
  title: string;
  /** 'grid' (default) or 'list' — used for 'items' sections */
  layout?: StorySectionLayout;
  /** Optional certification/badge text shown above the section content */
  badge?: string;
  /** Optional intro paragraph */
  description?: string;

  // --- 'items' ---
  items?: StoryItem[];

  // --- 'flavorProfile' ---
  cultivars?: StoryItem[];
  sensorNotes?: StorySensorNote[];

  // --- 'origin' ---
  location?: string;
  altitude?: string;
  climate?: string;
  territory?: string; // descriptive paragraph about the area
  steps?: StoryStep[];

  // --- 'technicalData' ---
  keyValues?: StoryKeyValue[];
}

export interface ProductStory {
  sections: ProductStorySection[];
}
