import { supabase } from '../supabase/client';
import { 
  Tree, 
  Person, 
  Relationship, 
  FamilyEvent, 
  MediaItem, 
  HistoricalSource, 
  AccessRequest, 
  Proposal, 
  ChangeLog, 
  Comment 
} from '../types';
import { 
  SEED_TREE, 
  SEED_PEOPLE, 
  SEED_RELATIONSHIPS, 
  SEED_EVENTS, 
  SEED_MEDIA, 
  SEED_SOURCES, 
  SEED_REQUESTS, 
  SEED_PROPOSALS, 
  SEED_CHANGES, 
  SEED_COMMENTS 
} from '../data/seedData';

// Helper to remove undefined fields before Supabase upsert/insert
function cleanForSupabase(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForSupabase);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForSupabase(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export class SupabaseTreeService {
  /**
   * Initializes a personalized, clean tree for a new Supabase user starting with their own record.
   */
  static async initializeUserTree(userId: string, displayName?: string, email?: string): Promise<Tree> {
    const cleanName = displayName?.trim() || 'Familiar';
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || 'Investigador';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Familiar';

    const treeId = `tree-${userId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}-${Date.now().toString(36)}`;
    const newTree: Tree = {
      id: treeId,
      ownerId: userId,
      ownerName: cleanName,
      ownerEmail: email || '',
      name: lastName !== 'Familiar' ? `Familia ${lastName}` : `Árbol de ${firstName}`,
      description: `Árbol genealógico y archivo histórico de la familia ${lastName !== 'Familiar' ? lastName : firstName}`,
      coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
      visibility: 'private',
      settings: {
        hideLivingDetails: true,
        livingAgeThreshold: 100,
        defaultRoleForInvites: 'collaborator',
        allowPublicRequests: true,
        requireProposalApproval: true,
        showCommentsToPublic: true,
        surnameStyles: {}
      },
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Insert tree record
      const { error: treeError } = await supabase.from('trees').upsert(cleanForSupabase({
        id: treeId,
        owner_id: userId,
        owner_name: cleanName,
        owner_email: email || '',
        name: newTree.name,
        description: newTree.description,
        cover_image: newTree.coverImage,
        visibility: newTree.visibility,
        settings: newTree.settings,
        members: newTree.members || [],
        created_at: newTree.createdAt,
        updated_at: newTree.updatedAt
      }));

      if (treeError) {
        console.warn('Supabase tree insertion notice:', treeError.message);
      }

      // 2. Create initial root person for the user
      const rootPerson: Person = {
        id: `p-${Date.now()}-root`,
        treeId: treeId,
        firstName: firstName,
        lastName: lastName !== 'Familiar' ? lastName : '',
        gender: 'unknown',
        isLiving: true,
        bio: `Registro raíz del árbol familiar de ${cleanName}. Haz clic en los botones (+) para añadir a tus padres, cónyuge, hermanos e hijos.`,
        certainty: 'confirmed',
        position: { x: 400, y: 300 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await supabase.from('people').upsert(cleanForSupabase({
        id: rootPerson.id,
        tree_id: treeId,
        first_name: rootPerson.firstName,
        last_name: rootPerson.lastName,
        gender: rootPerson.gender,
        is_living: rootPerson.isLiving,
        bio: rootPerson.bio,
        certainty: rootPerson.certainty,
        position: rootPerson.position,
        created_at: rootPerson.createdAt,
        updated_at: rootPerson.updatedAt
      }));

      return newTree;
    } catch (err) {
      console.error('Error initializing clean tree in Supabase:', err);
      return newTree;
    }
  }

  /**
   * Initializes the full Macondo Demo Tree only when explicitly requested
   */
  static async loadDemoTree(userId: string, customName?: string): Promise<Tree> {
    const treeId = `tree-demo-${Date.now().toString(36)}`;
    const demoTree: Tree = {
      ...SEED_TREE,
      id: treeId,
      ownerId: userId,
      name: customName || 'Familia Buendía (Ejemplo)',
      description: 'Árbol genealógico de demostración para explorar funcionalidades',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await supabase.from('trees').upsert(cleanForSupabase({
        id: treeId,
        owner_id: userId,
        owner_name: demoTree.ownerName,
        owner_email: demoTree.ownerEmail,
        name: demoTree.name,
        description: demoTree.description,
        cover_image: demoTree.coverImage,
        visibility: demoTree.visibility,
        settings: demoTree.settings,
        members: demoTree.members || [],
        created_at: demoTree.createdAt,
        updated_at: demoTree.updatedAt
      }));

      // Insert demo people
      const peoplePayload = SEED_PEOPLE.map(p => cleanForSupabase({
        id: p.id,
        tree_id: treeId,
        first_name: p.firstName,
        last_name: p.lastName,
        maiden_name: p.maidenName,
        gender: p.gender,
        birth_date: p.birthDate,
        birth_place: p.birthPlace,
        death_date: p.deathDate,
        death_place: p.deathPlace,
        is_living: p.isLiving,
        bio: p.bio,
        avatar_url: p.avatarUrl,
        profession: p.profession,
        certainty: p.certainty,
        position: p.position,
        created_at: p.createdAt,
        updated_at: p.updatedAt
      }));
      await supabase.from('people').upsert(peoplePayload);

      // Insert demo relationships
      const relsPayload = SEED_RELATIONSHIPS.map(r => cleanForSupabase({
        id: r.id,
        tree_id: treeId,
        person1_id: r.person1Id,
        person2_id: r.person2Id,
        type: r.type,
        custom_type_label: r.customTypeLabel,
        start_date: r.startDate,
        end_date: r.endDate,
        notes: r.notes,
        certainty: r.certainty,
        created_at: r.createdAt
      }));
      await supabase.from('relationships').upsert(relsPayload);

      // Insert demo events
      const eventsPayload = SEED_EVENTS.map(e => cleanForSupabase({
        id: e.id,
        tree_id: treeId,
        title: e.title,
        person_ids: e.personIds,
        type: e.type,
        date: e.date,
        place: e.place,
        description: e.description,
        created_at: e.createdAt
      }));
      await supabase.from('events').upsert(eventsPayload);

      return demoTree;
    } catch (err) {
      console.error('Error loading demo tree into Supabase:', err);
      return demoTree;
    }
  }

  /**
   * Fetches trees from Supabase owned by or shared with the user
   */
  static async getTrees(userId: string, userEmail?: string, displayName?: string): Promise<Tree[]> {
    try {
      const cleanEmail = (userEmail || '').trim().toLowerCase();

      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query notice:', error.message);
      }

      if (data && data.length > 0) {
        const mappedList: Tree[] = data.map((d: any) => ({
          id: d.id,
          ownerId: d.owner_id,
          ownerName: d.owner_name,
          ownerEmail: d.owner_email,
          name: d.name,
          description: d.description,
          coverImage: d.cover_image,
          visibility: d.visibility || 'private',
          slug: d.slug,
          settings: d.settings || {},
          members: d.members || [],
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));

        // Filter strictly for this user
        const userTrees = mappedList.filter(t => {
          const isOwner = t.ownerId === userId || (cleanEmail && t.ownerEmail?.toLowerCase() === cleanEmail);
          const isMember = Array.isArray(t.members) && t.members.some((m: any) => 
            (m.userId && m.userId === userId) || (cleanEmail && m.email && m.email.toLowerCase() === cleanEmail)
          );
          return isOwner || isMember;
        });

        if (userTrees.length > 0) {
          return userTrees;
        }
      }

      // If user is guest/anonymous
      if (userId.startsWith('guest_') || userId === 'guest') {
        const guestTree: Tree = {
          ...SEED_TREE,
          id: `tree-guest-${Date.now().toString(36)}`,
          ownerId: userId,
          name: 'Mi Árbol Familiar (Invitado)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [guestTree];
      }

      // If registered user has no trees yet, create a fresh private tree for them
      const initialTree = await SupabaseTreeService.initializeUserTree(userId, displayName, cleanEmail);
      return [initialTree];
    } catch (e) {
      console.error('Error fetching trees from Supabase:', e);
      return [];
    }
  }

  static async getTreeById(treeId: string): Promise<Tree | null> {
    try {
      const { data, error } = await supabase.from('trees').select('*').eq('id', treeId).single();
      if (data && !error) {
        return {
          id: data.id,
          ownerId: data.owner_id,
          ownerName: data.owner_name,
          ownerEmail: data.owner_email,
          name: data.name,
          description: data.description,
          coverImage: data.cover_image,
          visibility: data.visibility,
          slug: data.slug,
          settings: data.settings || {},
          members: data.members || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (e) {
      console.error('Failed to fetch tree by ID from Supabase:', e);
    }
    return null;
  }

  static async saveTree(tree: Tree): Promise<void> {
    try {
      await supabase.from('trees').upsert(cleanForSupabase({
        id: tree.id,
        owner_id: tree.ownerId,
        owner_name: tree.ownerName,
        owner_email: tree.ownerEmail,
        name: tree.name,
        description: tree.description,
        cover_image: tree.coverImage,
        visibility: tree.visibility,
        slug: tree.slug,
        settings: tree.settings,
        members: tree.members || [],
        updated_at: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving tree to Supabase:', e);
      throw e;
    }
  }

  static async deleteTree(treeId: string): Promise<void> {
    try {
      await supabase.from('trees').delete().eq('id', treeId);
    } catch (e) {
      console.error('Error deleting tree from Supabase:', e);
      throw e;
    }
  }

  // --- PEOPLE ---
  static async getPeople(treeId: string): Promise<Person[]> {
    try {
      const { data, error } = await supabase.from('people').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        firstName: d.first_name,
        middleName: d.middle_name,
        lastName: d.last_name || '',
        maidenName: d.maiden_name,
        gender: d.gender || 'unknown',
        birthDate: d.birth_date,
        birthDateApprox: d.birth_date_approx,
        birthPlace: d.birth_place,
        birthCoordinates: d.birth_coordinates,
        deathDate: d.death_date,
        deathDateApprox: d.death_date_approx,
        deathPlace: d.death_place,
        deathCoordinates: d.death_coordinates,
        isLiving: d.is_living,
        bio: d.bio,
        profession: d.profession,
        nationality: d.nationality,
        avatarUrl: d.avatar_url,
        aliases: d.aliases || [],
        notes: d.notes,
        tags: d.tags || [],
        certainty: d.certainty || 'confirmed',
        sourceIds: d.source_ids || [],
        isPrivate: d.is_private,
        position: d.position || { x: 400, y: 300 },
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
    } catch (e) {
      console.error('Error fetching people from Supabase:', e);
      return [];
    }
  }

  static async savePerson(person: Person): Promise<void> {
    try {
      await supabase.from('people').upsert(cleanForSupabase({
        id: person.id,
        tree_id: person.treeId,
        first_name: person.firstName,
        middle_name: person.middleName,
        last_name: person.lastName,
        maiden_name: person.maidenName,
        gender: person.gender,
        birth_date: person.birthDate,
        birth_date_approx: person.birthDateApprox,
        birth_place: person.birthPlace,
        birth_coordinates: person.birthCoordinates,
        death_date: person.deathDate,
        death_date_approx: person.deathDateApprox,
        death_place: person.deathPlace,
        death_coordinates: person.deathCoordinates,
        is_living: person.isLiving,
        bio: person.bio,
        profession: person.profession,
        nationality: person.nationality,
        avatar_url: person.avatarUrl,
        aliases: person.aliases,
        notes: person.notes,
        tags: person.tags,
        certainty: person.certainty,
        source_ids: person.sourceIds,
        is_private: person.isPrivate,
        position: person.position,
        updated_at: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving person to Supabase:', e);
      throw e;
    }
  }

  static async bulkSavePeople(treeId: string, peopleList: Person[]): Promise<void> {
    try {
      const payload = peopleList.map(p => cleanForSupabase({
        id: p.id,
        tree_id: treeId,
        first_name: p.firstName,
        middle_name: p.middleName,
        last_name: p.lastName,
        maiden_name: p.maidenName,
        gender: p.gender,
        birth_date: p.birthDate,
        birth_date_approx: p.birthDateApprox,
        birth_place: p.birthPlace,
        birth_coordinates: p.birthCoordinates,
        death_date: p.deathDate,
        death_date_approx: p.deathDateApprox,
        death_place: p.deathPlace,
        death_coordinates: p.deathCoordinates,
        is_living: p.isLiving,
        bio: p.bio,
        profession: p.profession,
        nationality: p.nationality,
        avatar_url: p.avatarUrl,
        aliases: p.aliases,
        notes: p.notes,
        tags: p.tags,
        certainty: p.certainty,
        source_ids: p.sourceIds,
        is_private: p.isPrivate,
        position: p.position,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('people').upsert(payload);
    } catch (e) {
      console.error('Error bulk saving people to Supabase:', e);
      throw e;
    }
  }

  static async deletePerson(treeId: string, personId: string): Promise<void> {
    try {
      await supabase.from('people').delete().eq('id', personId).eq('tree_id', treeId);
    } catch (e) {
      console.error('Error deleting person from Supabase:', e);
      throw e;
    }
  }

  // --- RELATIONSHIPS ---
  static async getRelationships(treeId: string): Promise<Relationship[]> {
    try {
      const { data, error } = await supabase.from('relationships').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        person1Id: d.person1_id,
        person2Id: d.person2_id,
        type: d.type,
        customTypeLabel: d.custom_type_label,
        startDate: d.start_date,
        endDate: d.end_date,
        notes: d.notes,
        certainty: d.certainty || 'confirmed',
        sourceIds: d.source_ids || [],
        createdAt: d.created_at
      }));
    } catch (e) {
      console.error('Error fetching relationships from Supabase:', e);
      return [];
    }
  }

  static async saveRelationship(rel: Relationship): Promise<void> {
    try {
      await supabase.from('relationships').upsert(cleanForSupabase({
        id: rel.id,
        tree_id: rel.treeId,
        person1_id: rel.person1Id,
        person2_id: rel.person2Id,
        type: rel.type,
        custom_type_label: rel.customTypeLabel,
        start_date: rel.startDate,
        end_date: rel.endDate,
        notes: rel.notes,
        certainty: rel.certainty,
        source_ids: rel.sourceIds
      }));
    } catch (e) {
      console.error('Error saving relationship to Supabase:', e);
      throw e;
    }
  }

  static async bulkSaveRelationships(treeId: string, relsList: Relationship[]): Promise<void> {
    try {
      const payload = relsList.map(r => cleanForSupabase({
        id: r.id,
        tree_id: treeId,
        person1_id: r.person1Id,
        person2_id: r.person2Id,
        type: r.type,
        custom_type_label: r.customTypeLabel,
        start_date: r.startDate,
        end_date: r.endDate,
        notes: r.notes,
        certainty: r.certainty,
        source_ids: r.sourceIds
      }));
      await supabase.from('relationships').upsert(payload);
    } catch (e) {
      console.error('Error bulk saving relationships to Supabase:', e);
      throw e;
    }
  }

  static async deleteRelationship(treeId: string, relId: string): Promise<void> {
    try {
      await supabase.from('relationships').delete().eq('id', relId).eq('tree_id', treeId);
    } catch (e) {
      console.error('Error deleting relationship from Supabase:', e);
      throw e;
    }
  }

  // --- EVENTS ---
  static async getEvents(treeId: string): Promise<FamilyEvent[]> {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        title: d.title || 'Evento Familiar',
        personIds: d.person_ids || [],
        type: d.type,
        date: d.date,
        dateApprox: d.date_approx,
        place: d.place,
        coordinates: d.coordinates,
        description: d.description,
        mediaIds: d.media_ids || [],
        sourceIds: d.source_ids || [],
        certainty: d.certainty || 'confirmed',
        createdAt: d.created_at
      }));
    } catch (e) {
      console.error('Error fetching events from Supabase:', e);
      return [];
    }
  }

  static async saveEvent(event: FamilyEvent): Promise<void> {
    try {
      await supabase.from('events').upsert(cleanForSupabase({
        id: event.id,
        tree_id: event.treeId,
        title: event.title,
        person_ids: event.personIds || [],
        type: event.type,
        date: event.date,
        date_approx: event.dateApprox,
        place: event.place,
        coordinates: event.coordinates,
        description: event.description,
        media_ids: event.mediaIds || [],
        source_ids: event.sourceIds || [],
        certainty: event.certainty
      }));
    } catch (e) {
      console.error('Error saving event to Supabase:', e);
      throw e;
    }
  }

  static async deleteEvent(treeId: string, eventId: string): Promise<void> {
    try {
      await supabase.from('events').delete().eq('id', eventId).eq('tree_id', treeId);
    } catch (e) {
      console.error('Error deleting event from Supabase:', e);
      throw e;
    }
  }

  // --- MEDIA ---
  static async getMedia(treeId: string): Promise<MediaItem[]> {
    try {
      const { data, error } = await supabase.from('media').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        url: d.url,
        type: d.type,
        title: d.title,
        description: d.description,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        uploadedBy: d.uploaded_by || 'usuario',
        uploadedByName: d.uploaded_by_name,
        relatedPersonIds: d.related_person_ids || [],
        relatedEventId: d.related_event_id,
        historicalDate: d.historical_date,
        historicalPlace: d.historical_place,
        sourceId: d.source_id,
        visibility: d.visibility || 'members',
        tags: d.tags || [],
        createdAt: d.created_at
      }));
    } catch (e) {
      console.error('Error fetching media from Supabase:', e);
      return [];
    }
  }

  static async saveMedia(item: MediaItem): Promise<void> {
    try {
      await supabase.from('media').upsert(cleanForSupabase({
        id: item.id,
        tree_id: item.treeId,
        url: item.url,
        type: item.type,
        title: item.title,
        description: item.description,
        file_size: item.fileSize,
        mime_type: item.mimeType,
        uploaded_by: item.uploadedBy,
        uploaded_by_name: item.uploadedByName,
        related_person_ids: item.relatedPersonIds || [],
        related_event_id: item.relatedEventId,
        historical_date: item.historicalDate,
        historical_place: item.historicalPlace,
        source_id: item.sourceId,
        visibility: item.visibility,
        tags: item.tags || []
      }));
    } catch (e) {
      console.error('Error saving media to Supabase:', e);
      throw e;
    }
  }

  static async deleteMedia(treeId: string, mediaId: string): Promise<void> {
    try {
      await supabase.from('media').delete().eq('id', mediaId).eq('tree_id', treeId);
    } catch (e) {
      console.error('Error deleting media from Supabase:', e);
      throw e;
    }
  }

  // --- SOURCES ---
  static async getSources(treeId: string): Promise<HistoricalSource[]> {
    try {
      const { data, error } = await supabase.from('sources').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        title: d.title,
        type: d.type || 'document',
        repository: d.repository,
        url: d.url,
        citation: d.citation,
        confidence: d.confidence || 'confirmed',
        notes: d.notes,
        mediaId: d.media_id,
        createdAt: d.created_at,
        createdBy: d.created_by
      }));
    } catch (e) {
      console.error('Error fetching sources from Supabase:', e);
      return [];
    }
  }

  static async saveSource(source: HistoricalSource): Promise<void> {
    try {
      await supabase.from('sources').upsert(cleanForSupabase({
        id: source.id,
        tree_id: source.treeId,
        title: source.title,
        type: source.type,
        repository: source.repository,
        url: source.url,
        citation: source.citation,
        confidence: source.confidence,
        notes: source.notes,
        media_id: source.mediaId,
        created_by: source.createdBy
      }));
    } catch (e) {
      console.error('Error saving source to Supabase:', e);
      throw e;
    }
  }

  static async deleteSource(treeId: string, sourceId: string): Promise<void> {
    try {
      await supabase.from('sources').delete().eq('id', sourceId).eq('tree_id', treeId);
    } catch (e) {
      console.error('Error deleting source from Supabase:', e);
      throw e;
    }
  }

  // --- REQUESTS ---
  static async getRequests(treeId: string): Promise<AccessRequest[]> {
    try {
      const { data, error } = await supabase.from('access_requests').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        userId: d.user_id,
        userName: d.user_name || 'Solicitante',
        userEmail: d.user_email || '',
        userPhoto: d.user_photo,
        message: d.message || '',
        familyRelation: d.family_relation || '',
        contributionIntent: d.contribution_intent || '',
        requestedRole: d.requested_role || 'viewer',
        status: d.status || 'pending',
        createdAt: d.created_at,
        reviewedAt: d.reviewed_at,
        reviewedBy: d.reviewed_by
      }));
    } catch (e) {
      return [];
    }
  }

  static async saveRequest(req: AccessRequest): Promise<void> {
    try {
      await supabase.from('access_requests').upsert(cleanForSupabase({
        id: req.id,
        tree_id: req.treeId,
        user_id: req.userId,
        user_name: req.userName,
        user_email: req.userEmail,
        user_photo: req.userPhoto,
        message: req.message,
        family_relation: req.familyRelation,
        contribution_intent: req.contributionIntent,
        requested_role: req.requestedRole,
        status: req.status,
        reviewed_by: req.reviewedBy,
        reviewed_at: req.reviewedAt
      }));
    } catch (e) {
      console.error('Error saving request to Supabase:', e);
    }
  }

  // --- PROPOSALS ---
  static async getProposals(treeId: string): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase.from('proposals').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        targetType: d.target_type,
        targetId: d.target_id,
        targetName: d.target_name,
        fieldChanged: d.field_changed,
        currentValue: d.current_value,
        proposedValue: d.proposed_value,
        proposedBy: d.proposed_by,
        proposedByName: d.proposed_by_name || 'Colaborador',
        sourceNote: d.source_note,
        reason: d.reason,
        status: d.status,
        createdAt: d.created_at,
        reviewedAt: d.reviewed_at,
        reviewedBy: d.reviewed_by
      }));
    } catch (e) {
      return [];
    }
  }

  static async saveProposal(prop: Proposal): Promise<void> {
    try {
      await supabase.from('proposals').upsert(cleanForSupabase({
        id: prop.id,
        tree_id: prop.treeId,
        target_type: prop.targetType,
        target_id: prop.targetId,
        target_name: prop.targetName,
        field_changed: prop.fieldChanged,
        current_value: prop.currentValue,
        proposed_value: prop.proposedValue,
        proposed_by: prop.proposedBy,
        proposed_by_name: prop.proposedByName,
        source_note: prop.sourceNote,
        reason: prop.reason,
        status: prop.status,
        reviewed_by: prop.reviewedBy,
        reviewed_at: prop.reviewedAt
      }));
    } catch (e) {
      console.error('Error saving proposal to Supabase:', e);
    }
  }

  // --- CHANGES / LOGS ---
  static async getChanges(treeId: string): Promise<ChangeLog[]> {
    try {
      const { data, error } = await supabase.from('changes').select('*').eq('tree_id', treeId).order('timestamp', { ascending: false });
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        entityType: d.entity_type,
        entityId: d.entity_id,
        entityName: d.entity_name,
        action: d.action,
        summary: d.summary || '',
        userId: d.user_id,
        userName: d.user_name || 'Usuario',
        userPhoto: d.user_photo,
        timestamp: d.timestamp,
        previousSnapshot: d.previous_snapshot,
        newSnapshot: d.new_snapshot
      }));
    } catch (e) {
      return [];
    }
  }

  static async saveChange(change: ChangeLog): Promise<void> {
    try {
      await supabase.from('changes').upsert(cleanForSupabase({
        id: change.id,
        tree_id: change.treeId,
        entity_type: change.entityType,
        entity_id: change.entityId,
        entity_name: change.entityName,
        action: change.action,
        summary: change.summary,
        user_id: change.userId,
        user_name: change.userName,
        user_photo: change.userPhoto,
        timestamp: change.timestamp,
        previous_snapshot: change.previousSnapshot,
        new_snapshot: change.newSnapshot
      }));
    } catch (e) {
      console.error('Error logging change to Supabase:', e);
    }
  }

  static async logChange(change: ChangeLog): Promise<void> {
    return this.saveChange(change);
  }

  // --- COMMENTS ---
  static async getComments(treeId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase.from('comments').select('*').eq('tree_id', treeId);
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        treeId: d.tree_id,
        targetType: d.target_type || 'person',
        targetId: d.target_id,
        userId: d.user_id,
        userName: d.user_name || 'Usuario',
        userPhoto: d.user_photo,
        content: d.content,
        createdAt: d.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  static async saveComment(comment: Comment): Promise<void> {
    try {
      await supabase.from('comments').upsert(cleanForSupabase({
        id: comment.id,
        tree_id: comment.treeId,
        target_type: comment.targetType,
        target_id: comment.targetId,
        user_id: comment.userId,
        user_name: comment.userName,
        user_photo: comment.userPhoto,
        content: comment.content,
        created_at: comment.createdAt
      }));
    } catch (e) {
      console.error('Error saving comment to Supabase:', e);
    }
  }

  static async addComment(comment: Comment): Promise<void> {
    return this.saveComment(comment);
  }
}
