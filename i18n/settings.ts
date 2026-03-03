// i18n settings for Next.js app
export const languages = ['ar', 'en'] as const
export type Language = typeof languages[number]

export const defaultLanguage = 'ar'

export const languageNames = {
  ar: 'العربية',
  en: 'English'
} as const

export function getLanguageName(lang: Language): string {
  return languageNames[lang]
}

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language)
}