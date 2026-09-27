// ----------------------------------------------------------------------
// Speaking Proficiency & Rating Types
// ----------------------------------------------------------------------

export type SpeakingProficiencyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'fluent'
  | 'native';

export type SubmitRatingReq = {
  targetUserId: string;
  rating: number; // 1 to 5
  levelFeedback: SpeakingProficiencyLevel;
};

export type UserRatingStats = {
  userId: string;
  average: number;
  count: number;
  totalScore: number;
};

export type SubmitRatingRes = {
  success: boolean;
  message: string;
  data: {
    isNew: boolean;
    rating: number;
    stats: UserRatingStats;
  };
};

export type UserRatingStatsRes = {
  success: boolean;
  data: UserRatingStats;
};
