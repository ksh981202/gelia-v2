import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'
import jp from './locales/jp.json'
import vn from './locales/vn.json'
import th from './locales/th.json'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    jp: { translation: jp },
    ja: { translation: jp },
    vn: { translation: vn },
    vi: { translation: vn },
    th: { translation: th },
  },
  lng: 'ko',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
