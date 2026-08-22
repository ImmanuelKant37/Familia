/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FamilySummary, 
  PermissionGrant, 
  PermissionRequest, 
  FamilyConnection, 
  LobbyAuditLog, 
  FamilyInvitation,
  SmartFamilyMatch,
  LobbyFilterOptions,
  PermissionAction,
  PermissionScopeType
} from '../types/familyLobby';
import { 
  INITIAL_DISCOVERABLE_FAMILIES, 
  INITIAL_PERMISSION_GRANTS, 
  INITIAL_PERMISSION_REQUESTS, 
  INITIAL_FAMILY_CONNECTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_INVITATIONS 
} from '../data/mockFamilies';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';

const STORAGE_KEYS = {
  FAMILIES: 'familia_lobby_families_v2',
  GRANTS: 'familia_lobby_grants_v2',
  REQUESTS: 'familia_lobby_requests_v2',
  CONNECTIONS: 'familia_lobby_connections_v2',
  AUDIT_LOGS: 'familia_lobby_audit_v2',
  INVITATIONS: 'familia_lobby_invitations_v2'
};

export type LobbyModalType = 
  | 'lobby' 
  | 'public_profile' 
  | 'request_access' 
  | 'permissions_manager' 
  | 'my_accesses' 
  | 'connect_families';

interface UserFamilyAccess {
  family: FamilySummary;
  grant?: PermissionGrant;
  isOwner: boolean;
  roleTitle: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  scopeDescription: string;
  isExpired?: boolean;
}

interface FamilyLobbyContextType {
  families: FamilySummary[];
  permissionGrants: PermissionGrant[];
  permissionRequests: PermissionRequest[];
  familyConnections: FamilyConnection[];
  auditLogs: LobbyAuditLog[];
  invitations: FamilyInvitation[];
  
  // Modals & Navigation state
  activeModal: LobbyModalType | null;
  isLobbyOpen: boolean;
  isPublicProfileOpen: boolean;
  isRequestAccessModalOpen: boolean;
  isPermissionsManagerOpen: boolean;
  isMyAccessesModalOpen: boolean;
  isConnectFamiliesModalOpen: boolean;
  selectedFamilyForProfile: FamilySummary | null;
  selectedFamilyForRequest: FamilySummary | null;
  requestInitialScope: {
    scope?: PermissionScopeType;
    branchId?: string;
    branchName?: string;
    surname?: string;
  } | null;

  // Search & Filtering
  filterOptions: LobbyFilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<LobbyFilterOptions>>;
  filteredFamilies: FamilySummary[];
  smartMatches: SmartFamilyMatch[];

  // Modal Triggers
  openLobby: () => void;
  openPublicProfile: (family: FamilySummary) => void;
  openRequestAccessModal: (
    family: FamilySummary, 
    initialScope?: { scope?: PermissionScopeType; branchId?: string; branchName?: string; surname?: string }
  ) => void;
  openPermissionsManager: (familyId?: string) => void;
  openMyAccessesModal: () => void;
  openConnectFamiliesModal: (family: FamilySummary) => void;
  closeModals: () => void;

  // Operations
  submitPermissionRequest: (
    data: Omit<PermissionRequest, 'id' | 'status' | 'createdAt' | 'requesterId' | 'requesterName' | 'requesterEmail' | 'requesterPhoto'>
  ) => Promise<PermissionRequest>;
  
  approvePermissionRequest: (
    requestId: string,
    customApproval?: {
      scope?: PermissionScopeType;
      targetBranchId?: string;
      targetBranchName?: string;
      targetSurname?: string;
      permissions?: PermissionAction[];
      expiresAt?: string;
      notes?: string;
    }
  ) => Promise<void>;

  rejectPermissionRequest: (requestId: string, reason?: string) => Promise<void>;
  
  createDirectGrant: (
    data: Omit<PermissionGrant, 'id' | 'grantedAt' | 'status' | 'grantedBy' | 'grantedByName'>
  ) => Promise<PermissionGrant>;

  updateGrant: (grantId: string, updates: Partial<PermissionGrant>) => Promise<void>;
  revokeGrant: (grantId: string) => Promise<void>;

  createInvitation: (
    data: Omit<FamilyInvitation, 'id' | 'createdAt' | 'usedCount' | 'status' | 'createdBy' | 'createdByName'>
  ) => Promise<FamilyInvitation>;
  
  revokeInvitation: (invitationId: string) => Promise<void>;

  requestFamilyConnection: (
    targetFamilyId: string,
    potentialNote: string
  ) => Promise<FamilyConnection>;
  
  approveFamilyConnection: (connectionId: string) => Promise<void>;
  rejectFamilyConnection: (connectionId: string) => Promise<void>;

  // Authorization Checker
  hasPermission: (
    familyId: string,
    action: PermissionAction,
    context?: { branchId?: string; surname?: string; personId?: string }
  ) => boolean;

  getUserAccessList: () => UserFamilyAccess[];
  pendingRequestsCount: number;
}

const defaultFilters: LobbyFilterOptions = {
  searchQuery: '',
  surname: '',
  country: 'all',
  region: 'all',
  minGenerations: 0,
  minPeople: 0,
  visibility: 'all',
  onlyOpenRequests: false
};

const FamilyLobbyContext = createContext<FamilyLobbyContextType | undefined>(undefined);

export const FamilyLobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { triggerSound } = useGamification();

  // 1. Core State with Local Storage fallback
  const [families, setFamilies] = useState<FamilySummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAMILIES);
      return saved ? JSON.parse(saved) : INITIAL_DISCOVERABLE_FAMILIES;
    } catch {
      return INITIAL_DISCOVERABLE_FAMILIES;
    }
  });

  const [permissionGrants, setPermissionGrants] = useState<PermissionGrant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRANTS);
      return saved ? JSON.parse(saved) : INITIAL_PERMISSION_GRANTS;
    } catch {
      return INITIAL_PERMISSION_GRANTS;
    }
  });

  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_PERMISSION_REQUESTS;
    } catch {
      return INITIAL_PERMISSION_REQUESTS;
    }
  });

  const [familyConnections, setFamilyConnections] = useState<FamilyConnection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_FAMILY_CONNECTIONS;
    } catch {
      return INITIAL_FAMILY_CONNECTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<LobbyAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [invitations, setInvitations] = useState<FamilyInvitation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
      return saved ? JSON.parse(saved) : INITIAL_INVITATIONS;
    } catch {
      return INITIAL_INVITATIONS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRANTS, JSON.stringify(permissionGrants));
  }, [permissionGrants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(permissionRequests));
  }, [permissionRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(familyConnections));
  }, [familyConnections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  }, [invitations]);

  // Modal navigation
  const [activeModal, setActiveModal] = useState<LobbyModalType | null>(null);
  const [selectedFamilyForProfile, setSelectedFamilyForProfile] = useState<FamilySummary | null>(null);
  const [selectedFamilyForRequest, setSelectedFamilyForRequest] = useState<FamilySummary | null>(null);
  const [requestInitialScope, setRequestInitialScope] = useState<{
    scope?: PermissionScopeType;
    branchId?: string;
    branchName?: string;
    surname?: string;
  } | null>(null);

  // Filters
  const [filterOptions, setFilterOptions] = useState<LobbyFilterOptions>(defaultFilters);

  // Filtered families memo
  const filteredFamilies = useMemo(() => {
    return families.filter(family => {
      // Exclude private families from public lobby search unless the current user owns it or has a grant
      const isOwner = currentUser && (family.ownerId === currentUser.userId || family.ownerEmail === currentUser.email);
      const hasGrant = currentUser && permissionGrants.some(g => g.familyId === family.id && g.userId === currentUser.userId && g.status === 'active');
      
      if (family.visibility === 'private' && !isOwner && !hasGrant) {
        return false;
      }

      // Search Query
      if (filterOptions.searchQuery.trim()) {
        const q = filterOptions.searchQuery.toLowerCase().trim();
        const matchesName = family.name.toLowerCase().includes(q);
        const matchesDesc = family.description.toLowerCase().includes(q);
        const matchesCountry = family.country.toLowerCase().includes(q);
        const matchesRegion = family.region.toLowerCase().includes(q);
        const matchesOrigin = family.approximateOrigin.toLowerCase().includes(q);
        const matchesSurnames = family.surnameTags.some(s => s.toLowerCase().includes(q));
        const matchesBranches = family.branches.some(b => b.name.toLowerCase().includes(q) || b.surnames.some(bs => bs.toLowerCase().includes(q)));
        const matchesOwner = family.ownerName.toLowerCase().includes(q);

        if (!matchesName && !matchesDesc && !matchesCountry && !matchesRegion && !matchesOrigin && !matchesSurnames && !matchesBranches && !matchesOwner) {
          return false;
        }
      }

      // Surname filter
      if (filterOptions.surname.trim()) {
        const sQ = filterOptions.surname.toLowerCase().trim();
        const hasSurname = family.surnameTags.some(s => s.toLowerCase().includes(sQ)) ||
          family.branches.some(b => b.surnames.some(bs => bs.toLowerCase().includes(sQ)));
        if (!hasSurname) return false;
      }

      // Country
      if (filterOptions.country !== 'all' && family.country.toLowerCase() !== filterOptions.country.toLowerCase()) {
        return false;
      }

      // Region
      if (filterOptions.region !== 'all' && family.region.toLowerCase() !== filterOptions.region.toLowerCase()) {
        return false;
      }

      // Min Generations
      if (filterOptions.minGenerations > 0 && family.generationsCount < filterOptions.minGenerations) {
        return false;
      }

      // Min People
      if (filterOptions.minPeople > 0 && family.peopleCount < filterOptions.minPeople) {
        return false;
      }

      // Visibility filter
      if (filterOptions.visibility !== 'all' && family.visibility !== filterOptions.visibility) {
        return false;
      }

      // Open requests only
      if (filterOptions.onlyOpenRequests && !family.allowPublicRequests) {
        return false;
      }

      return true;
    });
  }, [families, filterOptions, currentUser, permissionGrants]);

  // Smart matching algorithm ("¿Podrían estar relacionados?")
  const smartMatches = useMemo(() => {
    // Current user's focus surnames (default: Cantero, Pérez, González if none)
    const userSurnames = ['Cantero', 'Pérez', 'González', 'Martínez', 'Alarcón'];
    const userOriginLocations = ['Entre Ríos', 'Santa Fe', 'Argentina'];

    const matches: SmartFamilyMatch[] = [];

    families.forEach(fam => {
      // Find intersection of surnames
      const matchedSurnames = fam.surnameTags.filter(s => 
        userSurnames.some(us => us.toLowerCase() === s.toLowerCase())
      );

      // Find location intersection
      const matchedLocations = userOriginLocations.filter(loc => 
        fam.region.toLowerCase().includes(loc.toLowerCase()) || 
        fam.approximateOrigin.toLowerCase().includes(loc.toLowerCase()) ||
        fam.country.toLowerCase().includes(loc.toLowerCase())
      );

      let score = 0;
      score += matchedSurnames.length * 28;
      score += matchedLocations.length * 20;
      if (fam.generationsCount >= 7) score += 15;
      if (fam.isVerifiedOrigin) score += 10;

      if (score >= 35) {
        const potentialAncestors = fam.branches.map(b => b.rootPersonName);
        let confidence: 'possible' | 'high_probable' | 'suggested' = 'possible';
        if (score >= 70) confidence = 'high_probable';
        else if (score >= 50) confidence = 'suggested';

        let explanation = `Coincidencia por apellido principal (${matchedSurnames.join(', ')}) y radicación histórica en ${fam.region}.`;
        if (matchedSurnames.length > 1) {
          explanation = `Coincidencia múltiple de apellidos (${matchedSurnames.join(', ')}) con raíces documentadas en ${fam.approximateOrigin}.`;
        }

        matches.push({
          family: fam,
          matchScore: Math.min(score, 98),
          matchedSurnames,
          matchedLocations,
          potentialAncestors,
          relationConfidence: confidence,
          explanation
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }, [families]);

  // Count pending requests for owner
  const pendingRequestsCount = useMemo(() => {
    if (!currentUser) return 0;
    const myOwnedFamilyIds = families
      .filter(f => f.ownerId === currentUser.userId || f.ownerEmail === currentUser.email)
      .map(f => f.id);

    return permissionRequests.filter(r => 
      r.status === 'pending' && myOwnedFamilyIds.includes(r.familyId)
    ).length;
  }, [permissionRequests, families, currentUser]);

  // Modal navigation handlers
  const openLobby = useCallback(() => {
    setActiveModal('lobby');
  }, []);

  const openPublicProfile = useCallback((family: FamilySummary) => {
    setSelectedFamilyForProfile(family);
    setActiveModal('public_profile');
  }, []);

  const openRequestAccessModal = useCallback((
    family: FamilySummary,
    initialScope?: { scope?: PermissionScopeType; branchId?: string; branchName?: string; surname?: string }
  ) => {
    setSelectedFamilyForRequest(family);
    setRequestInitialScope(initialScope || null);
    setActiveModal('request_access');
  }, []);

  const openPermissionsManager = useCallback((familyId?: string) => {
    if (familyId) {
      const fam = families.find(f => f.id === familyId);
      if (fam) setSelectedFamilyForProfile(fam);
    }
    setActiveModal('permissions_manager');
  }, [families]);

  const openMyAccessesModal = useCallback(() => {
    setActiveModal('my_accesses');
  }, []);

  const openConnectFamiliesModal = useCallback((family: FamilySummary) => {
    setSelectedFamilyForProfile(family);
    setActiveModal('connect_families');
  }, []);

  const closeModals = useCallback(() => {
    setActiveModal(null);
    setSelectedFamilyForProfile(null);
    setSelectedFamilyForRequest(null);
    setRequestInitialScope(null);
  }, []);

  // Submit Permission Request
  const submitPermissionRequest = async (
    data: Omit<PermissionRequest, 'id' | 'status' | 'createdAt' | 'requesterId' | 'requesterName' | 'requesterEmail' | 'requesterPhoto'>
  ): Promise<PermissionRequest> => {
    const requesterId = currentUser?.userId || `usr-anon-${Date.now()}`;
    const requesterName = currentUser?.displayName || 'Investigador Familiar';
    const requesterEmail = currentUser?.email || 'investigador@familia.com';
    const requesterPhoto = currentUser?.photoURL;

    const newRequest: PermissionRequest = {
      ...data,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      requesterId,
      requesterName,
      requesterEmail,
      requesterPhoto,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setPermissionRequests(prev => [newRequest, ...prev]);

    // Add Audit Log
    const newLog: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: data.familyId,
      familyName: data.familyName,
      userId: requesterId,
      userName: requesterName,
      userPhoto: requesterPhoto,
      action: 'REQUEST_SUBMITTED',
      entityType: 'REQUEST',
      entityId: newRequest.id,
      details: `Solicitó acceso [${data.requestedPermissions.join(', ')}] con alcance ${data.scope}${data.targetBranchName ? ` en ${data.targetBranchName}` : ''}${data.targetSurname ? ` para apellido ${data.targetSurname}` : ''}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Gamification Reward Audio Feedback
    try {
      triggerSound();
    } catch {
      // ignore
    }

    return newRequest;
  };

  // Approve Permission Request (Supports customized scope approval by owner)
  const approvePermissionRequest = async (
    requestId: string,
    customApproval?: {
      scope?: PermissionScopeType;
      targetBranchId?: string;
      targetBranchName?: string;
      targetSurname?: string;
      permissions?: PermissionAction[];
      expiresAt?: string;
      notes?: string;
    }
  ) => {
    const req = permissionRequests.find(r => r.id === requestId);
    if (!req) return;

    const reviewerId = currentUser?.userId || 'usr-owner';
    const reviewerName = currentUser?.displayName || 'Propietario del Árbol';

    // 1. Update Request Status
    setPermissionRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewerId,
          reviewedByName: reviewerName
        };
      }
      return r;
    }));

    // 2. Create PermissionGrant
    const effectiveScope = customApproval?.scope || req.scope;
    const effectivePermissions = customApproval?.permissions || req.requestedPermissions;
    const effectiveBranchId = customApproval?.targetBranchId || req.targetBranchId;
    const effectiveBranchName = customApproval?.targetBranchName || req.targetBranchName;
    const effectiveSurname = customApproval?.targetSurname || req.targetSurname;

    const newGrant: PermissionGrant = {
      id: `grant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      familyId: req.familyId,
      familyName: req.familyName,
      userId: req.requesterId,
      userName: req.requesterName,
      userEmail: req.requesterEmail,
      userPhoto: req.requesterPhoto,
      permissions: effectivePermissions,
      scope: effectiveScope,
      targetBranchId: effectiveBranchId,
      targetBranchName: effectiveBranchName,
      targetSurname: effectiveSurname,
      grantedBy: reviewerId,
      grantedByName: reviewerName,
      grantedAt: new Date().toISOString(),
      expiresAt: customApproval?.expiresAt,
      status: 'active',
      notes: customApproval?.notes || req.message
    };

    setPermissionGrants(prev => [newGrant, ...prev]);

    // 3. Add Audit Log
    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: req.familyId,
      familyName: req.familyName,
      userId: reviewerId,
      userName: reviewerName,
      action: 'REQUEST_APPROVED',
      entityType: 'GRANT',
      entityId: newGrant.id,
      details: `Aprobó solicitud de ${req.requesterName}. Otorgó permisos [${effectivePermissions.join(', ')}] con alcance ${effectiveScope}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    // Gamification check & audio feedback
    try {
      triggerSound();
    } catch {
      // ignore
    }
  };

  // Reject Permission Request
  const rejectPermissionRequest = async (requestId: string, reason?: string) => {
    const req = permissionRequests.find(r => r.id === requestId);
    if (!req) return;

    const reviewerId = currentUser?.userId || 'usr-owner';
    const reviewerName = currentUser?.displayName || 'Propietario del Árbol';

    setPermissionRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          rejectionReason: reason || 'El propietario decidió no otorgar acceso en este momento.',
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewerId,
          reviewedByName: reviewerName
        };
      }
      return r;
    }));

    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: req.familyId,
      familyName: req.familyName,
      userId: reviewerId,
      userName: reviewerName,
      action: 'REQUEST_REJECTED',
      entityType: 'REQUEST',
      entityId: req.id,
      details: `Rechazó solicitud de ${req.requesterName}.${reason ? ` Motivo: ${reason}` : ''}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Direct Grant creation
  const createDirectGrant = async (
    data: Omit<PermissionGrant, 'id' | 'grantedAt' | 'status' | 'grantedBy' | 'grantedByName'>
  ): Promise<PermissionGrant> => {
    const granterId = currentUser?.userId || 'usr-owner';
    const granterName = currentUser?.displayName || 'Propietario del Árbol';

    const newGrant: PermissionGrant = {
      ...data,
      id: `grant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      grantedBy: granterId,
      grantedByName: granterName,
      grantedAt: new Date().toISOString(),
      status: 'active'
    };

    setPermissionGrants(prev => [newGrant, ...prev]);

    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: data.familyId,
      familyName: data.familyName,
      userId: granterId,
      userName: granterName,
      action: 'PERMISSION_GRANTED',
      entityType: 'GRANT',
      entityId: newGrant.id,
      details: `Otorgó acceso directo [${data.permissions.join(', ')}] a ${data.userName} con alcance ${data.scope}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    try { triggerSound(); } catch { /* ignore */ }
    return newGrant;
  };

  // Update Grant
  const updateGrant = async (grantId: string, updates: Partial<PermissionGrant>) => {
    const granterId = currentUser?.userId || 'usr-owner';
    const granterName = currentUser?.displayName || 'Propietario del Árbol';

    setPermissionGrants(prev => prev.map(g => {
      if (g.id === grantId) {
        return { ...g, ...updates };
      }
      return g;
    }));

    const grant = permissionGrants.find(g => g.id === grantId);
    if (grant) {
      const audit: LobbyAuditLog = {
        id: `audit-${Date.now()}`,
        familyId: grant.familyId,
        familyName: grant.familyName,
        userId: granterId,
        userName: granterName,
        action: 'PERMISSION_MODIFIED',
        entityType: 'GRANT',
        entityId: grantId,
        details: `Actualizó permisos de ${grant.userName}.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [audit, ...prev]);
    }
  };

  // Revoke Grant
  const revokeGrant = async (grantId: string) => {
    const granterId = currentUser?.userId || 'usr-owner';
    const granterName = currentUser?.displayName || 'Propietario del Árbol';

    const grant = permissionGrants.find(g => g.id === grantId);
    if (!grant) return;

    setPermissionGrants(prev => prev.map(g => {
      if (g.id === grantId) {
        return { ...g, status: 'revoked' };
      }
      return g;
    }));

    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: grant.familyId,
      familyName: grant.familyName,
      userId: granterId,
      userName: granterName,
      action: 'PERMISSION_REVOKED',
      entityType: 'GRANT',
      entityId: grantId,
      details: `Revocó los permisos de ${grant.userName}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Create Invitation
  const createInvitation = async (
    data: Omit<FamilyInvitation, 'id' | 'createdAt' | 'usedCount' | 'status' | 'createdBy' | 'createdByName'>
  ): Promise<FamilyInvitation> => {
    const creatorId = currentUser?.userId || 'usr-owner';
    const creatorName = currentUser?.displayName || 'Propietario del Árbol';

    const newInv: FamilyInvitation = {
      ...data,
      id: `inv-${Date.now()}`,
      createdBy: creatorId,
      createdByName: creatorName,
      createdAt: new Date().toISOString(),
      usedCount: 0,
      status: 'active'
    };

    setInvitations(prev => [newInv, ...prev]);

    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: data.familyId,
      familyName: data.familyName,
      userId: creatorId,
      userName: creatorName,
      action: 'INVITATION_CREATED',
      entityType: 'INVITATION',
      entityId: newInv.id,
      details: `Generó enlace de invitación temporal (${newInv.code}) con permisos [${data.permissions.join(', ')}].`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    return newInv;
  };

  // Revoke Invitation
  const revokeInvitation = async (invitationId: string) => {
    setInvitations(prev => prev.map(i => {
      if (i.id === invitationId) {
        return { ...i, status: 'revoked' };
      }
      return i;
    }));
  };

  // Family Connections (Smart Link Between Families)
  const requestFamilyConnection = async (
    targetFamilyId: string,
    potentialNote: string
  ): Promise<FamilyConnection> => {
    const targetFamily = families.find(f => f.id === targetFamilyId);
    if (!targetFamily) throw new Error('Familia destino no encontrada');

    // User's active or first owned family
    const sourceFamily = families.find(f => f.ownerId === currentUser?.userId) || families[0];

    const commonSurnames = sourceFamily.surnameTags.filter(s => 
      targetFamily.surnameTags.some(ts => ts.toLowerCase() === s.toLowerCase())
    );

    const requesterId = currentUser?.userId || 'usr-anon';
    const requesterName = currentUser?.displayName || 'Investigador Familiar';

    const newConn: FamilyConnection = {
      id: `conn-${Date.now()}`,
      familyAId: sourceFamily.id,
      familyAName: sourceFamily.name,
      familyAOwnerName: sourceFamily.ownerName,
      familyBId: targetFamily.id,
      familyBName: targetFamily.name,
      familyBOwnerName: targetFamily.ownerName,
      commonSurnames: commonSurnames.length > 0 ? commonSurnames : ['Cantero'],
      commonLocations: [sourceFamily.region, targetFamily.region],
      potentialLinkNote: potentialNote || 'Posible nexo migratorio o confluencia de ramas en el siglo XIX.',
      requestedBy: requesterId,
      requestedByName: requesterName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setFamilyConnections(prev => [newConn, ...prev]);

    const audit: LobbyAuditLog = {
      id: `audit-${Date.now()}`,
      familyId: sourceFamily.id,
      familyName: sourceFamily.name,
      userId: requesterId,
      userName: requesterName,
      action: 'FAMILY_CONNECTED',
      entityType: 'CONNECTION',
      entityId: newConn.id,
      details: `Envió solicitud de conexión genealógica con ${targetFamily.name}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    try { triggerSound(); } catch { /* ignore */ }
    return newConn;
  };

  const approveFamilyConnection = async (connectionId: string) => {
    setFamilyConnections(prev => prev.map(c => {
      if (c.id === connectionId) {
        return {
          ...c,
          status: 'approved',
          reviewedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    try { triggerSound(); } catch { /* ignore */ }
  };

  const rejectFamilyConnection = async (connectionId: string) => {
    setFamilyConnections(prev => prev.map(c => {
      if (c.id === connectionId) {
        return {
          ...c,
          status: 'rejected',
          reviewedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  // Granular Permission Evaluation Engine (Hierarchical & Scope-aware)
  const hasPermission = useCallback((
    familyId: string,
    action: PermissionAction,
    context?: { branchId?: string; surname?: string; personId?: string }
  ): boolean => {
    if (!currentUser) {
      // Unauthenticated visitor can only view public families
      if (action === 'VIEW') {
        const fam = families.find(f => f.id === familyId);
        return fam?.visibility === 'public' || fam?.visibility === 'public_restricted';
      }
      return false;
    }

    const family = families.find(f => f.id === familyId);
    if (!family) return false;

    // 1. Owner always has all permissions (VIEW, CREATE, EDIT, DELETE, MANAGE)
    if (family.ownerId === currentUser.userId || family.ownerEmail === currentUser.email) {
      return true;
    }

    // 2. Find active grants for this user & family
    const userGrants = permissionGrants.filter(g => 
      g.familyId === familyId && 
      (g.userId === currentUser.userId || g.userEmail === currentUser.email) &&
      g.status === 'active'
    );

    if (userGrants.length === 0) {
      // Public visibility check for VIEW
      if (action === 'VIEW') {
        return family.visibility === 'public' || family.visibility === 'public_restricted';
      }
      return false;
    }

    // Check expiration
    const now = new Date().toISOString();
    const validGrants = userGrants.filter(g => !g.expiresAt || g.expiresAt > now);

    // 3. Hierarchical Evaluation: Check if any grant covers this action and scope
    for (const grant of validGrants) {
      // If grant includes MANAGE, grants all except standalone explicit DELETE if configured
      if (grant.permissions.includes('MANAGE')) {
        return true;
      }

      // Check if action is in permissions
      if (!grant.permissions.includes(action)) {
        continue;
      }

      // Scope evaluation
      if (grant.scope === 'FAMILY') {
        // Árbol completo: covers all branches and surnames
        return true;
      }

      if (grant.scope === 'BRANCH') {
        // Must match branchId
        if (!context?.branchId || grant.targetBranchId === context.branchId) {
          return true;
        }
      }

      if (grant.scope === 'SURNAME') {
        // Must match surname
        if (!context?.surname || grant.targetSurname?.toLowerCase() === context.surname.toLowerCase()) {
          return true;
        }
      }

      if (grant.scope === 'PERSON') {
        // Must match personId
        if (!context?.personId || grant.targetPersonId === context.personId) {
          return true;
        }
      }
    }

    // Default fallback for VIEW if family is public
    if (action === 'VIEW' && (family.visibility === 'public' || family.visibility === 'public_restricted')) {
      return true;
    }

    return false;
  }, [currentUser, families, permissionGrants]);

  // User Access Summary ("Mis Accesos")
  const getUserAccessList = useCallback((): UserFamilyAccess[] => {
    if (!currentUser) return [];

    const result: UserFamilyAccess[] = [];
    const now = new Date().toISOString();

    families.forEach(family => {
      const isOwner = family.ownerId === currentUser.userId || family.ownerEmail === currentUser.email;
      
      const grant = permissionGrants.find(g => 
        g.familyId === family.id && 
        (g.userId === currentUser.userId || g.userEmail === currentUser.email) &&
        g.status === 'active'
      );

      if (isOwner) {
        result.push({
          family,
          isOwner: true,
          roleTitle: 'Propietario / Autor',
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canManage: true,
          scopeDescription: 'Árbol completo (Control total)'
        });
      } else if (grant) {
        const isExpired = !!grant.expiresAt && grant.expiresAt < now;
        
        let scopeDesc = 'Árbol completo';
        if (grant.scope === 'BRANCH') scopeDesc = `Rama: ${grant.targetBranchName || grant.targetBranchId}`;
        if (grant.scope === 'SURNAME') scopeDesc = `Apellido: ${grant.targetSurname}`;
        if (grant.scope === 'PERSON') scopeDesc = `Persona: ${grant.targetPersonName || grant.targetPersonId}`;

        let roleTitle = 'Colaborador';
        if (grant.permissions.includes('MANAGE')) roleTitle = 'Administrador Delegado';
        else if (grant.permissions.includes('EDIT')) roleTitle = 'Editor';
        else if (grant.permissions.includes('CREATE')) roleTitle = 'Colaborador';
        else if (grant.permissions.includes('VIEW')) roleTitle = 'Lector / Visitante';

        result.push({
          family,
          grant,
          isOwner: false,
          roleTitle,
          canView: grant.permissions.includes('VIEW'),
          canCreate: grant.permissions.includes('CREATE'),
          canEdit: grant.permissions.includes('EDIT'),
          canDelete: grant.permissions.includes('DELETE'),
          canManage: grant.permissions.includes('MANAGE'),
          scopeDescription: scopeDesc,
          isExpired
        });
      }
    });

    return result;
  }, [currentUser, families, permissionGrants]);

  const value = {
    families,
    permissionGrants,
    permissionRequests,
    familyConnections,
    auditLogs,
    invitations,
    activeModal,
    isLobbyOpen: activeModal === 'lobby',
    isPublicProfileOpen: activeModal === 'public_profile',
    isRequestAccessModalOpen: activeModal === 'request_access',
    isPermissionsManagerOpen: activeModal === 'permissions_manager',
    isMyAccessesModalOpen: activeModal === 'my_accesses',
    isConnectFamiliesModalOpen: activeModal === 'connect_families',
    selectedFamilyForProfile,
    selectedFamilyForRequest,
    requestInitialScope,
    filterOptions,
    setFilterOptions,
    filteredFamilies,
    smartMatches,
    openLobby,
    openPublicProfile,
    openRequestAccessModal,
    openPermissionsManager,
    openMyAccessesModal,
    openConnectFamiliesModal,
    closeModals,
    submitPermissionRequest,
    approvePermissionRequest,
    rejectPermissionRequest,
    createDirectGrant,
    updateGrant,
    revokeGrant,
    createInvitation,
    revokeInvitation,
    requestFamilyConnection,
    approveFamilyConnection,
    rejectFamilyConnection,
    hasPermission,
    getUserAccessList,
    pendingRequestsCount
  };

  return (
    <FamilyLobbyContext.Provider value={value}>
      {children}
    </FamilyLobbyContext.Provider>
  );
};

export const useFamilyLobby = () => {
  const context = useContext(FamilyLobbyContext);
  if (!context) {
    throw new Error('useFamilyLobby must be used within a FamilyLobbyProvider');
  }
  return context;
};
