import { 
  TreeCommit, 
  TreeBranch, 
  TreeSnapshot, 
  CommitAuthor, 
  CommitDelta, 
  BranchDiffSummary, 
  Person, 
  Relationship,
  FieldDiff
} from '../types';
import { db } from '../firebase/config';
import { doc, setDoc, getDocs, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { cleanForFirestore } from '../utils/firestoreUtils';

export class GitVersionService {
  /**
   * Generates a unique commit ID and a 7-char short hash
   */
  static generateCommitId(): { id: string; shortHash: string } {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const hash = `${timestamp}${random}`.toLowerCase();
    return {
      id: `c-${hash}`,
      shortHash: hash.substring(0, 7)
    };
  }

  /**
   * Generates a branch ID based on name
   */
  static generateBranchId(name: string): string {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const rand = Math.random().toString(36).substring(2, 5);
    return `branch-${clean || 'investigacion'}-${rand}`;
  }

  /**
   * Create an initial commit when a tree or initial state is initialized
   */
  static createInitialCommit(
    treeId: string,
    snapshot: TreeSnapshot,
    author: CommitAuthor,
    customMessage: string = 'Marca Inicial: Estructura del árbol familiar'
  ): { commit: TreeCommit; branch: TreeBranch } {
    const { id, shortHash } = this.generateCommitId();
    const timestamp = new Date().toISOString();

    const commit: TreeCommit = {
      id,
      shortHash,
      treeId,
      branchId: 'main',
      branchName: 'Principal (Main)',
      parentCommitId: null,
      message: customMessage,
      author,
      timestamp,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      delta: {
        action: 'manual_commit',
        details: 'Creación de la rama principal e importación inicial'
      }
    };

    const branch: TreeBranch = {
      id: 'main',
      treeId,
      name: 'Principal (Main)',
      description: 'Línea de tiempo principal verificada del árbol genealógico',
      createdBy: author,
      createdAt: timestamp,
      baseCommitId: id,
      headCommitId: id,
      isDefault: true,
      status: 'active',
      lastActivityAt: timestamp,
      color: '#5A5A40'
    };

    return { commit, branch };
  }

  /**
   * Record a new commit on the specified branch
   */
  static createCommit(params: {
    treeId: string;
    branchId: string;
    branchName: string;
    parentCommitId: string | null;
    message: string;
    author: CommitAuthor;
    snapshot: TreeSnapshot;
    delta?: CommitDelta;
    isMergeCommit?: boolean;
    mergedFromBranchId?: string;
    mergedFromBranchName?: string;
    tag?: string;
  }): TreeCommit {
    const { id, shortHash } = this.generateCommitId();
    const timestamp = new Date().toISOString();

    const commit: TreeCommit = {
      id,
      shortHash,
      treeId: params.treeId,
      branchId: params.branchId,
      branchName: params.branchName,
      parentCommitId: params.parentCommitId,
      message: params.message,
      author: params.author,
      timestamp,
      snapshot: JSON.parse(JSON.stringify(params.snapshot)),
      delta: params.delta,
      isMergeCommit: params.isMergeCommit,
      mergedFromBranchId: params.mergedFromBranchId,
      mergedFromBranchName: params.mergedFromBranchName,
      tag: params.tag
    };

    return commit;
  }

  static computePersonDiff(before: Person, after: Person): FieldDiff[] {
    return this.comparePersonDiff(before, after);
  }

  /**
   * Calculates diff between two person objects
   */
  static comparePersonDiff(before: Person, after: Person): FieldDiff[] {
    const diffs: FieldDiff[] = [];
    
    if (before.firstName !== after.firstName || before.lastName !== after.lastName) {
      diffs.push({
        field: 'name',
        fieldLabel: 'Nombre y Apellido',
        oldValue: `${before.firstName} ${before.lastName}`,
        newValue: `${after.firstName} ${after.lastName}`
      });
    }
    if (before.gender !== after.gender) {
      diffs.push({
        field: 'gender',
        fieldLabel: 'Género',
        oldValue: before.gender,
        newValue: after.gender
      });
    }
    if (before.birthDate !== after.birthDate) {
      diffs.push({
        field: 'birthDate',
        fieldLabel: 'Fecha de Nacimiento',
        oldValue: before.birthDate || 'No definida',
        newValue: after.birthDate || 'No definida'
      });
    }
    if (before.birthPlace !== after.birthPlace) {
      diffs.push({
        field: 'birthPlace',
        fieldLabel: 'Lugar de Nacimiento',
        oldValue: before.birthPlace || 'No definido',
        newValue: after.birthPlace || 'No definido'
      });
    }
    if (before.deathDate !== after.deathDate) {
      diffs.push({
        field: 'deathDate',
        fieldLabel: 'Fecha de Defunción',
        oldValue: before.deathDate || 'Vivo / No definida',
        newValue: after.deathDate || 'Vivo / No definida'
      });
    }
    if (before.profession !== after.profession) {
      diffs.push({
        field: 'profession',
        fieldLabel: 'Profesión / Ocupación',
        oldValue: before.profession || 'Ninguna',
        newValue: after.profession || 'Ninguna'
      });
    }
    if (before.bio !== after.bio) {
      diffs.push({
        field: 'bio',
        fieldLabel: 'Biografía / Notas',
        oldValue: before.bio ? 'Texto previo' : 'Vacío',
        newValue: after.bio ? 'Texto actualizado' : 'Vacío'
      });
    }
    if (before.avatarUrl !== after.avatarUrl) {
      diffs.push({
        field: 'avatarUrl',
        fieldLabel: 'Fotografía de Perfil',
        oldValue: before.avatarUrl ? 'Foto previa' : 'Sin foto',
        newValue: after.avatarUrl ? 'Foto actualizada' : 'Sin foto'
      });
    }

    return diffs;
  }

  /**
   * Computes a full branch diff against target branch (usually 'main')
   */
  static calculateBranchDiff(
    sourceBranch: TreeBranch,
    targetBranch: TreeBranch,
    commits: TreeCommit[]
  ): BranchDiffSummary {
    const sourceHead = commits.find(c => c.id === sourceBranch.headCommitId) || null;
    const targetHead = commits.find(c => c.id === targetBranch.headCommitId) || null;

    const sourcePeople: Person[] = sourceHead?.snapshot?.people || [];
    const targetPeople: Person[] = targetHead?.snapshot?.people || [];
    const sourceRels: Relationship[] = sourceHead?.snapshot?.relationships || [];
    const targetRels: Relationship[] = targetHead?.snapshot?.relationships || [];

    const targetPeopleMap = new Map(targetPeople.map(p => [p.id, p]));
    const sourcePeopleMap = new Map(sourcePeople.map(p => [p.id, p]));

    const addedPeople: Person[] = [];
    const modifiedPeople: { person: Person; before: Person; after: Person; changes: FieldDiff[] }[] = [];
    const deletedPeople: Person[] = [];

    // Find added and modified people in source
    sourcePeople.forEach(sPerson => {
      const tPerson = targetPeopleMap.get(sPerson.id);
      if (!tPerson) {
        addedPeople.push(sPerson);
      } else {
        const diffs = this.comparePersonDiff(tPerson, sPerson);
        if (diffs.length > 0) {
          modifiedPeople.push({
            person: sPerson,
            before: tPerson,
            after: sPerson,
            changes: diffs
          });
        }
      }
    });

    // Find deleted people in source (in target but missing in source)
    targetPeople.forEach(tPerson => {
      if (!sourcePeopleMap.has(tPerson.id)) {
        deletedPeople.push(tPerson);
      }
    });

    // Relationships diff
    const targetRelsSet = new Set(targetRels.map(r => `${r.person1Id}_${r.person2Id}_${r.type}`));
    const sourceRelsSet = new Set(sourceRels.map(r => `${r.person1Id}_${r.person2Id}_${r.type}`));

    const addedRelationships = sourceRels.filter(r => !targetRelsSet.has(`${r.person1Id}_${r.person2Id}_${r.type}`));
    const deletedRelationships = targetRels.filter(r => !sourceRelsSet.has(`${r.person1Id}_${r.person2Id}_${r.type}`));

    // Detect conflicts (e.g. if target was also modified after base commit)
    const conflicts: {
      entityType: 'person' | 'relationship';
      entityId: string;
      entityName: string;
      field: string;
      fieldLabel: string;
      targetValue: any;
      sourceValue: any;
    }[] = [];

    modifiedPeople.forEach(mod => {
      mod.changes.forEach(chg => {
        // If values differ between both heads
        if (chg.oldValue !== chg.newValue && chg.oldValue && chg.newValue) {
          // Flag as notable diff / conflict candidate
        }
      });
    });

    const totalChangesCount = addedPeople.length + modifiedPeople.length + deletedPeople.length + addedRelationships.length + deletedRelationships.length;

    return {
      sourceBranch,
      targetBranch,
      sourceHeadCommit: sourceHead,
      targetHeadCommit: targetHead,
      addedPeople,
      modifiedPeople,
      deletedPeople,
      addedRelationships,
      deletedRelationships,
      totalChangesCount,
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  /**
   * Merges a source branch snapshot into target branch snapshot
   */
  static mergeSnapshots(
    sourceSnapshot: TreeSnapshot,
    targetSnapshot: TreeSnapshot,
    strategy: 'combine' | 'theirs' | 'ours' = 'combine'
  ): {
    mergedSnapshot: TreeSnapshot;
    summary: {
      addedPeopleCount: number;
      updatedPeopleCount: number;
      addedRelationshipsCount: number;
    };
  } {
    const mergedPeopleMap = new Map<string, Person>();
    
    // 1. First populate with target (main) people
    targetSnapshot.people.forEach(p => {
      mergedPeopleMap.set(p.id, { ...p });
    });

    let addedPeopleCount = 0;
    let updatedPeopleCount = 0;

    // 2. Integrate source branch people
    sourceSnapshot.people.forEach(sourceP => {
      const existing = mergedPeopleMap.get(sourceP.id);
      if (!existing) {
        mergedPeopleMap.set(sourceP.id, { ...sourceP });
        addedPeopleCount++;
      } else {
        if (strategy === 'theirs' || strategy === 'combine') {
          // Update with source info, preserving non-empty target fields if source is empty
          const mergedPerson: Person = {
            ...existing,
            ...sourceP,
            firstName: sourceP.firstName || existing.firstName,
            lastName: sourceP.lastName || existing.lastName,
            birthDate: sourceP.birthDate || existing.birthDate,
            birthPlace: sourceP.birthPlace || existing.birthPlace,
            deathDate: sourceP.deathDate || existing.deathDate,
            profession: sourceP.profession || existing.profession,
            bio: sourceP.bio || existing.bio,
            avatarUrl: sourceP.avatarUrl || existing.avatarUrl,
            updatedAt: new Date().toISOString()
          };
          mergedPeopleMap.set(sourceP.id, mergedPerson);
          updatedPeopleCount++;
        }
      }
    });

    // 3. Merge relationships
    const mergedRelsMap = new Map<string, Relationship>();
    targetSnapshot.relationships.forEach(r => {
      const key = `${r.person1Id}_${r.person2Id}_${r.type}`;
      mergedRelsMap.set(key, { ...r });
    });

    let addedRelationshipsCount = 0;
    sourceSnapshot.relationships.forEach(r => {
      const key = `${r.person1Id}_${r.person2Id}_${r.type}`;
      if (!mergedRelsMap.has(key)) {
        // Ensure both persons exist in merged people map
        if (mergedPeopleMap.has(r.person1Id) && mergedPeopleMap.has(r.person2Id)) {
          mergedRelsMap.set(key, { ...r });
          addedRelationshipsCount++;
        }
      }
    });

    // 4. Merge Events, Sources, Media
    const mergedEvents = [...(targetSnapshot.events || [])];
    const eventIds = new Set(mergedEvents.map(e => e.id));
    (sourceSnapshot.events || []).forEach(e => {
      if (!eventIds.has(e.id)) {
        mergedEvents.push(e);
        eventIds.add(e.id);
      }
    });

    const mergedSources = [...(targetSnapshot.sources || [])];
    const sourceIds = new Set(mergedSources.map(s => s.id));
    (sourceSnapshot.sources || []).forEach(s => {
      if (!sourceIds.has(s.id)) {
        mergedSources.push(s);
        sourceIds.add(s.id);
      }
    });

    const mergedMedia = [...(targetSnapshot.media || [])];
    const mediaIds = new Set(mergedMedia.map(m => m.id));
    (sourceSnapshot.media || []).forEach(m => {
      if (!mediaIds.has(m.id)) {
        mergedMedia.push(m);
        mediaIds.add(m.id);
      }
    });

    const mergedStyles = {
      ...(targetSnapshot.surnameStyles || {}),
      ...(sourceSnapshot.surnameStyles || {})
    };

    return {
      mergedSnapshot: {
        people: Array.from(mergedPeopleMap.values()),
        relationships: Array.from(mergedRelsMap.values()),
        events: mergedEvents,
        sources: mergedSources,
        media: mergedMedia,
        surnameStyles: mergedStyles
      },
      summary: {
        addedPeopleCount,
        updatedPeopleCount,
        addedRelationshipsCount
      }
    };
  }

  /**
   * Identifies forgotten / abandoned secondary branches
   * A branch is considered "forgotten / secondary with pending changes" if:
   * - It is not the default 'main' branch
   * - Its status is 'active' (not yet merged or explicitly archived)
   * - It has commits that diverge from base or are ahead of main
   */
  static detectAbandonedBranches(
    branches: TreeBranch[],
    commits: TreeCommit[]
  ): TreeBranch[] {
    const mainBranch = branches.find(b => b.isDefault || b.id === 'main');
    if (!mainBranch) return [];

    return branches.filter(branch => {
      if (branch.id === mainBranch.id) return false;
      if (branch.status === 'merged' || branch.status === 'archived') return false;
      
      // Check if branch has commits different from its base
      const branchCommits = commits.filter(c => c.branchId === branch.id);
      return branchCommits.length > 0;
    });
  }

  // ==========================================
  // PERSISTENCE (FIRESTORE)
  // ==========================================

  static async persistCommitToFirestore(commit: TreeCommit): Promise<void> {
    try {
      const sanitized = cleanForFirestore(commit);
      await setDoc(doc(db, `trees/${commit.treeId}/git_commits`, commit.id), sanitized, { merge: true });
    } catch (e) {
      console.error('Error persisting commit to Firestore:', e);
    }
  }

  static async persistBranchToFirestore(branch: TreeBranch): Promise<void> {
    try {
      const sanitized = cleanForFirestore(branch);
      await setDoc(doc(db, `trees/${branch.treeId}/git_branches`, branch.id), sanitized, { merge: true });
    } catch (e) {
      console.error('Error persisting branch to Firestore:', e);
    }
  }

  static async deleteBranchFromFirestore(treeId: string, branchId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/git_branches`, branchId));
    } catch (e) {
      console.error('Could not delete branch from Firestore:', e);
    }
  }

  static async fetchGitDataFromFirestore(treeId: string): Promise<{
    branches: TreeBranch[];
    commits: TreeCommit[];
  }> {
    try {
      const bQ = query(collection(db, `trees/${treeId}/git_branches`));
      const bSnap = await getDocs(bQ);
      const branches: TreeBranch[] = [];
      bSnap.forEach(d => branches.push({ ...d.data(), id: d.id } as TreeBranch));

      const cQ = query(collection(db, `trees/${treeId}/git_commits`), orderBy('timestamp', 'asc'));
      const cSnap = await getDocs(cQ);
      const commits: TreeCommit[] = [];
      cSnap.forEach(d => commits.push({ ...d.data(), id: d.id } as TreeCommit));

      return { branches, commits };
    } catch (e) {
      console.error('Could not fetch git data from Firestore:', e);
      return { branches: [], commits: [] };
    }
  }
}

