/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

export type AchievementCategory = 
  | 'construction'
  | 'generations'
  | 'photos'
  | 'documents'
  | 'stories'
  | 'dates'
  | 'places'
  | 'surnames'
  | 'collaboration'
  | 'verification'
  | 'sources'
  | 'discovery'
  | 'research'
  | 'preservation'
  | 'events'
  | 'secret'
  | 'collections';

export interface ResearcherLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
  color: string;
  badge: string;
  description: string;
  perks: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  secretDescription?: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
  percent: number;
  badgeTitle?: string;
  isSecret?: boolean;
  tier?: number;
  chainName?: string;
  rewardDetails?: string;
  unlockedByUserName?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special_event';
  category: AchievementCategory;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  expiresIn?: string;
  iconName: string;
  actionHint?: string;
  targetPersonId?: string;
  targetPersonName?: string;
}

export interface FamilyCollection {
  id: string;
  title: string;
  description: string;
  iconName: string;
  achievementIds: string[];
  completedCount: number;
  totalCount: number;
  completed: boolean;
  rewardTitle: string;
  rewardBadge: string;
}

export interface FamilyTreeStats {
  personsCount: number;
  livingCount: number;
  deceasedCount: number;
  generationsDepth: number;
  photosCount: number;
  documentsCount: number;
  storiesCount: number;
  sourcesCount: number;
  verifiedDataCount: number;
  collaboratorsCount: number;
  surnamesCount: number;
  countriesCount: number;
  placesCount: number;
  eventsCount: number;
  centuriesCount: number;
  oldestBirthYear?: number;
  completenessAverage: number;
  relationshipsCount: number;
}

export interface SmartRecommendation {
  id: string;
  type: 'missing_photo' | 'missing_parent' | 'missing_date' | 'missing_source' | 'achievement_near' | 'branch_unexplored';
  title: string;
  description: string;
  targetAchievementId?: string;
  targetAchievementTitle?: string;
  personId?: string;
  personName?: string;
  actionType: string;
  xpPotential: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface BranchProgress {
  surname: string;
  personCount: number;
  generationsDepth: number;
  photosCount: number;
  documentsCount: number;
  sourcesCount: number;
  completenessPercent: number;
  oldestAncestor?: string;
}

export interface GamificationState {
  currentXp: number;
  level: ResearcherLevel;
  nextLevel: ResearcherLevel | null;
  progressToNextLevel: number; // 0 to 100
  equippedTitle: string;
  streakDays: number;
  lastActiveDate: string;
  unlockedAchievements: Record<string, string>; // achievementId -> unlockedAt
  completedMissions: Record<string, string>; // missionId -> completedAt
  unlockedTitles: string[];
  stats: FamilyTreeStats;
  achievements: Achievement[];
  missions: Mission[];
  collections: FamilyCollection[];
  recommendations: SmartRecommendation[];
  branchProgress: BranchProgress[];
  recentUnlocks: Achievement[];
}

export interface PersonCompletenessBreakdown {
  score: number; // 0 - 100
  completedFields: string[];
  missingFields: string[];
  details: {
    name: boolean;
    gender: boolean;
    birthDate: boolean;
    birthPlace: boolean;
    deathDate: boolean; // or living
    avatar: boolean;
    bio: boolean;
    parents: boolean;
    partner: boolean;
    children: boolean;
    sources: boolean;
  };
}
