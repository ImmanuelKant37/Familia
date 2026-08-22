import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, 
  query, where, orderBy, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { cleanForFirestore } from '../utils/firestoreUtils';
import { 
  Tree, Person, Relationship, FamilyEvent, MediaItem, 
  HistoricalSource, AccessRequest, Proposal, 
  ChangeLog, Comment 
} from '../types';
import { 
  SEED_TREE, SEED_PEOPLE, SEED_RELATIONSHIPS, 
  SEED_EVENTS, SEED_MEDIA, SEED_SOURCES, 
  SEED_REQUESTS, SEED_PROPOSALS, SEED_CHANGES, SEED_COMMENTS 
} from '../data/seedData';

export class TreeService {
  /**
   * Initializes a default tree in Firestore for a user if they don't have one yet.
   */
  static async initializeDefaultData(userId: string): Promise<Tree> {
    const treeId = `tree-${userId.substring(0, 12)}`;
    const defaultTree: Tree = {
      ...SEED_TREE,
      id: treeId,
      ownerId: userId,
      name: 'Mi Familia',
      description: 'Árbol genealógico familiar interactivo con linajes y archivos históricos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const treeRef = doc(db, 'trees', treeId);
      const snap = await getDoc(treeRef);

      if (!snap.exists()) {
        await setDoc(treeRef, cleanForFirestore(defaultTree));

        // Populate initial family structure in Firestore subcollections
        const batch = writeBatch(db);
        SEED_PEOPLE.forEach(p => {
          batch.set(doc(db, `trees/${treeId}/people`, p.id), cleanForFirestore({ ...p, treeId }));
        });
        SEED_RELATIONSHIPS.forEach(r => {
          batch.set(doc(db, `trees/${treeId}/relationships`, r.id), cleanForFirestore({ ...r, treeId }));
        });
        SEED_EVENTS.forEach(e => {
          batch.set(doc(db, `trees/${treeId}/events`, e.id), cleanForFirestore({ ...e, treeId }));
        });
        SEED_MEDIA.forEach(m => {
          batch.set(doc(db, `trees/${treeId}/media`, m.id), cleanForFirestore({ ...m, treeId }));
        });
        SEED_SOURCES.forEach(s => {
          batch.set(doc(db, `trees/${treeId}/sources`, s.id), cleanForFirestore({ ...s, treeId }));
        });
        SEED_REQUESTS.forEach(req => {
          batch.set(doc(db, `trees/${treeId}/requests`, req.id), cleanForFirestore({ ...req, treeId }));
        });
        SEED_PROPOSALS.forEach(prop => {
          batch.set(doc(db, `trees/${treeId}/proposals`, prop.id), cleanForFirestore({ ...prop, treeId }));
        });
        SEED_CHANGES.forEach(c => {
          batch.set(doc(db, `trees/${treeId}/changes`, c.id), cleanForFirestore({ ...c, treeId }));
        });
        SEED_COMMENTS.forEach(com => {
          batch.set(doc(db, `trees/${treeId}/comments`, com.id), cleanForFirestore({ ...com, treeId }));
        });
        await batch.commit();
      }
      return defaultTree;
    } catch (err) {
      console.error('Error initializing tree in Firestore:', err);
      return defaultTree;
    }
  }

  // --- TREES ---
  static async getTrees(userId: string): Promise<Tree[]> {
    try {
      // Find trees owned by the user or visible trees
      const q = query(collection(db, 'trees'), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      const list: Tree[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Tree);
      });

      if (list.length > 0) {
        return list;
      }

      // If user has no trees yet, create initial default tree in Firestore
      const initialTree = await TreeService.initializeDefaultData(userId);
      return [initialTree];
    } catch (e) {
      console.error('Error fetching trees from Firestore:', e);
      return [];
    }
  }

  static async getTreeById(treeId: string): Promise<Tree | null> {
    try {
      const docSnap = await getDoc(doc(db, 'trees', treeId));
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Tree;
      }
    } catch (e) {
      console.error('Failed to fetch tree by ID from Firestore:', e);
    }
    return null;
  }

  static async saveTree(tree: Tree): Promise<void> {
    try {
      await setDoc(doc(db, 'trees', tree.id), cleanForFirestore({
        ...tree,
        updatedAt: new Date().toISOString()
      }), { merge: true });
    } catch (e) {
      console.error('Error saving tree to Firestore:', e);
      throw e;
    }
  }

  static async deleteTree(treeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'trees', treeId));
    } catch (e) {
      console.error('Error deleting tree from Firestore:', e);
      throw e;
    }
  }

  // --- PEOPLE ---
  static async getPeople(treeId: string): Promise<Person[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/people`));
      const snapshot = await getDocs(q);
      const list: Person[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Person));
      return list;
    } catch (e) {
      console.error('Error fetching people from Firestore:', e);
      return [];
    }
  }

  static async savePerson(person: Person): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${person.treeId}/people`, person.id), cleanForFirestore(person), { merge: true });
    } catch (e) {
      console.error('Error saving person to Firestore:', e);
      throw e;
    }
  }

  static async bulkSavePeople(treeId: string, peopleList: Person[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const p of peopleList) {
        batch.set(doc(db, `trees/${treeId}/people`, p.id), cleanForFirestore({ ...p, treeId }), { merge: true });
      }
      await batch.commit();
    } catch (e) {
      console.error('Error bulk saving people to Firestore:', e);
      throw e;
    }
  }

  static async bulkSaveRelationships(treeId: string, relsList: Relationship[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const r of relsList) {
        batch.set(doc(db, `trees/${treeId}/relationships`, r.id), cleanForFirestore({ ...r, treeId }), { merge: true });
      }
      await batch.commit();
    } catch (e) {
      console.error('Error bulk saving relationships to Firestore:', e);
      throw e;
    }
  }

  static async deletePerson(treeId: string, personId: string): Promise<void> {
    try {
      // 1. Delete person doc
      await deleteDoc(doc(db, `trees/${treeId}/people`, personId));

      // 2. Query and delete associated relationships
      const relsSnap = await getDocs(query(collection(db, `trees/${treeId}/relationships`)));
      const relsBatch = writeBatch(db);
      let count = 0;
      relsSnap.forEach(d => {
        const rel = d.data() as Relationship;
        if (rel.person1Id === personId || rel.person2Id === personId) {
          relsBatch.delete(doc(db, `trees/${treeId}/relationships`, d.id));
          count++;
        }
      });
      if (count > 0) {
        await relsBatch.commit();
      }
    } catch (e) {
      console.error('Error deleting person from Firestore:', e);
      throw e;
    }
  }

  // --- RELATIONSHIPS ---
  static async getRelationships(treeId: string): Promise<Relationship[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/relationships`));
      const snapshot = await getDocs(q);
      const list: Relationship[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Relationship));
      return list;
    } catch (e) {
      console.error('Error fetching relationships from Firestore:', e);
      return [];
    }
  }

  static async saveRelationship(rel: Relationship): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${rel.treeId}/relationships`, rel.id), cleanForFirestore(rel), { merge: true });
    } catch (e) {
      console.error('Error saving relationship to Firestore:', e);
      throw e;
    }
  }

  static async deleteRelationship(treeId: string, relId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/relationships`, relId));
    } catch (e) {
      console.error('Error deleting relationship from Firestore:', e);
      throw e;
    }
  }

  // --- EVENTS ---
  static async getEvents(treeId: string): Promise<FamilyEvent[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/events`));
      const snapshot = await getDocs(q);
      const list: FamilyEvent[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as FamilyEvent));
      return list;
    } catch (e) {
      console.error('Error fetching events from Firestore:', e);
      return [];
    }
  }

  static async saveEvent(event: FamilyEvent): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${event.treeId}/events`, event.id), cleanForFirestore(event), { merge: true });
    } catch (e) {
      console.error('Error saving event to Firestore:', e);
      throw e;
    }
  }

  static async deleteEvent(treeId: string, eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/events`, eventId));
    } catch (e) {
      console.error('Error deleting event from Firestore:', e);
      throw e;
    }
  }

  // --- MEDIA ---
  static async getMedia(treeId: string): Promise<MediaItem[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/media`));
      const snapshot = await getDocs(q);
      const list: MediaItem[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as MediaItem));
      return list;
    } catch (e) {
      console.error('Error fetching media from Firestore:', e);
      return [];
    }
  }

  static async saveMedia(media: MediaItem): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${media.treeId}/media`, media.id), cleanForFirestore(media), { merge: true });
    } catch (e) {
      console.error('Error saving media to Firestore:', e);
      throw e;
    }
  }

  static async deleteMedia(treeId: string, mediaId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/media`, mediaId));
    } catch (e) {
      console.error('Error deleting media from Firestore:', e);
      throw e;
    }
  }

  // --- SOURCES ---
  static async getSources(treeId: string): Promise<HistoricalSource[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/sources`));
      const snapshot = await getDocs(q);
      const list: HistoricalSource[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as HistoricalSource));
      return list;
    } catch (e) {
      console.error('Error fetching sources from Firestore:', e);
      return [];
    }
  }

  static async saveSource(source: HistoricalSource): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${source.treeId}/sources`, source.id), cleanForFirestore(source), { merge: true });
    } catch (e) {
      console.error('Error saving source to Firestore:', e);
      throw e;
    }
  }

  static async deleteSource(treeId: string, sourceId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `trees/${treeId}/sources`, sourceId));
    } catch (e) {
      console.error('Error deleting source from Firestore:', e);
      throw e;
    }
  }

  // --- REQUESTS ---
  static async getRequests(treeId: string): Promise<AccessRequest[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/requests`));
      const snapshot = await getDocs(q);
      const list: AccessRequest[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as AccessRequest));
      return list;
    } catch (e) {
      console.error('Error fetching requests from Firestore:', e);
      return [];
    }
  }

  static async saveRequest(req: AccessRequest): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${req.treeId}/requests`, req.id), cleanForFirestore(req), { merge: true });
    } catch (e) {
      console.error('Error saving request to Firestore:', e);
      throw e;
    }
  }

  // --- PROPOSALS ---
  static async getProposals(treeId: string): Promise<Proposal[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/proposals`));
      const snapshot = await getDocs(q);
      const list: Proposal[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Proposal));
      return list;
    } catch (e) {
      console.error('Error fetching proposals from Firestore:', e);
      return [];
    }
  }

  static async saveProposal(prop: Proposal): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${prop.treeId}/proposals`, prop.id), cleanForFirestore(prop), { merge: true });
    } catch (e) {
      console.error('Error saving proposal to Firestore:', e);
      throw e;
    }
  }

  // --- CHANGES ---
  static async getChanges(treeId: string): Promise<ChangeLog[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/changes`), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const list: ChangeLog[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as ChangeLog));
      return list;
    } catch (e) {
      console.error('Error fetching changes from Firestore:', e);
      return [];
    }
  }

  static async logChange(change: ChangeLog): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${change.treeId}/changes`, change.id), cleanForFirestore(change));
    } catch (e) {
      console.error('Error logging change to Firestore:', e);
    }
  }

  // --- COMMENTS ---
  static async getComments(treeId: string): Promise<Comment[]> {
    try {
      const q = query(collection(db, `trees/${treeId}/comments`), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const list: Comment[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Comment));
      return list;
    } catch (e) {
      console.error('Error fetching comments from Firestore:', e);
      return [];
    }
  }

  static async addComment(comment: Comment): Promise<void> {
    try {
      await setDoc(doc(db, `trees/${comment.treeId}/comments`, comment.id), cleanForFirestore(comment));
    } catch (e) {
      console.error('Error adding comment to Firestore:', e);
    }
  }
}
