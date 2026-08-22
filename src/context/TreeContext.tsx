import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Tree, Person, Relationship, FamilyEvent, MediaItem, 
  HistoricalSource, AccessRequest, Proposal, ChangeLog, Comment, SurnameStyle 
} from '../types';
import { TreeService } from '../services/treeService';
import { useAuth } from './AuthContext';
import { SEED_TREE } from '../data/seedData';
import { exportToGedcom, parseGedcom } from '../services/gedcomService';

interface TreeContextType {
  trees: Tree[];
  activeTree: Tree | null;
  people: Person[];
  relationships: Relationship[];
  events: FamilyEvent[];
  media: MediaItem[];
  sources: HistoricalSource[];
  requests: AccessRequest[];
  proposals: Proposal[];
  changes: ChangeLog[];
  comments: Comment[];
  loading: boolean;
  selectedPersonId: string | null;
  // Actions
  selectTree: (treeId: string) => Promise<void>;
  createTree: (treeData: Partial<Tree>, options?: { startWithRootPerson?: boolean; rootPersonName?: string; rootPersonLastName?: string }) => Promise<Tree>;
  updateTree: (treeData: Partial<Tree>) => Promise<void>;
  deleteTree: (treeId: string) => Promise<void>;
  setSelectedPersonId: (id: string | null) => void;
  // Person
  addPerson: (person: Partial<Person>) => Promise<Person>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;
  // Relationship
  addRelationship: (rel: Partial<Relationship>) => Promise<Relationship>;
  deleteRelationship: (relId: string) => Promise<void>;
  // Event
  addEvent: (event: Partial<FamilyEvent>) => Promise<FamilyEvent>;
  updateEvent: (event: FamilyEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  // Media
  addMedia: (media: Partial<MediaItem>) => Promise<MediaItem>;
  deleteMedia: (mediaId: string) => Promise<void>;
  // Source
  addSource: (source: Partial<HistoricalSource>) => Promise<HistoricalSource>;
  deleteSource: (sourceId: string) => Promise<void>;
  // Requests & Proposals
  sendAccessRequest: (req: Partial<AccessRequest>) => Promise<void>;
  respondToRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  submitProposal: (prop: Partial<Proposal>) => Promise<void>;
  respondToProposal: (proposalId: string, status: 'accepted' | 'rejected') => Promise<void>;
  // Comments
  addComment: (targetType: Comment['targetType'], targetId: string, content: string) => Promise<void>;
  // Drag & Move coordinates
  movePersonPosition: (personId: string, position: { x: number; y: number }) => Promise<void>;
  // Initial template & demo resets
  createEmptyInitialTemplate: () => Promise<Person>;
  resetToDemoTree: () => Promise<void>;
  logUserMovement: (summary: string, entityId?: string, entityName?: string) => Promise<void>;
  // Surname Styles
  updateSurnameStyle: (surname: string, style: SurnameStyle) => Promise<void>;
  removeSurnameStyle: (surname: string) => Promise<void>;
  // Indirect & Bridge Relatives
  addIndirectRelative: (params: {
    fromPersonId: string;
    indirectType: 'grandparent' | 'great_grandparent' | 'uncle_aunt' | 'cousin' | 'grandchild' | 'nephew_niece';
    relativeData?: Partial<Person>;
    viaParentId?: string;
  }) => Promise<{ createdRelative: Person; bridgePlaceholders: Person[] }>;
  // GEDCOM / JSON
  importGedcomData: (content: string) => Promise<void>;
  exportGedcomData: () => string;
  exportJsonData: () => string;
  importJsonData: (jsonStr: string) => Promise<void>;
  // Helper
  getSanitizedPerson: (person: Person) => Person;
  canEdit: boolean;
  canManage: boolean;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, activeRole, isPublicMode } = useAuth();
  
  const [trees, setTrees] = useState<Tree[]>([SEED_TREE]);
  const [activeTree, setActiveTree] = useState<Tree | null>(SEED_TREE);
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [sources, setSources] = useState<HistoricalSource[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const canEdit = !isPublicMode && (activeRole === 'owner' || activeRole === 'editor' || activeRole === 'collaborator');
  const canManage = !isPublicMode && activeRole === 'owner';

  // Load all tree data
  const loadTreeData = useCallback(async (treeId: string) => {
    setLoading(true);
    try {
      const [
        treePeople,
        treeRels,
        treeEvents,
        treeMedia,
        treeSources,
        treeReqs,
        treeProps,
        treeChanges,
        treeComments
      ] = await Promise.all([
        TreeService.getPeople(treeId),
        TreeService.getRelationships(treeId),
        TreeService.getEvents(treeId),
        TreeService.getMedia(treeId),
        TreeService.getSources(treeId),
        TreeService.getRequests(treeId),
        TreeService.getProposals(treeId),
        TreeService.getChanges(treeId),
        TreeService.getComments(treeId)
      ]);

      setPeople(treePeople);
      setRelationships(treeRels);
      setEvents(treeEvents);
      setMedia(treeMedia);
      setSources(treeSources);
      setRequests(treeReqs);
      setProposals(treeProps);
      setChanges(treeChanges);
      setComments(treeComments);
    } catch (err) {
      console.error('Error loading tree data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      if (currentUser) {
        await TreeService.initializeDefaultData(currentUser.userId);
      }
      const loadedTrees = await TreeService.getTrees(currentUser?.userId || 'guest');
      setTrees(loadedTrees);
      if (loadedTrees.length > 0) {
        const current = loadedTrees[0];
        setActiveTree(current);
        await loadTreeData(current.id);
      }
    }
    init();
  }, [currentUser, loadTreeData]);

  const selectTree = async (treeId: string) => {
    const found = trees.find(t => t.id === treeId);
    if (found) {
      setActiveTree(found);
      await loadTreeData(found.id);
    }
  };

  const createTree = async (
    treeData: Partial<Tree>, 
    options?: { startWithRootPerson?: boolean; rootPersonName?: string; rootPersonLastName?: string }
  ): Promise<Tree> => {
    const newTreeId = `tree-${Date.now()}`;
    const newTree: Tree = {
      id: newTreeId,
      name: treeData.name || 'Nuevo Árbol Familiar',
      description: treeData.description || '',
      ownerId: currentUser?.userId || 'owner-guest',
      ownerName: currentUser?.displayName || 'Propietario',
      ownerEmail: currentUser?.email || '',
      coverImage: treeData.coverImage || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
      visibility: treeData.visibility || 'public',
      slug: (treeData.name || 'arbol').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      settings: {
        hideLivingDetails: true,
        livingAgeThreshold: 100,
        defaultRoleForInvites: 'collaborator',
        allowPublicRequests: true,
        requireProposalApproval: true,
        showCommentsToPublic: true,
        ...treeData.settings
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure completely clear cache for new tree
    TreeService.clearTreeCache(newTree.id);
    await TreeService.saveTree(newTree);

    let initialPeople: Person[] = [];
    if (options?.startWithRootPerson !== false) {
      const extractedSurname = options?.rootPersonLastName || 
        (treeData.name || '').replace(/^(árbol|familia|arbol|family|de|los|las)\s+/i, '').trim() || 
        'Familiar';

      const rootPerson: Person = {
        id: `p-${Date.now()}-root`,
        treeId: newTree.id,
        firstName: options?.rootPersonName || 'Familiar',
        lastName: extractedSurname,
        gender: 'unknown',
        birthDate: '1990-01-01',
        birthPlace: 'Lugar de Origen',
        isLiving: true,
        bio: `Registro inicial del ${newTree.name}. Utiliza los botones (+) para invitar a tus familiares o añadir padres, hijos y cónyuges.`,
        certainty: 'confirmed',
        position: { x: 400, y: 300 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await TreeService.savePerson(rootPerson);
      initialPeople = [rootPerson];
    }

    setTrees(prev => [...prev, newTree]);
    setActiveTree(newTree);
    setPeople(initialPeople);
    setRelationships([]);
    setEvents([]);
    setMedia([]);
    setSources([]);
    setRequests([]);
    setProposals([]);
    setChanges([]);
    setComments([]);
    setSelectedPersonId(initialPeople.length > 0 ? initialPeople[0].id : null);

    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: newTree.id,
      entityType: 'tree',
      entityId: newTree.id,
      entityName: newTree.name,
      action: 'create',
      summary: `Creó la nueva familia "${newTree.name}"`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges([change]);

    return newTree;
  };

  const updateTree = async (treeData: Partial<Tree>): Promise<void> => {
    if (!activeTree) return;
    const updated: Tree = {
      ...activeTree,
      ...treeData,
      updatedAt: new Date().toISOString()
    };
    await TreeService.saveTree(updated);
    setActiveTree(updated);
    setTrees(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTree = async (treeId: string): Promise<void> => {
    await TreeService.deleteTree(treeId);
    const remaining = trees.filter(t => t.id !== treeId);
    setTrees(remaining);

    if (activeTree?.id === treeId) {
      if (remaining.length > 0) {
        const nextTree = remaining[0];
        setActiveTree(nextTree);
        await loadTreeData(nextTree.id);
      } else {
        // If all trees were deleted, create a fresh clean tree
        await createTree({ name: 'Mi Familia' });
      }
    }
  };

  // Helper for Living Persons Protection (Privacy rule 15)
  const getSanitizedPerson = useCallback((person: Person): Person => {
    if (!activeTree?.settings.hideLivingDetails) return person;
    if (!person.isLiving) return person;
    if (!isPublicMode && (activeRole === 'owner' || activeRole === 'editor' || activeRole === 'collaborator')) {
      return person;
    }

    // Protect living person details for public visitors
    return {
      ...person,
      lastName: person.lastName ? `${person.lastName.charAt(0)}.` : '',
      maidenName: undefined,
      birthDate: person.birthDate ? 'Privado (Persona Viva)' : undefined,
      birthDateApprox: 'Privado',
      birthPlace: 'Privado',
      bio: 'Información protegida por privacidad para personas vivas.',
      notes: undefined,
      profession: undefined,
      aliases: undefined
    };
  }, [activeTree, activeRole, isPublicMode]);

  // People operations
  const addPerson = async (personData: Partial<Person>): Promise<Person> => {
    if (!activeTree) throw new Error('No active tree');
    const newPerson: Person = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treeId: activeTree.id,
      firstName: personData.firstName || 'Nombre',
      middleName: personData.middleName || '',
      lastName: personData.lastName || 'Apellido',
      maidenName: personData.maidenName || '',
      gender: personData.gender || 'unknown',
      birthDate: personData.birthDate || '',
      birthDateApprox: personData.birthDateApprox || '',
      birthPlace: personData.birthPlace || '',
      birthCoordinates: personData.birthCoordinates,
      deathDate: personData.deathDate || '',
      deathDateApprox: personData.deathDateApprox || '',
      deathPlace: personData.deathPlace || '',
      deathCoordinates: personData.deathCoordinates,
      isLiving: personData.isLiving ?? true,
      bio: personData.bio || '',
      profession: personData.profession || '',
      nationality: personData.nationality || '',
      avatarUrl: personData.avatarUrl || '',
      aliases: personData.aliases || [],
      notes: personData.notes || '',
      tags: personData.tags || [],
      certainty: personData.certainty || 'confirmed',
      sourceIds: personData.sourceIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.userId
    };

    await TreeService.savePerson(newPerson);
    setPeople(prev => [...prev, newPerson]);

    // Log change
    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'person',
      entityId: newPerson.id,
      entityName: `${newPerson.firstName} ${newPerson.lastName}`,
      action: 'create',
      summary: `Agregó a ${newPerson.firstName} ${newPerson.lastName} al árbol`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);

    return newPerson;
  };

  const updatePerson = async (person: Person): Promise<void> => {
    if (!activeTree) return;
    const updated = { ...person, updatedAt: new Date().toISOString() };
    await TreeService.savePerson(updated);
    setPeople(prev => prev.map(p => p.id === updated.id ? updated : p));

    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'person',
      entityId: updated.id,
      entityName: `${updated.firstName} ${updated.lastName}`,
      action: 'update',
      summary: `Actualizó datos de ${updated.firstName} ${updated.lastName}`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);
  };

  const deletePerson = async (personId: string): Promise<void> => {
    if (!activeTree) return;
    const target = people.find(p => p.id === personId);
    await TreeService.deletePerson(activeTree.id, personId);
    setPeople(prev => prev.filter(p => p.id !== personId));
    setRelationships(prev => prev.filter(r => r.person1Id !== personId && r.person2Id !== personId));
    setSelectedPersonId(prev => (prev === personId ? null : prev));

    if (target) {
      const change: ChangeLog = {
        id: `chg-${Date.now()}`,
        treeId: activeTree.id,
        entityType: 'person',
        entityId: personId,
        entityName: `${target.firstName} ${target.lastName}`,
        action: 'delete',
        summary: `Eliminó a ${target.firstName} ${target.lastName} del árbol`,
        userId: currentUser?.userId || 'system',
        userName: currentUser?.displayName || 'Usuario',
        timestamp: new Date().toISOString()
      };
      await TreeService.logChange(change);
      setChanges(prev => [change, ...prev]);
    }
  };

  // Relationship operations
  const addRelationship = async (relData: Partial<Relationship>): Promise<Relationship> => {
    if (!activeTree) throw new Error('No active tree');
    const newRel: Relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treeId: activeTree.id,
      person1Id: relData.person1Id!,
      person2Id: relData.person2Id!,
      type: relData.type || 'parent',
      customTypeLabel: relData.customTypeLabel,
      startDate: relData.startDate,
      endDate: relData.endDate,
      notes: relData.notes,
      certainty: relData.certainty || 'confirmed',
      sourceIds: relData.sourceIds || [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.userId
    };

    await TreeService.saveRelationship(newRel);
    setRelationships(prev => [...prev, newRel]);

    const p1 = people.find(p => p.id === newRel.person1Id);
    const p2 = people.find(p => p.id === newRel.person2Id);
    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'relationship',
      entityId: newRel.id,
      entityName: `Relación ${newRel.type}`,
      action: 'create',
      summary: `Conectó a ${p1?.firstName || 'Persona'} con ${p2?.firstName || 'Persona'} (${newRel.type})`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);

    return newRel;
  };

  const deleteRelationship = async (relId: string): Promise<void> => {
    if (!activeTree) return;
    await TreeService.deleteRelationship(activeTree.id, relId);
    setRelationships(prev => prev.filter(r => r.id !== relId));
  };

  // Events operations
  const addEvent = async (evData: Partial<FamilyEvent>): Promise<FamilyEvent> => {
    if (!activeTree) throw new Error('No active tree');
    const newEv: FamilyEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treeId: activeTree.id,
      type: evData.type || 'custom',
      title: evData.title || 'Acontecimiento',
      date: evData.date || '',
      dateApprox: evData.dateApprox,
      place: evData.place || '',
      coordinates: evData.coordinates,
      description: evData.description || '',
      personIds: evData.personIds || [],
      mediaIds: evData.mediaIds || [],
      sourceIds: evData.sourceIds || [],
      certainty: evData.certainty || 'confirmed',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.userId
    };

    await TreeService.saveEvent(newEv);
    setEvents(prev => [...prev, newEv]);

    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'event',
      entityId: newEv.id,
      entityName: newEv.title,
      action: 'create',
      summary: `Registró evento histórico: ${newEv.title}`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);

    return newEv;
  };

  const updateEvent = async (event: FamilyEvent): Promise<void> => {
    if (!activeTree) return;
    await TreeService.saveEvent(event);
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!activeTree) return;
    await TreeService.deleteEvent(activeTree.id, eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Media operations
  const addMedia = async (mediaData: Partial<MediaItem>): Promise<MediaItem> => {
    if (!activeTree) throw new Error('No active tree');
    const newMedia: MediaItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treeId: activeTree.id,
      title: mediaData.title || 'Archivo Multimedia',
      type: mediaData.type || 'photo',
      url: mediaData.url || '',
      fileSize: mediaData.fileSize || 500000,
      mimeType: mediaData.mimeType || 'image/jpeg',
      uploadedBy: currentUser?.userId || 'user',
      uploadedByName: currentUser?.displayName || 'Usuario',
      createdAt: new Date().toISOString(),
      relatedPersonIds: mediaData.relatedPersonIds || [],
      relatedEventId: mediaData.relatedEventId,
      description: mediaData.description || '',
      historicalDate: mediaData.historicalDate || '',
      historicalPlace: mediaData.historicalPlace || '',
      sourceId: mediaData.sourceId,
      visibility: mediaData.visibility || 'public',
      tags: mediaData.tags || []
    };

    await TreeService.saveMedia(newMedia);
    setMedia(prev => [...prev, newMedia]);

    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'media',
      entityId: newMedia.id,
      entityName: newMedia.title,
      action: 'create',
      summary: `Subió archivo multimedia: ${newMedia.title}`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);

    return newMedia;
  };

  const deleteMedia = async (mediaId: string): Promise<void> => {
    if (!activeTree) return;
    await TreeService.deleteMedia(activeTree.id, mediaId);
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  // Sources operations
  const addSource = async (sourceData: Partial<HistoricalSource>): Promise<HistoricalSource> => {
    if (!activeTree) throw new Error('No active tree');
    const newSource: HistoricalSource = {
      id: `src-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treeId: activeTree.id,
      title: sourceData.title || 'Fuente Histórica',
      type: sourceData.type || 'civil_registry',
      repository: sourceData.repository || '',
      url: sourceData.url,
      citation: sourceData.citation || '',
      confidence: sourceData.confidence || 'confirmed',
      notes: sourceData.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.userId
    };

    await TreeService.saveSource(newSource);
    setSources(prev => [...prev, newSource]);

    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'source',
      entityId: newSource.id,
      entityName: newSource.title,
      action: 'create',
      summary: `Añadió fuente documental: ${newSource.title}`,
      userId: currentUser?.userId || 'system',
      userName: currentUser?.displayName || 'Usuario',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);

    return newSource;
  };

  const deleteSource = async (sourceId: string): Promise<void> => {
    if (!activeTree) return;
    await TreeService.deleteSource(activeTree.id, sourceId);
    setSources(prev => prev.filter(s => s.id !== sourceId));
  };

  // Requests
  const sendAccessRequest = async (reqData: Partial<AccessRequest>): Promise<void> => {
    if (!activeTree) return;
    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      treeId: activeTree.id,
      userId: currentUser?.userId || `visitor-${Date.now()}`,
      userName: reqData.userName || currentUser?.displayName || 'Familiar Visitante',
      userEmail: reqData.userEmail || currentUser?.email || 'familiar@email.com',
      userPhoto: currentUser?.photoURL,
      message: reqData.message || '',
      familyRelation: reqData.familyRelation || '',
      contributionIntent: reqData.contributionIntent || '',
      requestedRole: reqData.requestedRole || 'collaborator',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await TreeService.saveRequest(newReq);
    setRequests(prev => [newReq, ...prev]);
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !activeTree) return;
    const updated: AccessRequest = {
      ...req,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.displayName || 'Propietario'
    };
    await TreeService.saveRequest(updated);
    setRequests(prev => prev.map(r => r.id === requestId ? updated : r));
  };

  // Proposals
  const submitProposal = async (propData: Partial<Proposal>): Promise<void> => {
    if (!activeTree) return;
    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      treeId: activeTree.id,
      targetType: propData.targetType || 'person',
      targetId: propData.targetId!,
      targetName: propData.targetName,
      fieldChanged: propData.fieldChanged || 'Dato',
      currentValue: propData.currentValue,
      proposedValue: propData.proposedValue,
      proposedBy: currentUser?.userId || 'collab',
      proposedByName: currentUser?.displayName || 'Colaborador Familiar',
      sourceNote: propData.sourceNote || '',
      reason: propData.reason || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await TreeService.saveProposal(newProp);
    setProposals(prev => [newProp, ...prev]);
  };

  const respondToProposal = async (proposalId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop || !activeTree) return;
    const updated: Proposal = {
      ...prop,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.displayName || 'Propietario'
    };
    await TreeService.saveProposal(updated);
    setProposals(prev => prev.map(p => p.id === proposalId ? updated : p));

    // If accepted, apply change to target
    if (status === 'accepted' && prop.targetType === 'person') {
      const target = people.find(p => p.id === prop.targetId);
      if (target) {
        let fieldKey = 'notes';
        if (prop.fieldChanged.toLowerCase().includes('nacimiento')) fieldKey = 'birthDate';
        else if (prop.fieldChanged.toLowerCase().includes('defuncion') || prop.fieldChanged.toLowerCase().includes('fallecimiento')) fieldKey = 'deathDate';
        else if (prop.fieldChanged.toLowerCase().includes('nombre')) fieldKey = 'firstName';
        else if (prop.fieldChanged.toLowerCase().includes('apellido')) fieldKey = 'lastName';

        const updatedPerson = { ...target, [fieldKey]: prop.proposedValue };
        await updatePerson(updatedPerson);
      }
    }
  };

  // Comments
  const addComment = async (targetType: Comment['targetType'], targetId: string, content: string): Promise<void> => {
    if (!activeTree || !content.trim()) return;
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      treeId: activeTree.id,
      targetType,
      targetId,
      userId: currentUser?.userId || 'guest',
      userName: currentUser?.displayName || 'Familiar',
      userPhoto: currentUser?.photoURL,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    await TreeService.addComment(newComment);
    setComments(prev => [...prev, newComment]);
  };

  // GEDCOM / JSON
  const exportGedcomData = (): string => {
    if (!activeTree) return '';
    return exportToGedcom(activeTree, people, relationships);
  };

  const importGedcomData = async (content: string): Promise<void> => {
    if (!activeTree) return;
    const { people: importedPeople, relationships: importedRels } = parseGedcom(content, activeTree.id);
    
    // Save to database & update state
    for (const p of importedPeople) {
      await TreeService.savePerson(p);
    }
    for (const r of importedRels) {
      await TreeService.saveRelationship(r);
    }
    setPeople(prev => [...prev, ...importedPeople]);
    setRelationships(prev => [...prev, ...importedRels]);
  };

  const exportJsonData = (): string => {
    return JSON.stringify({
      tree: activeTree,
      people,
      relationships,
      events,
      media,
      sources
    }, null, 2);
  };

  const importJsonData = async (jsonStr: string): Promise<void> => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.tree) {
        await TreeService.saveTree(data.tree);
        setActiveTree(data.tree);
      }
      if (Array.isArray(data.people)) {
        for (const p of data.people) await TreeService.savePerson(p);
        setPeople(data.people);
      }
      if (Array.isArray(data.relationships)) {
        for (const r of data.relationships) await TreeService.saveRelationship(r);
        setRelationships(data.relationships);
      }
      if (Array.isArray(data.events)) {
        for (const e of data.events) await TreeService.saveEvent(e);
        setEvents(data.events);
      }
      if (Array.isArray(data.media)) {
        for (const m of data.media) await TreeService.saveMedia(m);
        setMedia(data.media);
      }
      if (Array.isArray(data.sources)) {
        for (const s of data.sources) await TreeService.saveSource(s);
        setSources(data.sources);
      }
    } catch (e) {
      console.error('Invalid JSON genealogical backup:', e);
      throw e;
    }
  };

  // Move Person Position (Drag & Drop)
  const movePersonPosition = async (personId: string, position: { x: number; y: number }) => {
    if (!activeTree) return;
    const target = people.find(p => p.id === personId);
    if (!target) return;

    const updated: Person = {
      ...target,
      position,
      updatedAt: new Date().toISOString()
    };

    // Update in memory immediately for fast responsiveness
    setPeople(prev => prev.map(p => p.id === personId ? updated : p));
    await TreeService.savePerson(updated);

    // Write movement to public movement log
    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'person',
      entityId: personId,
      entityName: `${target.firstName} ${target.lastName}`,
      action: 'update',
      summary: `Movió a ${target.firstName} ${target.lastName} a (${Math.round(position.x)}, ${Math.round(position.y)})`,
      userId: currentUser?.userId || 'guest-collab',
      userName: currentUser?.displayName || 'Familiar Colaborador',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);
  };

  // Log custom public movement
  const logUserMovement = async (summary: string, entityId?: string, entityName?: string) => {
    if (!activeTree) return;
    const change: ChangeLog = {
      id: `chg-${Date.now()}`,
      treeId: activeTree.id,
      entityType: 'tree',
      entityId: entityId || activeTree.id,
      entityName: entityName || activeTree.name,
      action: 'update',
      summary,
      userId: currentUser?.userId || 'guest-collab',
      userName: currentUser?.displayName || 'Familiar Invitado',
      timestamp: new Date().toISOString()
    };
    await TreeService.logChange(change);
    setChanges(prev => [change, ...prev]);
  };

  // Start with clean initial empty template
  const createEmptyInitialTemplate = async (): Promise<Person> => {
    const newTreeId = `tree-${Date.now()}`;
    const newTree: Tree = {
      id: newTreeId,
      name: 'Mi Árbol Genealógico',
      description: 'Árbol familiar inicial colaborativo',
      ownerId: currentUser?.userId || 'user-default-owner',
      ownerName: currentUser?.displayName || 'Propietario',
      ownerEmail: currentUser?.email || '',
      visibility: 'public',
      slug: 'mi-arbol-familiar',
      settings: {
        hideLivingDetails: true,
        livingAgeThreshold: 100,
        defaultRoleForInvites: 'collaborator',
        allowPublicRequests: true,
        requireProposalApproval: false,
        showCommentsToPublic: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const rootPerson: Person = {
      id: `p-${Date.now()}-root`,
      treeId: newTree.id,
      firstName: currentUser?.displayName?.split(' ')[0] || 'Familiar',
      lastName: currentUser?.displayName?.split(' ')[1] || 'Principal',
      gender: 'unknown',
      birthDate: '1990-01-01',
      birthPlace: 'Ciudad de Origen',
      isLiving: true,
      bio: 'Familiar inicial del árbol. Utiliza los botones (+) para invitar a tus familiares o añadir padres, hijos y cónyuges.',
      certainty: 'confirmed',
      position: { x: 400, y: 300 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await TreeService.saveTree(newTree);
    await TreeService.savePerson(rootPerson);

    setTrees(prev => [newTree, ...prev]);
    setActiveTree(newTree);
    setPeople([rootPerson]);
    setRelationships([]);
    setEvents([]);
    setMedia([]);
    setSources([]);
    setSelectedPersonId(rootPerson.id);

    await logUserMovement(`Inició una nueva plantilla vacía con ${rootPerson.firstName} ${rootPerson.lastName}`);
    return rootPerson;
  };

  // Surname Styling
  const updateSurnameStyle = async (surname: string, style: SurnameStyle) => {
    if (!activeTree) return;
    const cleanKey = surname.trim().toLowerCase();
    const updatedStyles = {
      ...(activeTree.settings.surnameStyles || {}),
      [cleanKey]: style
    };
    await updateTree({
      settings: {
        ...activeTree.settings,
        surnameStyles: updatedStyles
      }
    });
  };

  const removeSurnameStyle = async (surname: string) => {
    if (!activeTree || !activeTree.settings.surnameStyles) return;
    const cleanKey = surname.trim().toLowerCase();
    const current = { ...activeTree.settings.surnameStyles };
    delete current[cleanKey];
    await updateTree({
      settings: {
        ...activeTree.settings,
        surnameStyles: current
      }
    });
  };

  // Add Indirect / Bridge Relatives
  const addIndirectRelative = async ({
    fromPersonId,
    indirectType,
    relativeData,
    viaParentId
  }: {
    fromPersonId: string;
    indirectType: 'grandparent' | 'great_grandparent' | 'uncle_aunt' | 'cousin' | 'grandchild' | 'nephew_niece';
    relativeData?: Partial<Person>;
    viaParentId?: string;
  }): Promise<{ createdRelative: Person; bridgePlaceholders: Person[] }> => {
    if (!activeTree) throw new Error('No active tree');
    const fromPerson = people.find(p => p.id === fromPersonId);
    if (!fromPerson) throw new Error('Person not found');

    const bridgePlaceholders: Person[] = [];

    // Helper to find parents of a person
    const getParentsOf = (pId: string) => {
      const parentRels = relationships.filter(r => r.type === 'parent' && r.person2Id === pId);
      return parentRels.map(r => people.find(p => p.id === r.person1Id)).filter(Boolean) as Person[];
    };

    // Helper to find children of a person
    const getChildrenOf = (pId: string) => {
      const childRels = relationships.filter(r => r.type === 'parent' && r.person1Id === pId);
      return childRels.map(r => people.find(p => p.id === r.person2Id)).filter(Boolean) as Person[];
    };

    let createdRelative: Person;

    if (indirectType === 'grandparent') {
      // 1. Find or create intermediate Parent
      let parent: Person;
      const existingParents = getParentsOf(fromPerson.id);
      if (viaParentId && people.some(p => p.id === viaParentId)) {
        parent = people.find(p => p.id === viaParentId)!;
      } else if (existingParents.length > 0) {
        parent = existingParents[0];
      } else {
        // Auto-create empty placeholder parent
        parent = await addPerson({
          firstName: '[Padre/Madre]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Padre/Madre de ${fromPerson.firstName}`,
          bio: `Tarjeta vacía generada como enlace intermedio para conectar a los abuelos de ${fromPerson.firstName}.`,
          certainty: 'estimated',
          position: fromPerson.position ? { x: fromPerson.position.x - 30, y: fromPerson.position.y - 180 } : undefined
        });
        bridgePlaceholders.push(parent);
        await addRelationship({
          person1Id: parent.id,
          person2Id: fromPerson.id,
          type: 'parent',
          certainty: 'estimated'
        });
      }

      // 2. Create the grandparent connected to parent
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Abuelo/Abuela]',
        lastName: relativeData?.lastName || parent.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDate: relativeData?.birthDate,
        birthDateApprox: relativeData?.birthDateApprox,
        birthPlace: relativeData?.birthPlace,
        isLiving: relativeData?.isLiving ?? false,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Abuelo/Abuela de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed',
        position: parent.position ? { x: parent.position.x - 30, y: parent.position.y - 180 } : undefined
      });

      await addRelationship({
        person1Id: createdRelative.id,
        person2Id: parent.id,
        type: 'parent',
        certainty: relativeData?.certainty || 'confirmed'
      });

    } else if (indirectType === 'great_grandparent') {
      // 1. Get or create parent
      let parent: Person;
      const existingParents = getParentsOf(fromPerson.id);
      if (existingParents.length > 0) {
        parent = existingParents[0];
      } else {
        parent = await addPerson({
          firstName: '[Padre/Madre]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Padre/Madre de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(parent);
        await addRelationship({ person1Id: parent.id, person2Id: fromPerson.id, type: 'parent', certainty: 'estimated' });
      }

      // 2. Get or create grandparent
      let grandparent: Person;
      const existingGrandparents = getParentsOf(parent.id);
      if (existingGrandparents.length > 0) {
        grandparent = existingGrandparents[0];
      } else {
        grandparent = await addPerson({
          firstName: '[Abuelo/Abuela]',
          lastName: parent.lastName || fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Abuelo/Abuela de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(grandparent);
        await addRelationship({ person1Id: grandparent.id, person2Id: parent.id, type: 'parent', certainty: 'estimated' });
      }

      // 3. Create great-grandparent
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Bisabuelo/Bisabuela]',
        lastName: relativeData?.lastName || grandparent.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDateApprox: relativeData?.birthDateApprox,
        isLiving: relativeData?.isLiving ?? false,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Bisabuelo/Bisabuela de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed'
      });

      await addRelationship({
        person1Id: createdRelative.id,
        person2Id: grandparent.id,
        type: 'parent',
        certainty: relativeData?.certainty || 'confirmed'
      });

    } else if (indirectType === 'uncle_aunt') {
      // 1. Get or create Parent
      let parent: Person;
      const existingParents = getParentsOf(fromPerson.id);
      if (existingParents.length > 0) {
        parent = existingParents[0];
      } else {
        parent = await addPerson({
          firstName: '[Padre/Madre]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Padre/Madre de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(parent);
        await addRelationship({ person1Id: parent.id, person2Id: fromPerson.id, type: 'parent', certainty: 'estimated' });
      }

      // 2. Get or create Grandparent (so Parent and Uncle/Aunt are siblings)
      let grandparent: Person;
      const existingGrandparents = getParentsOf(parent.id);
      if (existingGrandparents.length > 0) {
        grandparent = existingGrandparents[0];
      } else {
        grandparent = await addPerson({
          firstName: '[Abuelo/Abuela]',
          lastName: parent.lastName || fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Abuelo/Abuela de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(grandparent);
        await addRelationship({ person1Id: grandparent.id, person2Id: parent.id, type: 'parent', certainty: 'estimated' });
      }

      // 3. Create Uncle/Aunt as child of Grandparent
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Tío/Tía]',
        lastName: relativeData?.lastName || parent.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDate: relativeData?.birthDate,
        birthDateApprox: relativeData?.birthDateApprox,
        birthPlace: relativeData?.birthPlace,
        isLiving: relativeData?.isLiving ?? true,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Tío/Tía de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed',
        position: parent.position ? { x: parent.position.x + 240, y: parent.position.y } : undefined
      });

      await addRelationship({
        person1Id: grandparent.id,
        person2Id: createdRelative.id,
        type: 'parent',
        certainty: 'confirmed'
      });

    } else if (indirectType === 'cousin') {
      // 1. Parent
      let parent: Person;
      const existingParents = getParentsOf(fromPerson.id);
      if (existingParents.length > 0) {
        parent = existingParents[0];
      } else {
        parent = await addPerson({
          firstName: '[Padre/Madre]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Padre/Madre de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(parent);
        await addRelationship({ person1Id: parent.id, person2Id: fromPerson.id, type: 'parent', certainty: 'estimated' });
      }

      // 2. Grandparent
      let grandparent: Person;
      const existingGrandparents = getParentsOf(parent.id);
      if (existingGrandparents.length > 0) {
        grandparent = existingGrandparents[0];
      } else {
        grandparent = await addPerson({
          firstName: '[Abuelo/Abuela]',
          lastName: parent.lastName || fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Abuelo/Abuela de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(grandparent);
        await addRelationship({ person1Id: grandparent.id, person2Id: parent.id, type: 'parent', certainty: 'estimated' });
      }

      // 3. Uncle/Aunt (sibling of parent)
      const uncleCandidates = getChildrenOf(grandparent.id).filter(c => c.id !== parent.id);
      let uncle: Person;
      if (uncleCandidates.length > 0) {
        uncle = uncleCandidates[0];
      } else {
        uncle = await addPerson({
          firstName: '[Tío/Tía]',
          lastName: parent.lastName || fromPerson.lastName,
          gender: 'unknown',
          isLiving: true,
          isPlaceholder: true,
          placeholderRole: `Tío/Tía de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(uncle);
        await addRelationship({ person1Id: grandparent.id, person2Id: uncle.id, type: 'parent', certainty: 'estimated' });
      }

      // 4. Create Cousin as child of Uncle/Aunt
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Primo/Prima]',
        lastName: relativeData?.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDateApprox: relativeData?.birthDateApprox,
        isLiving: relativeData?.isLiving ?? true,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Primo/Prima de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed',
        position: fromPerson.position ? { x: fromPerson.position.x + 240, y: fromPerson.position.y } : undefined
      });

      await addRelationship({
        person1Id: uncle.id,
        person2Id: createdRelative.id,
        type: 'parent',
        certainty: 'confirmed'
      });

    } else if (indirectType === 'grandchild') {
      // 1. Get or create Child
      let child: Person;
      const existingChildren = getChildrenOf(fromPerson.id);
      if (existingChildren.length > 0) {
        child = existingChildren[0];
      } else {
        child = await addPerson({
          firstName: '[Hijo/Hija]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: true,
          isPlaceholder: true,
          placeholderRole: `Hijo/Hija de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(child);
        await addRelationship({ person1Id: fromPerson.id, person2Id: child.id, type: 'parent', certainty: 'estimated' });
      }

      // 2. Create Grandchild as child of child
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Nieto/Nieta]',
        lastName: relativeData?.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDateApprox: relativeData?.birthDateApprox,
        isLiving: relativeData?.isLiving ?? true,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Nieto/Nieta de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed'
      });

      await addRelationship({
        person1Id: child.id,
        person2Id: createdRelative.id,
        type: 'parent',
        certainty: 'confirmed'
      });

    } else {
      // Nephew/Niece: child of a sibling
      let sibling: Person;
      const existingParents = getParentsOf(fromPerson.id);
      let parent: Person;
      if (existingParents.length > 0) {
        parent = existingParents[0];
      } else {
        parent = await addPerson({
          firstName: '[Padre/Madre]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: false,
          isPlaceholder: true,
          placeholderRole: `Padre/Madre de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(parent);
        await addRelationship({ person1Id: parent.id, person2Id: fromPerson.id, type: 'parent', certainty: 'estimated' });
      }

      const siblingCandidates = getChildrenOf(parent.id).filter(c => c.id !== fromPerson.id);
      if (siblingCandidates.length > 0) {
        sibling = siblingCandidates[0];
      } else {
        sibling = await addPerson({
          firstName: '[Hermano/Hermana]',
          lastName: fromPerson.lastName,
          gender: 'unknown',
          isLiving: true,
          isPlaceholder: true,
          placeholderRole: `Hermano/Hermana de ${fromPerson.firstName}`,
          certainty: 'estimated'
        });
        bridgePlaceholders.push(sibling);
        await addRelationship({ person1Id: parent.id, person2Id: sibling.id, type: 'parent', certainty: 'estimated' });
      }

      // Create Nephew/Niece
      createdRelative = await addPerson({
        firstName: relativeData?.firstName || '[Sobrino/Sobrina]',
        lastName: relativeData?.lastName || fromPerson.lastName,
        gender: relativeData?.gender || 'unknown',
        birthDateApprox: relativeData?.birthDateApprox,
        isLiving: relativeData?.isLiving ?? true,
        isPlaceholder: !relativeData?.firstName || relativeData.firstName.startsWith('['),
        placeholderRole: `Sobrino/Sobrina de ${fromPerson.firstName}`,
        certainty: relativeData?.certainty || 'confirmed'
      });

      await addRelationship({
        person1Id: sibling.id,
        person2Id: createdRelative.id,
        type: 'parent',
        certainty: 'confirmed'
      });
    }

    return { createdRelative, bridgePlaceholders };
  };

  // Reset to original demo tree
  const resetToDemoTree = async () => {
    if (currentUser) {
      localStorage.clear();
      await TreeService.initializeDefaultData(currentUser.userId);
      setActiveTree(SEED_TREE);
      await loadTreeData(SEED_TREE.id);
      setSelectedPersonId(null);
    }
  };

  return (
    <TreeContext.Provider
      value={{
        trees,
        activeTree,
        people,
        relationships,
        events,
        media,
        sources,
        requests,
        proposals,
        changes,
        comments,
        loading,
        selectedPersonId,
        selectTree,
        createTree,
        updateTree,
        deleteTree,
        setSelectedPersonId,
        addPerson,
        updatePerson,
        deletePerson,
        addRelationship,
        deleteRelationship,
        addEvent,
        updateEvent,
        deleteEvent,
        addMedia,
        deleteMedia,
        addSource,
        deleteSource,
        sendAccessRequest,
        respondToRequest,
        submitProposal,
        respondToProposal,
        addComment,
        movePersonPosition,
        createEmptyInitialTemplate,
        resetToDemoTree,
        logUserMovement,
        updateSurnameStyle,
        removeSurnameStyle,
        addIndirectRelative,
        importGedcomData,
        exportGedcomData,
        exportJsonData,
        importJsonData,
        getSanitizedPerson,
        canEdit,
        canManage
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = (): TreeContextType => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};
