'use client'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/i18n'

export function useT() {
  const { locale } = useLocale()
  return useTranslations(locale)
}