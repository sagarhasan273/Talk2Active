import type { VoiceParticipant } from './types';

export function getParticipantId(participant: VoiceParticipant) {
  return participant?.id || participant?.userId || '';
}

export function getParticipantName(participant: VoiceParticipant) {
  return participant?.name || participant?.username || 'Unknown user';
}

export function getParticipantAvatar(participant: VoiceParticipant) {
  return participant?.profilePhoto || participant?.avatar || participant?.photo || '';
}

export function isParticipantSpeaking(participant: VoiceParticipant) {
  return Boolean(
    participant?.isSpeaking ||
    participant?.isTalking ||
    participant?.isSpeakingNow ||
    participant?.speaking ||
    participant?.voiceState?.isSpeaking ||
    participant?.voiceState?.isTalking
  );
}
