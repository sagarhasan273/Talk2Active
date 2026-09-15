import { languages, LEVEL_OPTIONS } from '@/lib/filter-data';
import type { VoiceParticipant } from './types';

export function getParticipantId(p?: VoiceParticipant | null): string {
  if (!p) return '';
  return p.id || p.userId || p.user?.userId || p.user?.id || '';
}

export function getParticipantName(p?: VoiceParticipant | null): string {
  if (!p) return 'Unknown User';
  return p.name || p.username || p.user?.name || 'User';
}

export function getParticipantAvatar(p?: VoiceParticipant | null): string {
  if (!p) return '';
  return p.avatarUrl || p.profilePhoto || p.user?.profilePhoto || '';
}

export function isParticipantSpeaking(p?: VoiceParticipant | null): boolean {
  if (!p) return false;
  return Boolean(p.isSpeaking || p.audioState === 'speaking');
}

export function formatLanguages(languages?: string[] | string): string {

  if (!languages) return 'English';

  if (Array.isArray(languages)) {

    return languages.length > 0 ? languages.join(', ') : 'English';

  }

  return String(languages);

}


// New helper function to get full language objects
export function getLanguageDetails(languageCodes?: string[] | string) {
  if (!languageCodes) {
    // Default to English if nothing is provided
    return [languages.find(l => l.code === 'en') || { code: 'en', name: 'English', flag: '🇬🇧' }];
  }

  const codesArray = Array.isArray(languageCodes) ? languageCodes : [languageCodes];

  // Map codes to details, filter out any undefined results if a code isn't found
  return codesArray
    .map(code => languages.find(l => l.code === code))
    .filter(Boolean) as typeof languages;
}

export function getLevelLabel(value: string | undefined | null, includeEmoji: boolean = false): string {
  if (!value) return 'Unknown Level';

  // Normalize the input just in case (e.g., handles "Beginner", " beginner ")
  const normalizedValue = value.toLowerCase().trim();

  const option = LEVEL_OPTIONS.find((opt) => opt.value === normalizedValue);

  if (option) {
    return includeEmoji ? `${option.emoji} ${option.label}` : option.label;
  }

  // Fallback: return the provided value if no match is found, 
  // capitalizing the first letter to make it look decent.
  return value.charAt(0).toUpperCase() + value.slice(1);
}