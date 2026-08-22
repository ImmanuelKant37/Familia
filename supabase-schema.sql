-- ==============================================================================
-- ESQUEMA SQL PARA ÁRBOL GENEALÓGICO FAMILIAR (SUPABASE POSTGRESQL)
-- Ejecuta este script completo en el SQL Editor de tu consola de Supabase.
-- ==============================================================================

-- 1. Habilitar extensión UUID
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
  privacy_preferences JSONB DEFAULT '{"hideEmailFromMembers": false, "allowPublicBranchContributions": true, "showLivingRecords": false}'::jsonb
);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
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
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 4. TABLA DE PERSONAS / MIEMBROS DEL ÁRBOL (people)
CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  maiden_name TEXT,
  nickname TEXT,
  gender TEXT DEFAULT 'unknown',
  is_living BOOLEAN DEFAULT true,
  bio TEXT,
  avatar_url TEXT,
  cause_of_death TEXT,
  resting_place TEXT,
  profession TEXT,
  contact_info JSONB,
  lineage_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attributes JSONB DEFAULT '[]'::jsonb,
  certainty TEXT DEFAULT 'confirmed',
  position JSONB DEFAULT '{"x": 400, "y": 300}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE RELACIONES FAMILIARES (relationships)
CREATE TABLE IF NOT EXISTS public.relationships (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person_a_id TEXT NOT NULL,
  person_b_id TEXT NOT NULL,
  type TEXT NOT NULL, -- parent_child, spouse, partner, adoptive_parent, foster_parent
  subtype TEXT,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  certainty TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE EVENTOS VITALES / HITOS (events)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person_id TEXT,
  person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  type TEXT NOT NULL, -- birth, death, marriage, migration, baptism, graduation, etc.
  date TEXT,
  place TEXT,
  description TEXT,
  is_historical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE ARCHIVOS MULTIMEDIA / FOTOS (media)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- photo, document, audio, video
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  tagged_person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  face_coordinates JSONB,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE FUENTES DOCUMENTALES (sources)
CREATE TABLE IF NOT EXISTS public.sources (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  repository TEXT,
  citation TEXT,
  document_url TEXT,
  certainty_level TEXT DEFAULT 'medium',
  notes TEXT,
  linked_person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  linked_event_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE SOLICITUDES DE ACCESO (requests)
CREATE TABLE IF NOT EXISTS public.access_requests (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  requester_id UUID,
  requester_name TEXT,
  requester_email TEXT,
  requested_role TEXT DEFAULT 'viewer',
  claimed_relative_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA DE PROPUESTAS DE CAMBIO (proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  proposed_by UUID,
  proposer_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  changes JSONB DEFAULT '[]'::jsonb,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA DE HISTORIAL DE CAMBIOS (changes)
CREATE TABLE IF NOT EXISTS public.changes (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  diff JSONB,
  author_id UUID,
  author_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLA DE COMENTARIOS HISTÓRICOS (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  author_id UUID,
  author_name TEXT NOT NULL,
  author_role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
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

-- 1. Reglas para users
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados"
  ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir a cada usuario actualizar su propio perfil"
  ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Permitir inserción de perfiles"
  ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. Reglas para trees (Acceso de propietario o miembro invitado)
CREATE POLICY "Lectura de arboles permitida para duenos, miembros o arboles publicos"
  ON public.trees FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() 
    OR visibility = 'public' 
    OR visibility = 'members'
    OR members @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
  );

CREATE POLICY "Creacion de arboles para usuarios autenticados"
  ON public.trees FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Modificacion de arboles solo para el dueno"
  ON public.trees FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Eliminacion de arboles solo para el dueno"
  ON public.trees FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- 3. Reglas para personas (people)
CREATE POLICY "Acceso a personas de arboles autorizados"
  ON public.people FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.people.tree_id 
      AND (
        public.trees.owner_id = auth.uid() 
        OR public.trees.visibility = 'public' 
        OR public.trees.members @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
      )
    )
  );

-- 4. Reglas para relationships
CREATE POLICY "Acceso a relaciones de arboles autorizados"
  ON public.relationships FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.relationships.tree_id 
      AND (
        public.trees.owner_id = auth.uid() 
        OR public.trees.visibility = 'public' 
        OR public.trees.members @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
      )
    )
  );

-- 5. Reglas para events, media, sources, etc.
CREATE POLICY "Acceso a eventos de arboles autorizados"
  ON public.events FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.events.tree_id 
      AND (public.trees.owner_id = auth.uid() OR public.trees.visibility = 'public')
    )
  );

CREATE POLICY "Acceso a multimedia de arboles autorizados"
  ON public.media FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.media.tree_id 
      AND (public.trees.owner_id = auth.uid() OR public.trees.visibility = 'public')
    )
  );

CREATE POLICY "Acceso a fuentes de arboles autorizados"
  ON public.sources FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.sources.tree_id 
      AND (public.trees.owner_id = auth.uid() OR public.trees.visibility = 'public')
    )
  );

CREATE POLICY "Acceso a comentarios de arboles autorizados"
  ON public.comments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.comments.tree_id 
      AND (public.trees.owner_id = auth.uid() OR public.trees.visibility = 'public')
    )
  );

CREATE POLICY "Acceso a cambios de arboles autorizados"
  ON public.changes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trees 
      WHERE public.trees.id = public.changes.tree_id 
      AND (public.trees.owner_id = auth.uid() OR public.trees.visibility = 'public')
    )
  );
