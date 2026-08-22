-- ==============================================================================
-- ESQUEMA SQL COMPLETO PARA ÁRBOL GENEALÓGICO FAMILIAR (SUPABASE POSTGRESQL)
-- Copia y pega este script en el SQL Editor de tu consola de Supabase y ejecútalo.
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  phone TEXT,
  bio TEXT,
  role TEXT DEFAULT 'owner',
  storage_mode TEXT DEFAULT 'cloud',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  privacy_preferences JSONB DEFAULT '{"hideEmailFromMembers": false, "notifyOnRequests": true, "notifyOnProposals": true}'::jsonb
);

-- Trigger para sincronizar automáticamente usuarios al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    photo_url = COALESCE(EXCLUDED.photo_url, public.users.photo_url),
    last_login_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABLA DE ÁRBOLES GENEALÓGICOS (trees)
CREATE TABLE IF NOT EXISTS public.trees (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  visibility TEXT DEFAULT 'private',
  slug TEXT,
  settings JSONB DEFAULT '{
    "hideLivingDetails": true,
    "livingAgeThreshold": 100,
    "defaultRoleForInvites": "collaborator",
    "allowPublicRequests": true,
    "requireProposalApproval": true,
    "showCommentsToPublic": true,
    "surnameStyles": {}
  }'::jsonb,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE PERSONAS / FAMILIARES (people)
CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT,
  maiden_name TEXT,
  gender TEXT DEFAULT 'unknown',
  birth_date TEXT,
  birth_date_approx TEXT,
  birth_place TEXT,
  birth_coordinates JSONB,
  death_date TEXT,
  death_date_approx TEXT,
  death_place TEXT,
  death_coordinates JSONB,
  is_living BOOLEAN DEFAULT true,
  bio TEXT,
  profession TEXT,
  nationality TEXT,
  avatar_url TEXT,
  aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  certainty TEXT DEFAULT 'confirmed',
  source_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_private BOOLEAN DEFAULT false,
  position JSONB DEFAULT '{"x": 400, "y": 300}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE RELACIONES FAMILIARES (relationships)
CREATE TABLE IF NOT EXISTS public.relationships (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person1_id TEXT NOT NULL,
  person2_id TEXT NOT NULL,
  type TEXT NOT NULL,
  custom_type_label TEXT,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  certainty TEXT DEFAULT 'confirmed',
  source_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE EVENTOS VITALES (events)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  type TEXT NOT NULL,
  date TEXT,
  date_approx TEXT,
  place TEXT,
  coordinates JSONB,
  description TEXT,
  media_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  source_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  certainty TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE MULTIMEDIA Y ARCHIVOS HISTÓRICOS (media)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_size NUMERIC,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_by_name TEXT,
  related_person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_event_id TEXT,
  historical_date TEXT,
  historical_place TEXT,
  source_id TEXT,
  visibility TEXT DEFAULT 'members',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE FUENTES DOCUMENTALES (sources)
CREATE TABLE IF NOT EXISTS public.sources (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'document',
  repository TEXT,
  url TEXT,
  citation TEXT,
  confidence TEXT DEFAULT 'confirmed',
  notes TEXT,
  media_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE SOLICITUDES DE ACCESO (access_requests)
CREATE TABLE IF NOT EXISTS public.access_requests (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  user_photo TEXT,
  message TEXT,
  family_relation TEXT,
  contribution_intent TEXT,
  requested_role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA DE PROPUESTAS DE COLABORACIÓN (proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT,
  field_changed TEXT,
  current_value JSONB,
  proposed_value JSONB,
  proposed_by TEXT,
  proposed_by_name TEXT,
  source_note TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA DE HISTORIAL DE CAMBIOS Y AUDITORÍA (changes)
CREATE TABLE IF NOT EXISTS public.changes (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL,
  summary TEXT,
  user_id TEXT,
  userName TEXT,
  user_name TEXT,
  user_photo TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  previous_snapshot JSONB,
  new_snapshot JSONB
);

-- 12. TABLA DE COMENTARIOS (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  target_type TEXT DEFAULT 'person',
  target_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  user_photo TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS BÁSICAS (Lectura y escritura para usuarios autenticados)
DROP POLICY IF EXISTS "allow_auth_users_all" ON public.users;
CREATE POLICY "allow_auth_users_all" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_users_read" ON public.users;
CREATE POLICY "allow_anon_users_read" ON public.users FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "allow_trees_auth" ON public.trees;
CREATE POLICY "allow_trees_auth" ON public.trees FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_trees_anon" ON public.trees;
CREATE POLICY "allow_trees_anon" ON public.trees FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "allow_people_all" ON public.people;
CREATE POLICY "allow_people_all" ON public.people FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_relationships_all" ON public.relationships;
CREATE POLICY "allow_relationships_all" ON public.relationships FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_events_all" ON public.events;
CREATE POLICY "allow_events_all" ON public.events FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_media_all" ON public.media;
CREATE POLICY "allow_media_all" ON public.media FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_sources_all" ON public.sources;
CREATE POLICY "allow_sources_all" ON public.sources FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_requests_all" ON public.access_requests;
CREATE POLICY "allow_requests_all" ON public.access_requests FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_proposals_all" ON public.proposals;
CREATE POLICY "allow_proposals_all" ON public.proposals FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_changes_all" ON public.changes;
CREATE POLICY "allow_changes_all" ON public.changes FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_comments_all" ON public.comments;
CREATE POLICY "allow_comments_all" ON public.comments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
