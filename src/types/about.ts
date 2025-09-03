// types/about.ts
import { ReactNode } from 'react';

// Tipo base per fratello (versione compatta)
export interface Brother {
  id: number;
  name: string;
  role: string;
  description: string;
  speciality: string;
  photo: string;
  quote: string;
}

// Tipo esteso per fratello (versione completa)
export interface BrotherFull extends Brother {
  age: string;
  details: string;
  achievements: string[];
}

// Tipo per valori aziendali
export interface Value {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

// Tipo per eventi timeline
export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  details: string;
}

// Tipo per statistiche storia aziendale
export interface HistoryStats {
  years: string;
  yearsLabel: string;
  generations: string;
  generationsLabel: string;
  family: string;
  familyLabel: string;
}

// Tipo per storia aziendale
export interface History {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stats: HistoryStats;
  imageCaption: string;
  imageNote: string;
}

// Props per componenti
export interface BrothersSectionProps {
  brothers: Brother[] | BrotherFull[];
  title: string;
  subtitle?: string;
  achievements?: string;
  variant?: "full" | "compact";
}

export interface BrotherCardProps {
  brother: Brother | BrotherFull;
  achievements?: string;
  variant?: "full" | "compact";
}

export interface ValuesSectionProps {
  values: Value[];
  title: string;
  subtitle?: string;
  variant?: "full" | "compact";
}

export interface ValueCardProps {
  value: Value;
}

export interface TimelineSectionProps {
  timeline: TimelineEvent[];
  title: string;
}

export interface TimelineItemProps {
  item: TimelineEvent;
  index: number;
  isActive: boolean;
  onHover: () => void;
}

export interface TimelineItemMobileProps {
  item: TimelineEvent;
}

export interface HistorySectionProps {
  history: History;
  variant?: "full" | "compact";
}

export interface HistoryImageProps {
  imageCaption: string;
  imageNote: string;
}

// Type guards per distinguere tra Brother e BrotherFull
export function isBrotherFull(brother: Brother | BrotherFull): brother is BrotherFull {
  return 'age' in brother && 'details' in brother && 'achievements' in brother;
}

// Utility types per i colori
export type ColorVariant = 'olive' | 'salvia' | 'nocciola' | 'sabbia' | 'beige';

// Tipo per varianti componenti
export type ComponentVariant = 'full' | 'compact';

export interface ValueFull {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}