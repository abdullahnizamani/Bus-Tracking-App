
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';  
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ur from './locales/ur.json';

const LANGUAGE_KEY = '@app_language';

const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      }
    } catch (error) {
      console.log('Error reading language from storage', error);
    }
    
    const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
    callback(deviceLanguage);
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language to storage', error);
    }
  }
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin) 
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false }, 
  });

export default i18n;