'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { Locale } from '../lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('it')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Solo sul client, prova a caricare il locale salvato
    if (typeof window !== 'undefined') {
      const savedLocale = window.localStorage?.getItem('locale') as Locale
      if (savedLocale && ['it', 'en'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    
    // Solo sul client, salva nel localStorage
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('locale', newLocale)
    }
    
    // Aggiorna la lingua del documento
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }

  // Durante l'hydration, usa il locale default per evitare mismatch
  const currentLocale = isClient ? locale : 'it'

  return (
    <LocaleContext.Provider value={{ locale: currentLocale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}