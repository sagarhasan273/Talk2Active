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
