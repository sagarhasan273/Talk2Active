import type { LucideIcon } from 'lucide-react';
import type { UserType } from 'src/types/type-user';

export interface ChatUserStatus {
  name: UserType['status'];
  label: string;
  icon: LucideIcon;
  color:
    | 'success.main'
    | 'error.light'
    | 'yellow.main'
    | 'orange.main'
    | 'stone.main'
    | 'stone.dark';
  bgColor: 'success' | 'error' | 'yellow' | 'orange' | 'stone' | 'stone';
  bgColorChannel: 'mainChannel' | 'lightChannel' | 'darkChannel';
}

// Types
export type AudioQuality = 'low' | 'medium' | 'high';

export type ChatUserCardAudioSettings = {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  volume: number;
  audioQuality: AudioQuality;
};
