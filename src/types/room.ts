// Core types for the voice chat language learning system
export interface User {
  id: string;
  name: string;
  avatar: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  isOnline: boolean;
  lastSeen: Date;
  voiceStatus: VoiceStatus;
}

export interface VoiceStatus {
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  micPermission: 'granted' | 'denied' | 'prompt';
  volume: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  language: string;
  hostId: string;
  participants: User[];
  maxParticipants: number;
  isPrivate: boolean;
  password?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  tags: string[];
  currentActivity?: Activity;
  aiAssistant: AIAssistant;
  voiceSettings: VoiceRoomSettings;
  createdAt: Date;
  lastActivity: Date;
}

export interface VoiceRoomSettings {
  isVoiceEnabled: boolean;
  pushToTalk: boolean;
  noiseSupression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  maxSpeakers: number;
  moderationMode: 'open' | 'moderated' | 'push-to-talk-only';
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'correction' | 'translation' | 'activity' | 'system';
  correction?: Correction;
  translation?: Translation;
  reactions: Reaction[];
  voiceData?: VoiceMessage;
}

export interface VoiceMessage {
  duration: number;
  waveform: number[];
  transcription?: string;
  language?: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation';
}

export interface Translation {
  original: string;
  translated: string;
  targetLanguage: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Activity {
  id: string;
  type:
    | 'vocabulary'
    | 'pronunciation'
    | 'grammar'
    | 'conversation'
    | 'quiz'
    | 'story'
    | 'debate'
    | 'listening';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: string[];
  isActive: boolean;
  data: any;
}

export interface AIAssistant {
  personality: 'friendly' | 'professional' | 'encouraging' | 'strict';
  specialization: 'grammar' | 'vocabulary' | 'pronunciation' | 'culture' | 'general';
  isActive: boolean;
  responseFrequency: 'high' | 'medium' | 'low';
  voiceEnabled: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeSpeakers: number;
}

export interface VoicePermission {
  userId: string;
  canSpeak: boolean;
  canUnmute: boolean;
  priority: number;
}
