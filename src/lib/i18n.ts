import itTranslations from '@/data/locales/it.json'
import enTranslations from '@/data/locales/en.json'

export type Locale = 'it' | 'en'
export type TranslationKeys = typeof itTranslations

const translations = {
  it: itTranslations,
  en: enTranslations
} as const

export const defaultLocale: Locale = 'it'
export const locales: Locale[] = ['it', 'en']

// Funzione per ottenere le traduzioni
export function getTranslations(locale: Locale = defaultLocale): TranslationKeys {
  return translations[locale] || translations[defaultLocale]
}

// Hook per le traduzioni
export function useTranslations(locale: Locale = defaultLocale) {
  const t = getTranslations(locale)
  
  // Funzione helper per traduzioni con interpolazione
  const translate = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = t
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Interpolazione parametri
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }
  
  return { t, translate }
}