'use client'
import { useLocale } from '@/contexts/LocaleContext'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('it')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
          locale === 'it' 
            ? 'bg-olive text-beige' 
            : 'text-nocciola hover:text-olive'
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
          locale === 'en' 
            ? 'bg-olive text-beige' 
            : 'text-nocciola hover:text-olive'
        }`}
      >
        EN
      </button>
    </div>
  )
}