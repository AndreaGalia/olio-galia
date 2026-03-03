'use client'
import { useLocale } from '@/contexts/LocaleContext'

interface LanguageSwitcherProps {
  mobile?: boolean;
}

export function LanguageSwitcher({ mobile = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()

  const activeClass = mobile ? 'lang-btn-mobile-active' : 'lang-btn-active'
  const inactiveClass = mobile ? 'lang-btn-mobile' : 'lang-btn'

  return (
    <div className="flex items-center gap-[10px]">
      <button
        onClick={() => setLocale('it')}
        className={`px-3 py-1 text-black transition-colors cursor-pointer ${
          locale === 'it' ? activeClass : inactiveClass
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 text-black transition-colors cursor-pointer ${
          locale === 'en' ? activeClass : inactiveClass
        }`}
      >
        EN
      </button>
    </div>
  )
}