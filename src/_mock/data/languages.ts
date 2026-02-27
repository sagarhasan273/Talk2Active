import type { Language } from 'src/types/type-room';

export const languages: Language[] = [
  // Most Spoken Languages (1B+ speakers)
  { code: 'en', name: 'English', flag: '🇬🇧', nativeSpeakers: 379000000 },
  { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳', nativeSpeakers: 918000000 },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeSpeakers: 602000000 },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeSpeakers: 460000000 },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeSpeakers: 280000000 },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeSpeakers: 422000000 },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeSpeakers: 265000000 },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeSpeakers: 154000000 },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeSpeakers: 260000000 },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeSpeakers: 231000000 },

  // European Languages
  { code: 'de', name: 'German', flag: '🇩🇪', nativeSpeakers: 95000000 },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeSpeakers: 65000000 },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeSpeakers: 24000000 },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeSpeakers: 40000000 },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', nativeSpeakers: 33000000 },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeSpeakers: 24000000 },
  { code: 'el', name: 'Greek', flag: '🇬🇷', nativeSpeakers: 13000000 },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', nativeSpeakers: 13000000 },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', nativeSpeakers: 10700000 },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeSpeakers: 10200000 },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', nativeSpeakers: 8000000 },
  { code: 'da', name: 'Danish', flag: '🇩🇰', nativeSpeakers: 5600000 },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeSpeakers: 5400000 },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', nativeSpeakers: 5200000 },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeSpeakers: 5000000 },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', nativeSpeakers: 5600000 },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', nativeSpeakers: 3000000 },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮', nativeSpeakers: 2100000 },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', nativeSpeakers: 1500000 },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', nativeSpeakers: 1100000 },

  // Asian Languages
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeSpeakers: 125000000 },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeSpeakers: 77000000 },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeSpeakers: 76000000 },
  { code: 'th', name: 'Thai', flag: '🇹🇭', nativeSpeakers: 60000000 },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeSpeakers: 43000000 },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeSpeakers: 29000000 },
  { code: 'tl', name: 'Tagalog (Filipino)', flag: '🇵🇭', nativeSpeakers: 28000000 },
  { code: 'my', name: 'Burmese', flag: '🇲🇲', nativeSpeakers: 33000000 },
  { code: 'km', name: 'Khmer (Cambodian)', flag: '🇰🇭', nativeSpeakers: 16000000 },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', nativeSpeakers: 7000000 },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', nativeSpeakers: 16000000 },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰', nativeSpeakers: 16000000 },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳', nativeSpeakers: 5600000 },

  // Middle Eastern Languages
  { code: 'fa', name: 'Persian (Farsi)', flag: '🇮🇷', nativeSpeakers: 62000000 },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeSpeakers: 5000000 },
  { code: 'ku', name: 'Kurdish', flag: '🇹🇷', nativeSpeakers: 26000000 },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫', nativeSpeakers: 21000000 },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', nativeSpeakers: 24000000 },

  // South Asian Languages
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeSpeakers: 113000000 },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeSpeakers: 83000000 },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeSpeakers: 82000000 },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeSpeakers: 78000000 },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeSpeakers: 55000000 },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeSpeakers: 44000000 },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeSpeakers: 37000000 },
  { code: 'or', name: 'Odia (Oriya)', flag: '🇮🇳', nativeSpeakers: 35000000 },
  { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeSpeakers: 15000000 },

  // African Languages
  { code: 'sw', name: 'Swahili', flag: '🇹🇿', nativeSpeakers: 15000000 },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', nativeSpeakers: 43000000 },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', nativeSpeakers: 38000000 },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', nativeSpeakers: 27000000 },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', nativeSpeakers: 32000000 },
  { code: 'so', name: 'Somali', flag: '🇸🇴', nativeSpeakers: 15000000 },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', nativeSpeakers: 12000000 },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦', nativeSpeakers: 8200000 },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', nativeSpeakers: 12000000 },
  { code: 'sn', name: 'Shona', flag: '🇿🇼', nativeSpeakers: 11000000 },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸', nativeSpeakers: 5600000 },
  { code: 'tn', name: 'Setswana', flag: '🇧🇼', nativeSpeakers: 5300000 },

  // Turkic Languages
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeSpeakers: 75000000 },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿', nativeSpeakers: 27000000 },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿', nativeSpeakers: 13000000 },
  { code: 'tk', name: 'Turkmen', flag: '🇹🇲', nativeSpeakers: 7000000 },
  { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬', nativeSpeakers: 4600000 },

  // Austronesian Languages
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭', nativeSpeakers: 21000000 },
  { code: 'ilo', name: 'Ilocano', flag: '🇵🇭', nativeSpeakers: 8000000 },
  { code: 'hmn', name: 'Hmong', flag: '🇨🇳', nativeSpeakers: 3800000 },
  { code: 'war', name: 'Waray', flag: '🇵🇭', nativeSpeakers: 3100000 },

  // Native American Languages
  { code: 'qu', name: 'Quechua', flag: '🇵🇪', nativeSpeakers: 8000000 },
  { code: 'ay', name: 'Aymara', flag: '🇧🇴', nativeSpeakers: 2000000 },
  { code: 'gn', name: 'Guarani', flag: '🇵🇾', nativeSpeakers: 6500000 },
  { code: 'nah', name: 'Nahuatl', flag: '🇲🇽', nativeSpeakers: 1500000 },

  // Baltic Languages
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', nativeSpeakers: 1500000 },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', nativeSpeakers: 3000000 },

  // Celtic Languages
  { code: 'ga', name: 'Irish', flag: '🇮🇪', nativeSpeakers: 170000 },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', nativeSpeakers: 500000 },
  { code: 'gd', name: 'Scottish Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', nativeSpeakers: 57000 },
  { code: 'br', name: 'Breton', flag: '🇫🇷', nativeSpeakers: 210000 },

  // Other European Languages
  { code: 'sq', name: 'Albanian', flag: '🇦🇱', nativeSpeakers: 6000000 },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲', nativeSpeakers: 5300000 },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪', nativeSpeakers: 3700000 },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹', nativeSpeakers: 520000 },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸', nativeSpeakers: 360000 },

  // Constructed Languages
  { code: 'eo', name: 'Esperanto', flag: '🏴', nativeSpeakers: 1000 },
  { code: 'ia', name: 'Interlingua', flag: '🏴', nativeSpeakers: 1500 },

  // Sign Languages (using ISO 639-3 codes)
  { code: 'ase', name: 'American Sign Language', flag: '🇺🇸', nativeSpeakers: 250000 },
  { code: 'bfi', name: 'British Sign Language', flag: '🇬🇧', nativeSpeakers: 77000 },
  { code: 'bzs', name: 'Brazilian Sign Language', flag: '🇧🇷', nativeSpeakers: 3000000 },
  { code: 'csq', name: 'Chinese Sign Language', flag: '🇨🇳', nativeSpeakers: 20000000 },
  { code: 'fsl', name: 'French Sign Language', flag: '🇫🇷', nativeSpeakers: 100000 },
  { code: 'gsg', name: 'German Sign Language', flag: '🇩🇪', nativeSpeakers: 200000 },
  { code: 'inl', name: 'Indonesian Sign Language', flag: '🇮🇩', nativeSpeakers: 800000 },
  { code: 'jsl', name: 'Japanese Sign Language', flag: '🇯🇵', nativeSpeakers: 300000 },
  { code: 'kvk', name: 'Korean Sign Language', flag: '🇰🇷', nativeSpeakers: 180000 },
  { code: 'mzg', name: 'Mexican Sign Language', flag: '🇲🇽', nativeSpeakers: 130000 },
  { code: 'rsl', name: 'Russian Sign Language', flag: '🇷🇺', nativeSpeakers: 120000 },
  { code: 'spa', name: 'Spanish Sign Language', flag: '🇪🇸', nativeSpeakers: 100000 },
];
export const getLanguageByCode = (code: string): Language | undefined =>
  languages.find((lang) => lang.code === code);

export const getLanguageFlag = (code: string): string => {
  const language = getLanguageByCode(code);
  return language?.flag || '🌐';
};
