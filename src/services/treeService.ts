import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Tree, Person, Relationship, FamilyEvent, MediaItem, 
  HistoricalSource, TreeMember, AccessRequest, Proposal, 
  ChangeLog, Comment 
} from '../types';
import { 
  SEED_TREE, SEED_PEOPLE, SEED_RELATIONSHIPS, 
  SEED_EVENTS, SEED_MEDIA, SEED_SOURCES, 
  SEED_REQUESTS, SEED_PROPOSALS, SEED_CHANGES, SEED_COMMENTS 
} from '../data/seedData';

const LOCAL_STORAGE_KEY_PREFIX = 'arbol_digital_';

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export class TreeService {
  // Initialize default tree data if needed
  static async initializeDefaultData(userId: string): Promise<Tree> {
    const defaultTree = { ...SEED_TREE, ownerId: userId };
    const initKey = `initialized_${defaultTree.id}`;
    const isAlreadyInitialized = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + initKey) === 'true';
    
    try {
      const treeRef = doc(db, 'trees', defaultTree.id);
      const snap = await getDoc(treeRef);
      
      if (!snap.exists()) {
        await setDoc(treeRef, defaultTree);
        
        // Populate subcollections once
        const batch = writeBatch(db);
        SEED_PEOPLE.forEach(p => {
          batch.set(doc(db, `trees/${defaultTree.id}/people`, p.id), p);
        });
        SEED_RELATIONSHIPS.forEach(r => {
          batch.set(doc(db, `trees/${defaultTree.id}/relationships`, r.id), r);
        });
        SEED_EVENTS.forEach(e => {
          batch.set(doc(db, `trees/${defaultTree.id}/events`, e.id), e);
        });
        SEED_MEDIA.forEach(m => {
          batch.set(doc(db, `trees/${defaultTree.id}/media`, m.id), m);
        });
        SEED_SOURCES.forEach(s => {
          batch.set(doc(db, `trees/${defaultTree.id}/sources`, s.id), s);
        });
        SEED_REQUESTS.forEach(req => {
          batch.set(doc(db, `trees/${defaultTree.id}/requests`, req.id), req);
        });
        SEED_PROPOSALS.forEach(prop => {
          batch.set(doc(db, `trees/${defaultTree.id}/proposals`, prop.id), prop);
        });
        SEED_CHANGES.forEach(c => {
          batch.set(doc(db, `trees/${defaultTree.id}/changes`, c.id), c);
        });
        SEED_COMMENTS.forEach(com => {
          batch.set(doc(db, `trees/${defaultTree.id}/comments`, com.id), com);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore remote init check finished:', err);
    }

    // Only cache seed locally if it was never initialized
    if (!isAlreadyInitialized) {
      const existingTrees = getLocalData<Tree[]>('trees', []);
      if (!existingTrees.some(t => t.id === defaultTree.id)) {
        setLocalData('trees', [defaultTree, ...existingTrees]);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `people_${defaultTree.id}`) === null) {
        setLocalData(`people_${defaultTree.id}`, SEED_PEOPLE);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `relationships_${defaultTree.id}`) === null) {
        setLocalData(`relationships_${defaultTree.id}`, SEED_RELATIONSHIPS);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `events_${defaultTree.id}`) === null) {
        setLocalData(`events_${defaultTree.id}`, SEED_EVENTS);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `media_${defaultTree.id}`) === null) {
        setLocalData(`media_${defaultTree.id}`, SEED_MEDIA);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `sources_${defaultTree.id}`) === null) {
        setLocalData(`sources_${defaultTree.id}`, SEED_SOURCES);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `requests_${defaultTree.id}`) === null) {
        setLocalData(`requests_${defaultTree.id}`, SEED_REQUESTS);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `proposals_${defaultTree.id}`) === null) {
        setLocalData(`proposals_${defaultTree.id}`, SEED_PROPOSALS);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `changes_${defaultTree.id}`) === null) {
        setLocalData(`changes_${defaultTree.id}`, SEED_CHANGES);
      }
      if (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + `comments_${defaultTree.id}`) === null) {
        setLocalData(`comments_${defaultTree.id}`, SEED_COMMENTS);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + initKey, 'true');
    }

    return defaultTree;
  }

  // --- TREES ---
  static async getTrees(userId: string): Promise<Tree[]> {
    try {
      const q = query(collection(db, 'trees'));
      const snapshot = await getDocs(q);
      const list: Tree[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Tree);
      });
      if (list.length > 0) {
        setLocalData('trees', list);
        return list;
      }
    } catch (e) {
      console.warn('Using local trees fallback:', e);
    }
    return getLocalData<Tree[]>('trees', [SEED_TREE]);
  }

  static async getTreeById(treeId: string): Promise<Tree | null> {
    try {
      const docSnap = await getDoc(doc(db, 'trees', treeId));
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Tree;
      }
    } catch (e) {
      console.warn('Failed to fetch tree from remote:', e);
    }
    const trees = getLocalData<Tree[]>('trees', [SEED_TREE]);
    return trees.find(t => t.id === treeId || t.slug === treeId) || trees[0] || null;
  }

  static async saveTree(tree: Tree): Promise<void> {
    try {
      await setDoc(doc(db, 'trees', tree.id), tree, { merge: true });
    } catch (e) {
      console.warn('Saved tree locally:', e);
    }
    const trees = getLocalData<Tree[]>('trees', [SEED_TREE]);
    const idx = trees.findIndex(t => t.id === tree.id);
    if (idx >= 0) trees[idx] = tree;
    else trees.push(tree);
    setLocalData('trees', trees);
  }

  static clearTreeCache(treeId: string): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `people_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `relationships_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `events_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `media_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `sources_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `requests_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `proposals_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `changes_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `comments_${treeId}`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + `initialized_${treeId}`);
    } catch (e) {
      console.warn('Error clearing local storage cache:', e);
    }
  }

  static async deleteTree(treeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'trees', treeId));
    } catch (e) {
      console.warn('Error remote delete tree:', e);
    }
    const trees = getLocalData<Tree[]>('trees', [SEED_TREE]).filter(t => t.id !== treeId);
    setLocalData('trees', trees);
    TreeService.clearTreeCache(treeId);
  }

  // --- PEOPLE ---
  static async getPeople(treeId: string): Promise<Person[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/people`));
      const snapshot = await getDocs(q);
      const list: Person[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Person));
      setLocalData(`people_${treeId}`, list);
      return list;
    } catch (e) {
      console.warn('Using local people fallback:', e);
    }
    return getLocalData<Person[]>(`people_${treeId}`, treeId === SEED_TREE.id ? SEED_PEOPLE : []);
  }

  static async savePerson(person: Person): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${person.treeId}/people`, person.id), person, { merge: true });
    } catch (e) {
      console.warn('Save person locally:', e);
    }
    const people = getLocalData<Person[]>(`people_${person.treeId}`, []);
    const idx = people.findIndex(p => p.id === person.id);
    if (idx >= 0) people[idx] = person;
    else people.push(person);
    setLocalData(`people_${person.treeId}`, people);
  }

  static async deletePerson(treeId: string, personId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/people`, personId));
    } catch (e) {
      console.warn('Delete person local fallback:', e);
    }
    const currentPeople = getLocalData<Person[]>(`people_${treeId}`, treeId === SEED_TREE.id ? SEED_PEOPLE : []);
    const people = currentPeople.filter(p => p.id !== personId);
    setLocalData(`people_${treeId}`, people);

    // Also remove relationships referencing this person
    const currentRels = getLocalData<Relationship[]>(`relationships_${treeId}`, treeId === SEED_TREE.id ? SEED_RELATIONSHIPS : []);
    const relsToDelete = currentRels.filter(r => r.person1Id === personId || r.person2Id === personId);
    const rels = currentRels.filter(r => r.person1Id !== personId && r.person2Id !== personId);
    setLocalData(`relationships_${treeId}`, rels);

    for (const rel of relsToDelete) {
      try {
        await deleteDoc(doc(db, `trees/${treeId}/relationships`, rel.id));
      } catch (err) {
        // ignore
      }
    }
  }

  // --- RELATIONSHIPS ---
  static async getRelationships(treeId: string): Promise<Relationship[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/relationships`));
      const snapshot = await getDocs(q);
      const list: Relationship[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Relationship));
      setLocalData(`relationships_${treeId}`, list);
      return list;
    } catch (e) {
      console.warn('Using local rels fallback:', e);
    }
    return getLocalData<Relationship[]>(`relationships_${treeId}`, treeId === SEED_TREE.id ? SEED_RELATIONSHIPS : []);
  }

  static async saveRelationship(rel: Relationship): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${rel.treeId}/relationships`, rel.id), rel, { merge: true });
    } catch (e) {
      console.warn('Save rel locally:', e);
    }
    const rels = getLocalData<Relationship[]>(`relationships_${rel.treeId}`, []);
    const idx = rels.findIndex(r => r.id === rel.id);
    if (idx >= 0) rels[idx] = rel;
    else rels.push(rel);
    setLocalData(`relationships_${rel.treeId}`, rels);
  }

  static async deleteRelationship(treeId: string, relId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/relationships`, relId));
    } catch (e) {
      console.warn('Delete rel locally:', e);
    }
    const currentRels = getLocalData<Relationship[]>(`relationships_${treeId}`, treeId === SEED_TREE.id ? SEED_RELATIONSHIPS : []);
    const rels = currentRels.filter(r => r.id !== relId);
    setLocalData(`relationships_${treeId}`, rels);
  }

  // --- EVENTS ---
  static async getEvents(treeId: string): Promise<FamilyEvent[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/events`));
      const snapshot = await getDocs(q);
      const list: FamilyEvent[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as FamilyEvent));
      setLocalData(`events_${treeId}`, list);
      return list;
    } catch (e) {
      console.warn('Using local events fallback:', e);
    }
    return getLocalData<FamilyEvent[]>(`events_${treeId}`, treeId === SEED_TREE.id ? SEED_EVENTS : []);
  }

  static async saveEvent(event: FamilyEvent): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${event.treeId}/events`, event.id), event, { merge: true });
    } catch (e) {
      console.warn('Save event locally:', e);
    }
    const events = getLocalData<FamilyEvent[]>(`events_${event.treeId}`, []);
    const idx = events.findIndex(e => e.id === event.id);
    if (idx >= 0) events[idx] = event;
    else events.push(event);
    setLocalData(`events_${event.treeId}`, events);
  }

  static async deleteEvent(treeId: string, eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/events`, eventId));
    } catch (e) {
      console.warn('Delete event locally:', e);
    }
    const currentEvents = getLocalData<FamilyEvent[]>(`events_${treeId}`, treeId === SEED_TREE.id ? SEED_EVENTS : []);
    const events = currentEvents.filter(e => e.id !== eventId);
    setLocalData(`events_${treeId}`, events);
  }

  // --- MEDIA ---
  static async getMedia(treeId: string): Promise<MediaItem[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/media`));
      const snapshot = await getDocs(q);
      const list: MediaItem[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as MediaItem));
      setLocalData(`media_${treeId}`, list);
      return list;
    } catch (e) {
      console.warn('Using local media fallback:', e);
    }
    return getLocalData<MediaItem[]>(`media_${treeId}`, treeId === SEED_TREE.id ? SEED_MEDIA : []);
  }

  static async saveMedia(media: MediaItem): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${media.treeId}/media`, media.id), media, { merge: true });
    } catch (e) {
      console.warn('Save media locally:', e);
    }
    const mediaList = getLocalData<MediaItem[]>(`media_${media.treeId}`, []);
    const idx = mediaList.findIndex(m => m.id === media.id);
    if (idx >= 0) mediaList[idx] = media;
    else mediaList.push(media);
    setLocalData(`media_${media.treeId}`, mediaList);
  }

  static async deleteMedia(treeId: string, mediaId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/media`, mediaId));
    } catch (e) {
      console.warn('Delete media locally:', e);
    }
    const currentMedia = getLocalData<MediaItem[]>(`media_${treeId}`, treeId === SEED_TREE.id ? SEED_MEDIA : []);
    const mediaList = currentMedia.filter(m => m.id !== mediaId);
    setLocalData(`media_${treeId}`, mediaList);
  }

  // --- SOURCES ---
  static async getSources(treeId: string): Promise<HistoricalSource[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/sources`));
      const snapshot = await getDocs(q);
      const list: HistoricalSource[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as HistoricalSource));
      setLocalData(`sources_${treeId}`, list);
      return list;
    } catch (e) {
      console.warn('Using local sources fallback:', e);
    }
    return getLocalData<HistoricalSource[]>(`sources_${treeId}`, treeId === SEED_TREE.id ? SEED_SOURCES : []);
  }

  static async saveSource(source: HistoricalSource): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${source.treeId}/sources`, source.id), source, { merge: true });
    } catch (e) {
      console.warn('Save source locally:', e);
    }
    const sources = getLocalData<HistoricalSource[]>(`sources_${source.treeId}`, []);
    const idx = sources.findIndex(s => s.id === source.id);
    if (idx >= 0) sources[idx] = source;
    else sources.push(source);
    setLocalData(`sources_${source.treeId}`, sources);
  }

  static async deleteSource(treeId: string, sourceId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/sources`, sourceId));
    } catch (e) {
      console.warn('Delete source locally:', e);
    }
    const currentSources = getLocalData<HistoricalSource[]>(`sources_${treeId}`, treeId === SEED_TREE.id ? SEED_SOURCES : []);
    const sources = currentSources.filter(s => s.id !== sourceId);
    setLocalData(`sources_${treeId}`, sources);
  }

  // --- REQUESTS ---
  static async getRequests(treeId: string): Promise<AccessRequest[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/requests`));
      const snapshot = await getDocs(q);
      const list: AccessRequest[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as AccessRequest));
      if (list.length > 0) {
        setLocalData(`requests_${treeId}`, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local requests fallback:', e);
    }
    return getLocalData<AccessRequest[]>(`requests_${treeId}`, treeId === SEED_TREE.id ? SEED_REQUESTS : []);
  }

  static async saveRequest(req: AccessRequest): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${req.treeId}/requests`, req.id), req, { merge: true });
    } catch (e) {
      console.warn('Save request locally:', e);
    }
    const requests = getLocalData<AccessRequest[]>(`requests_${req.treeId}`, []);
    const idx = requests.findIndex(r => r.id === req.id);
    if (idx >= 0) requests[idx] = req;
    else requests.push(req);
    setLocalData(`requests_${req.treeId}`, requests);
  }

  // --- PROPOSALS ---
  static async getProposals(treeId: string): Promise<Proposal[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/proposals`));
      const snapshot = await getDocs(q);
      const list: Proposal[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Proposal));
      if (list.length > 0) {
        setLocalData(`proposals_${treeId}`, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local proposals fallback:', e);
    }
    return getLocalData<Proposal[]>(`proposals_${treeId}`, treeId === SEED_TREE.id ? SEED_PROPOSALS : []);
  }

  static async saveProposal(prop: Proposal): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${prop.treeId}/proposals`, prop.id), prop, { merge: true });
    } catch (e) {
      console.warn('Save proposal locally:', e);
    }
    const list = getLocalData<Proposal[]>(`proposals_${prop.treeId}`, []);
    const idx = list.findIndex(p => p.id === prop.id);
    if (idx >= 0) list[idx] = prop;
    else list.push(prop);
    setLocalData(`proposals_${prop.treeId}`, list);
  }

  // --- CHANGES ---
  static async getChanges(treeId: string): Promise<ChangeLog[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/changes`), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const list: ChangeLog[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as ChangeLog));
      if (list.length > 0) {
        setLocalData(`changes_${treeId}`, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local changes fallback:', e);
    }
    return getLocalData<ChangeLog[]>(`changes_${treeId}`, treeId === SEED_TREE.id ? SEED_CHANGES : []);
  }

  static async logChange(change: ChangeLog): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${change.treeId}/changes`, change.id), change);
    } catch (e) {
      console.warn('Save change locally:', e);
    }
    const changes = getLocalData<ChangeLog[]>(`changes_${change.treeId}`, []);
    changes.unshift(change);
    setLocalData(`changes_${change.treeId}`, changes);
  }

  // --- COMMENTS ---
  static async getComments(treeId: string): Promise<Comment[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/comments`), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const list: Comment[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Comment));
      if (list.length > 0) {
        setLocalData(`comments_${treeId}`, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local comments fallback:', e);
    }
    return getLocalData<Comment[]>(`comments_${treeId}`, treeId === SEED_TREE.id ? SEED_COMMENTS : []);
  }

  static async addComment(comment: Comment): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${comment.treeId}/comments`, comment.id), comment);
    } catch (e) {
      console.warn('Save comment locally:', e);
    }
    const comments = getLocalData<Comment[]>(`comments_${comment.treeId}`, []);
    comments.push(comment);
    setLocalData(`comments_${comment.treeId}`, comments);
  }
}
