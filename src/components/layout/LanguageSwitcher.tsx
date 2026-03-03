'use client'
import { useLocale } from '@/contexts/LocaleContext'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-[10px]">
      <button
        onClick={() => setLocale('it')}
        className={`px-3 py-1 text-black transition-colors cursor-pointer ${
          locale === 'it' ? 'lang-btn-active' : 'lang-btn'
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 text-black transition-colors cursor-pointer ${
          locale === 'en' ? 'lang-btn-active' : 'lang-btn'
        }`}
      >
        EN
      </button>
    </div>
  )
}