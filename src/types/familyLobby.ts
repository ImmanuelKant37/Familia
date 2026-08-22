/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FamilyVisibility = 'public' | 'discoverable' | 'private' | 'public_restricted';

export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'MANAGE';

export type PermissionScopeType = 'FAMILY' | 'BRANCH' | 'SURNAME' | 'PERSON';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired' | 'cancelled';

export type GrantStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export type ConnectionStatus = 'pending' | 'approved' | 'rejected';

export interface FamilyBranchSummary {
  id: string;
  name: string;
  rootPersonName: string;
  generationsCount: number;
  membersCount: number;
  surnames: string[];
  description?: string;
}

export interface FamilySummary {
  id: string;
  name: string; // e.g. "Familia Cantero"
  description: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhotoURL?: string;
  visibility: FamilyVisibility;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  surnameTags: string[]; // ['Cantero', 'Pérez', 'González']
  country: string; // e.g. 'Argentina'
  region: string; // e.g. 'Entre Ríos'
  approximateOrigin: string; // e.g. 'Concepción del Uruguay, Entre Ríos (c. 1850)'
  generationsCount: number;
  peopleCount: number;
  photosCount: number;
  documentsCount: number;
  branchesCount: number;
  branches: FamilyBranchSummary[];
  allowPublicRequests: boolean;
  isVerifiedOrigin?: boolean;
}

export interface PermissionGrant {
  id: string;
  familyId: string;
  familyName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  permissions: PermissionAction[]; // ['VIEW', 'CREATE', 'EDIT']
  scope: PermissionScopeType; // 'FAMILY' | 'BRANCH' | 'SURNAME' | 'PERSON'
  targetBranchId?: string;
  targetBranchName?: string;
  targetSurname?: string;
  targetPersonId?: string;
  targetPersonName?: string;
  grantedBy: string;
  grantedByName: string;
  grantedAt: string;
  expiresAt?: string; // Optional temporary expiration
  status: GrantStatus;
  notes?: string;
}

export interface PermissionRequest {
  id: string;
  familyId: string;
  familyName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhoto?: string;
  requestedPermissions: PermissionAction[];
  scope: PermissionScopeType;
  targetBranchId?: string;
  targetBranchName?: string;
  targetSurname?: string;
  targetPersonId?: string;
  targetPersonName?: string;
  message: string;
  familyRelation: string; // "Soy bisnieto de Francisco Cantero..."
  contributionIntent?: string; // "Poseo actas parroquiales y fotos familiares..."
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  rejectionReason?: string;
}

export interface FamilyInvitation {
  id: string;
  code: string; // e.g. "INV-CANTERO-789"
  familyId: string;
  familyName: string;
  permissions: PermissionAction[];
  scope: PermissionScopeType;
  targetBranchId?: string;
  targetBranchName?: string;
  targetSurname?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'revoked';
}

export type FamilyConnectionType = 
  | 'POSSIBLE_COMMON_ORIGIN' 
  | 'MARRIAGE_UNION' 
  | 'GEOGRAPHIC_NEIGHBORHOOD' 
  | 'DOCUMENTED_MATCH';

export interface FamilyConnection {
  id: string;
  familyAId: string;
  familyAName: string;
  familyAOwnerName: string;
  familyBId: string;
  familyBName: string;
  familyBOwnerName: string;
  connectionType?: FamilyConnectionType;
  commonSurnames: string[];
  commonLocations: string[];
  potentialLinkNote: string;
  requestedBy: string;
  requestedByName: string;
  status: ConnectionStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface LobbyAuditLog {
  id: string;
  familyId: string;
  familyName: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  action: 
    | 'CREATE_FAMILY'
    | 'PERMISSION_GRANTED'
    | 'PERMISSION_MODIFIED'
    | 'PERMISSION_REVOKED'
    | 'REQUEST_SUBMITTED'
    | 'REQUEST_APPROVED'
    | 'REQUEST_REJECTED'
    | 'INVITATION_CREATED'
    | 'INVITATION_ACCEPTED'
    | 'FAMILY_CONNECTED'
    | 'VISIBILITY_CHANGED';
  entityType: 'FAMILY' | 'GRANT' | 'REQUEST' | 'INVITATION' | 'CONNECTION';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SmartFamilyMatch {
  family: FamilySummary;
  matchScore: number; // 0 - 100
  matchedSurnames: string[];
  matchedLocations: string[];
  potentialAncestors: string[];
  relationConfidence: 'possible' | 'high_probable' | 'suggested';
  explanation: string;
}

export interface LobbyFilterOptions {
  searchQuery: string;
  surname: string;
  country: string;
  region: string;
  minGenerations: number;
  minPeople: number;
  visibility: FamilyVisibility | 'all';
  onlyOpenRequests: boolean;
}
