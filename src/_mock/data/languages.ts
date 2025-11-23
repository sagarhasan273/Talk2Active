import type { Language } from 'src/types/type-room';

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeSpeakers: 379000000 },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeSpeakers: 460000000 },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeSpeakers: 280000000 },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeSpeakers: 95000000 },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeSpeakers: 65000000 },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeSpeakers: 260000000 },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeSpeakers: 154000000 },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeSpeakers: 125000000 },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeSpeakers: 77000000 },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeSpeakers: 918000000 },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeSpeakers: 422000000 },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeSpeakers: 602000000 },
];

export const getLanguageByCode = (code: string): Language | undefined =>
  languages.find((lang) => lang.code === code);

export const getLanguageFlag = (code: string): string => {
  const language = getLanguageByCode(code);
  return language?.flag || '🌐';
};
