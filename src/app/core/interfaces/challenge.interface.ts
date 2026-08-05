export interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  month_challenge_id?: number;
}

export interface ChallengeDayProgress {
  id: number;
  month_challenge_id: number;
  day: number;
  completed: boolean;
}

export interface MonthChallengeData {
  challenge: Challenge;
  progress: ChallengeDayProgress[];
  stats: {
    completedDays: number;
    totalDays: number;
    percentage: number;
  };
}
