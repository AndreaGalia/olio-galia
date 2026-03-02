'use client'
import { useLocale } from '@/contexts/LocaleContext'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('it')}
        className={`px-3 py-1 text-sm transition-colors cursor-pointer ${
          locale === 'it'
            ? 'font-bold text-black'
            : 'font-medium text-nocciola hover:text-black'
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 text-sm transition-colors cursor-pointer ${
          locale === 'en'
            ? 'font-bold text-black'
            : 'font-medium text-nocciola hover:text-black'
        }`}
      >
        EN
      </button>
    </div>
  )
}