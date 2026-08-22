export type VisibilityLevel = 'public' | 'shared' | 'private';
export type MediaVisibility = 'public' | 'members' | 'collaborators' | 'owner_only';
export type MemberRole = 'owner' | 'editor' | 'collaborator' | 'viewer';
export type CertaintyLevel = 'confirmed' | 'probable' | 'estimated' | 'investigating';
export type Gender = 'M' | 'F' | 'other' | 'unknown';

export type RelationshipType = 
  | 'parent' 
  | 'child' 
  | 'spouse' 
  | 'partner' 
  | 'sibling' 
  | 'grandparent' 
  | 'grandchild' 
  | 'great_grandparent' 
  | 'great_grandchild' 
  | 'guardian' 
  | 'custom';

export type EventType = 
  | 'birth' 
  | 'baptism' 
  | 'marriage' 
  | 'divorce' 
  | 'death' 
  | 'migration' 
  | 'immigration' 
  | 'emigration' 
  | 'military' 
  | 'education' 
  | 'work' 
  | 'property' 
  | 'custom';

export type MediaType = 
  | 'photo' 
  | 'document' 
  | 'letter' 
  | 'certificate' 
  | 'passport' 
  | 'record' 
  | 'clipping' 
  | 'other';

export type SourceType = 
  | 'birth_certificate' 
  | 'marriage_certificate' 
  | 'civil_registry' 
  | 'church' 
  | 'historical_archive' 
  | 'family_photo' 
  | 'oral_testimony' 
  | 'book' 
  | 'private_document' 
  | 'website' 
  | 'public_archive' 
  | 'other';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  isAnonymous?: boolean;
  storageMode?: 'cloud' | 'local' | 'hybrid';
  createdAt: string;
  lastLoginAt: string;
  privacyPreferences?: {
    hideEmailFromMembers?: boolean;
    notifyOnRequests?: boolean;
    notifyOnProposals?: boolean;
  };
}

export interface SurnameStyle {
  surname: string;
  bgColor: string;
  textColor?: string;
  borderColor?: string;
  accentColor?: string;
  pattern?: 'classic' | 'parchment' | 'heraldic' | 'linen' | 'gold-leaf' | 'vintage-damask';
}

export interface TreeSettings {
  hideLivingDetails: boolean;
  livingAgeThreshold: number; // default 100
  defaultRoleForInvites: MemberRole;
  allowPublicRequests: boolean;
  requireProposalApproval: boolean;
  showCommentsToPublic: boolean;
  surnameStyles?: Record<string, SurnameStyle>;
}

export interface Tree {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  coverImage?: string;
  visibility: VisibilityLevel;
  members?: TreeMember[];
  slug?: string;
  settings: TreeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  treeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  gender: Gender;
  birthDate?: string;
  birthDateApprox?: string; // e.g. "≈ 1890", "Entre 1888 y 1892"
  birthPlace?: string;
  birthCoordinates?: { lat: number; lng: number };
  deathDate?: string;
  deathDateApprox?: string;
  deathPlace?: string;
  deathCoordinates?: { lat: number; lng: number };
  isLiving: boolean;
  bio?: string;
  profession?: string;
  nationality?: string;
  avatarUrl?: string;
  aliases?: string[];
  notes?: string;
  tags?: string[];
  certainty: CertaintyLevel;
  sourceIds?: string[];
  isPrivate?: boolean;
  isPlaceholder?: boolean;
  placeholderRole?: string;
  generation?: number;
  position?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Relationship {
  id: string;
  treeId: string;
  person1Id: string; // from/source person (e.g. Parent or Spouse1)
  person2Id: string; // to/target person (e.g. Child or Spouse2)
  type: RelationshipType;
  customTypeLabel?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  certainty?: CertaintyLevel;
  sourceIds?: string[];
  createdAt: string;
  createdBy?: string;
}

export interface FamilyEvent {
  id: string;
  treeId: string;
  type: EventType;
  title: string;
  date?: string;
  dateApprox?: string;
  place?: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  personIds: string[]; // Person IDs involved
  mediaIds?: string[];
  sourceIds?: string[];
  certainty?: CertaintyLevel;
  createdAt: string;
  createdBy?: string;
}

export interface MediaItem {
  id: string;
  treeId: string;
  title: string;
  type: MediaType;
  url: string; // Data URL, Cloud URL or direct image/doc URL
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
  relatedPersonIds: string[];
  relatedEventId?: string;
  description?: string;
  historicalDate?: string;
  historicalPlace?: string;
  sourceId?: string;
  visibility: MediaVisibility;
  tags: string[];
}

export interface HistoricalSource {
  id: string;
  treeId: string;
  title: string;
  type: SourceType;
  repository?: string;
  url?: string;
  citation?: string;
  confidence: CertaintyLevel;
  notes?: string;
  mediaId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface TreeMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: MemberRole;
  status: 'active' | 'invited' | 'pending';
  invitedAt: string;
  joinedAt?: string;
}

export interface AccessRequest {
  id: string;
  treeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  message: string;
  familyRelation: string;
  contributionIntent: string;
  requestedRole: MemberRole;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Proposal {
  id: string;
  treeId: string;
  targetType: 'person' | 'relationship' | 'event' | 'media';
  targetId: string;
  targetName?: string;
  fieldChanged: string;
  currentValue: any;
  proposedValue: any;
  proposedBy: string;
  proposedByName: string;
  sourceNote?: string;
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ChangeLog {
  id: string;
  treeId: string;
  entityType: 'person' | 'relationship' | 'event' | 'media' | 'member' | 'tree' | 'source';
  entityId: string;
  entityName?: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  summary: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  timestamp: string;
  previousSnapshot?: any;
  newSnapshot?: any;
}

export interface Comment {
  id: string;
  treeId: string;
  targetType: 'person' | 'media' | 'event' | 'tree';
  targetId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
}

export interface DuplicateMatch {
  personA: Person;
  personB: Person;
  similarityScore: number; // 0 - 100
  reasons: string[];
}

// ==========================================
// GIT-LIKE VERSION CONTROL & BRANCHING TYPES
// ==========================================

export type MergeStrategy = 'theirs' | 'ours' | 'manual';

export interface CommitAuthor {
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  isAnonymous?: boolean;
  role?: MemberRole;
}

export interface TreeSnapshot {
  people: Person[];
  relationships: Relationship[];
  events?: FamilyEvent[];
  media?: MediaItem[];
  sources?: HistoricalSource[];
  surnameStyles?: Record<string, SurnameStyle>;
}

export interface FieldDiff {
  fieldName?: string;
  field?: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  type?: 'added' | 'changed' | 'removed';
}

export interface EntityDelta {
  entityId: string;
  entityName: string;
  entityType: 'person' | 'relationship' | 'event' | 'media' | 'source';
  changeType: 'created' | 'modified' | 'deleted';
  diffs?: FieldDiff[];
  snapshotBefore?: any;
  snapshotAfter?: any;
}

export interface CommitDelta {
  action?: string;
  details?: string;
  fieldDiffs?: FieldDiff[];
  addedPeopleCount?: number;
  modifiedPeopleCount?: number;
  deletedPeopleCount?: number;
  relationshipsCount?: number;
  eventsCount?: number;
  mediaCount?: number;
  sourcesCount?: number;
  entityDeltas?: EntityDelta[];
  [key: string]: any;
}

export interface TreeCommit {
  id: string; // SHA-like hex ID or UUID
  shortHash?: string;
  treeId: string;
  branchId: string;
  branchName?: string;
  parentCommitId: string | null; // null for initial commit
  secondParentCommitId?: string | null; // For merge commits
  message: string;
  author: CommitAuthor;
  authorName?: string;
  authorPhoto?: string;
  isAnonymous?: boolean;
  actionType?: string;
  metadata?: any;
  timestamp: string;
  snapshot: TreeSnapshot; // Full immutable snapshot for fast checkout & diff
  delta?: CommitDelta;
  isMerge?: boolean;
  isMergeCommit?: boolean;
  mergedFromBranchId?: string;
  mergedFromBranchName?: string;
  tag?: string; // Optional tag e.g. "v1.0-archivo-bautismal"
}

export interface TreeBranch {
  id: string;
  treeId: string;
  name: string; // e.g. "main", "rama-materna-gomez", "investigacion-1900"
  description?: string;
  color?: string;
  baseCommitId?: string;
  headCommitId: string;
  createdAt: string;
  createdBy: CommitAuthor;
  createdByName?: string;
  isDefault: boolean; // true for "main"
  status: 'active' | 'merged' | 'abandoned' | 'archived';
  mergedIntoBranchId?: string;
  mergedAt?: string;
  updatedAt?: string;
  lastActivityAt?: string;
}

export interface BranchDiffSummary {
  sourceBranch: TreeBranch;
  targetBranch: TreeBranch;
  sourceHead?: TreeCommit;
  sourceHeadCommit?: TreeCommit;
  targetHead?: TreeCommit;
  targetHeadCommit?: TreeCommit;
  commonAncestorCommitId?: string | null;
  aheadCount?: number;
  behindCount?: number;
  conflictEntities?: {
    entityId: string;
    entityName: string;
    entityType: 'person' | 'relationship' | 'event';
    sourceState: any;
    targetState: any;
    baseState?: any;
  }[];
  cleanEntities?: EntityDelta[];
  addedPeople?: Person[];
  modifiedPeople?: { person: Person; changes: FieldDiff[] }[];
  deletedPeople?: Person[];
  addedRelationships?: Relationship[];
  deletedRelationships?: Relationship[];
  totalChangesCount?: number;
  hasConflicts?: boolean;
  conflicts?: any[];
}

export * from './familyLobby';
