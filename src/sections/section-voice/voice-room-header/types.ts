export type SelectedTabType = 'find' | 'entry';

export type VoiceParticipant = {
  id?: string;
  userId?: string;
  name?: string;
  username?: string;
  profilePhoto?: string;
  avatar?: string;
  photo?: string;

  // Possible speaking fields depending on your participant object
  isSpeaking?: boolean;
  isTalking?: boolean;
  isSpeakingNow?: boolean;
  speaking?: boolean;
  voiceState?: {
    isSpeaking?: boolean;
    isTalking?: boolean;
  };

  [key: string]: any;
};
