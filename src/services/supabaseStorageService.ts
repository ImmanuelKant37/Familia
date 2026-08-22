import { supabase, SUPABASE_URL } from '../supabase/client';

export interface StorageUploadResult {
  publicUrl: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  error?: string | null;
  bucket: string;
  isFallbackDataUrl?: boolean;
}

export interface StorageBucketStatus {
  bucketName: string;
  exists: boolean;
  isPublic: boolean;
  error?: string | null;
}

const PRIMARY_BUCKET = 'genealogy-media';
const AVATARS_BUCKET = 'avatars';
const DOCUMENTS_BUCKET = 'documents';

/**
 * Clean and normalize file name for storage
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
}

/**
 * Convert file to base64 DataURL as a resilient fallback
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export class SupabaseStorageService {
  /**
   * Uploads a person portrait/avatar image to Supabase Storage
   */
  static async uploadPersonAvatar(
    file: File, 
    personId: string = 'new', 
    treeId: string = 'tree'
  ): Promise<StorageUploadResult> {
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanExt = ext.toLowerCase();
    const uniqueId = Date.now().toString(36);
    const filePath = `avatars/${treeId}/${personId}_${uniqueId}.${cleanExt}`;

    return this.uploadFile(file, filePath, [PRIMARY_BUCKET, AVATARS_BUCKET, 'family-media']);
  }

  /**
   * Uploads a gallery photo or media item to Supabase Storage
   */
  static async uploadGalleryMedia(
    file: File, 
    options: { treeId?: string; folder?: string; title?: string } = {}
  ): Promise<StorageUploadResult> {
    const { treeId = 'default_tree', folder = 'gallery' } = options;
    const cleanName = sanitizeFileName(file.name);
    const uniqueId = Date.now().toString(36);
    const filePath = `${folder}/${treeId}/${uniqueId}_${cleanName}`;

    return this.uploadFile(file, filePath, [PRIMARY_BUCKET, 'family-media', 'photos']);
  }

  /**
   * Uploads a historical document, certificate, baptism act, or PDF to Supabase Storage
   */
  static async uploadHistoricalDocument(
    file: File, 
    options: { treeId?: string; sourceId?: string } = {}
  ): Promise<StorageUploadResult> {
    const { treeId = 'default_tree', sourceId = 'source' } = options;
    const cleanName = sanitizeFileName(file.name);
    const uniqueId = Date.now().toString(36);
    const filePath = `documents/${treeId}/${sourceId}_${uniqueId}_${cleanName}`;

    return this.uploadFile(file, filePath, [PRIMARY_BUCKET, DOCUMENTS_BUCKET, 'family-media']);
  }

  /**
   * Generic uploader with multi-bucket fallback and base64 resilience
   */
  static async uploadFile(
    file: File, 
    filePath: string, 
    preferredBuckets: string[] = [PRIMARY_BUCKET, 'family-media', 'avatars', 'documents']
  ): Promise<StorageUploadResult> {
    const fileSize = file.size;
    const mimeType = file.type || 'application/octet-stream';

    // Try each bucket in order
    for (const bucketName of preferredBuckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: mimeType
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path || filePath);

          const publicUrl = publicUrlData?.publicUrl || '';
          return {
            publicUrl,
            filePath: data.path || filePath,
            fileSize,
            mimeType,
            bucket: bucketName,
            error: null
          };
        } else if (error) {
          console.warn(`Supabase Storage upload warning in bucket "${bucketName}":`, error.message);
        }
      } catch (err: any) {
        console.warn(`Upload attempt failed in bucket "${bucketName}":`, err?.message || err);
      }
    }

    // If storage buckets have not been created in Supabase yet, fallback gracefully to DataURL
    // so the user experience doesn't break, while warning them to run the SQL script
    try {
      const fallbackUrl = await fileToDataUrl(file);
      return {
        publicUrl: fallbackUrl,
        filePath: `local_fallback/${file.name}`,
        fileSize,
        mimeType,
        bucket: 'local-fallback',
        isFallbackDataUrl: true,
        error: 'Bucket de Supabase no encontrado o sin permisos RLS. Se guardó localmente como DataURL. Ejecuta el script SQL para habilitar Supabase Storage nativo.'
      };
    } catch (e: any) {
      return {
        publicUrl: '',
        filePath: '',
        fileSize,
        mimeType,
        bucket: 'error',
        error: e.message || 'Error al procesar archivo'
      };
    }
  }

  /**
   * Diagnostics: Test bucket connection and check permissions
   */
  static async testStorageConnection(): Promise<{
    success: boolean;
    buckets: StorageBucketStatus[];
    supabaseUrl: string;
    message: string;
  }> {
    const testedBuckets = [PRIMARY_BUCKET, AVATARS_BUCKET, DOCUMENTS_BUCKET, 'family-media'];
    const results: StorageBucketStatus[] = [];

    try {
      const { data: bucketsList, error } = await supabase.storage.listBuckets();
      
      if (error) {
        return {
          success: false,
          buckets: testedBuckets.map(b => ({
            bucketName: b,
            exists: false,
            isPublic: false,
            error: error.message
          })),
          supabaseUrl: SUPABASE_URL,
          message: `Error al conectar con Supabase Storage: ${error.message}. Asegúrate de ejecutar los scripts SQL en tu consola Supabase.`
        };
      }

      const existingNames = (bucketsList || []).map(b => b.name);

      for (const bName of testedBuckets) {
        const found = (bucketsList || []).find(b => b.name === bName);
        results.push({
          bucketName: bName,
          exists: Boolean(found),
          isPublic: found ? Boolean(found.public) : false,
          error: found ? null : 'Bucket no creado aún en Supabase'
        });
      }

      const hasAnyBucket = results.some(r => r.exists);

      return {
        success: hasAnyBucket,
        buckets: results,
        supabaseUrl: SUPABASE_URL,
        message: hasAnyBucket 
          ? '¡Conexión a Supabase Storage establecida correctamente!' 
          : 'Se conectó a Supabase pero los buckets aún no existen. Ejecuta el script SQL en el Editor SQL de Supabase.'
      };
    } catch (err: any) {
      return {
        success: false,
        buckets: testedBuckets.map(b => ({
          bucketName: b,
          exists: false,
          isPublic: false,
          error: err?.message || 'Error de red'
        })),
        supabaseUrl: SUPABASE_URL,
        message: `No se pudo conectar a Supabase Storage: ${err?.message || 'Error de red'}`
      };
    }
  }

  /**
   * Returns SQL Script for creating Storage Buckets and RLS Security Policies
   */
  static getStorageSqlScript(): string {
    return `-- ==========================================================
-- SCRIPT SQL: CONFIGURACIÓN DE SUPABASE STORAGE
-- ÁRBOL GENEALÓGICO & ARCHIVO HISTÓRICO
-- ==========================================================

-- 1. Crear el bucket principal 'genealogy-media' (Público para lectura)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'genealogy-media', 
  'genealogy-media', 
  true, 
  52428800, -- Límite de 50MB por archivo
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 52428800;

-- 2. Crear bucket secundario 'avatars' para fotos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 10485760;

-- 3. Crear bucket 'documents' para actas y certificados históricos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, 
  52428800, -- 50MB
  ARRAY[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 52428800;

-- 4. Habilitar RLS en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas previas para evitar duplicados
DROP POLICY IF EXISTS "Lectura pública de archivos genealógicos" ON storage.objects;
DROP POLICY IF EXISTS "Subida pública y autenticada de archivos" ON storage.objects;
DROP POLICY IF EXISTS "Actualización de archivos genealógicos" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación de archivos genealógicos" ON storage.objects;

-- 6. Política 1: PERMITIR LECTURA PÚBLICA (Cualquiera puede ver fotos y documentos)
CREATE POLICY "Lectura pública de archivos genealógicos"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('genealogy-media', 'avatars', 'documents', 'family-media')
);

-- 7. Política 2: PERMITIR SUBIDA (INSERT)
CREATE POLICY "Subida pública y autenticada de archivos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('genealogy-media', 'avatars', 'documents', 'family-media')
);

-- 8. Política 3: PERMITIR ACTUALIZACIÓN (UPDATE)
CREATE POLICY "Actualización de archivos genealógicos"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('genealogy-media', 'avatars', 'documents', 'family-media')
);

-- 9. Política 4: PERMITIR ELIMINACIÓN (DELETE)
CREATE POLICY "Eliminación de archivos genealógicos"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('genealogy-media', 'avatars', 'documents', 'family-media')
);
`;
  }

  /**
   * Returns Complete SQL Database Schema DDL
   */
  static getFullDatabaseSqlScript(): string {
    return `-- ==========================================================
-- SCRIPT SQL: ESQUEMA COMPLETO DE TABLAS EN SUPABASE
-- ÁRBOL GENEALÓGICO, ARCHIVOS, LOBBY Y COLABORACIÓN
-- ==========================================================

-- 1. Tabla de Árboles (trees)
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
  settings JSONB DEFAULT '{}'::jsonb,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Personas / Familiares (people)
CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
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
  is_living BOOLEAN DEFAULT false,
  bio TEXT,
  profession TEXT,
  nationality TEXT,
  avatar_url TEXT, -- Almacena la URL de Supabase Storage
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

-- 3. Tabla de Relaciones Familiares (relationships)
CREATE TABLE IF NOT EXISTS public.relationships (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person1_id TEXT NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  person2_id TEXT NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- parent, spouse, partner, sibling, adopted, etc.
  custom_type_label TEXT,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  certainty TEXT DEFAULT 'confirmed',
  source_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Eventos Históricos / Hitos (events)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  person_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  type TEXT NOT NULL, -- birth, marriage, death, immigration, baptism, graduation, etc.
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

-- 5. Tabla de Galería de Medios y Archivos (media)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- URL pública de Supabase Storage
  type TEXT NOT NULL, -- photo, document, certificate, audio, video
  title TEXT NOT NULL,
  description TEXT,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by TEXT DEFAULT 'usuario',
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

-- 6. Tabla de Fuentes Históricas & Actas (sources)
CREATE TABLE IF NOT EXISTS public.sources (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'document', -- book, document, certificate, census, archive, interview
  repository TEXT,
  url TEXT, -- Puede apuntar a un PDF en Supabase Storage o archivo externo
  citation TEXT,
  confidence TEXT DEFAULT 'confirmed',
  notes TEXT,
  media_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Solicitudes de Acceso (access_requests)
CREATE TABLE IF NOT EXISTS public.access_requests (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  user_photo TEXT,
  message TEXT,
  family_relation TEXT,
  contribution_intent TEXT,
  requested_role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Propuestas de Corrección (proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- person, relationship, event, etc.
  target_id TEXT NOT NULL,
  target_name TEXT,
  field_changed TEXT NOT NULL,
  current_value TEXT,
  proposed_value TEXT,
  proposed_by TEXT NOT NULL,
  proposed_by_name TEXT,
  source_note TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Registro de Cambios / Auditoría (changes)
CREATE TABLE IF NOT EXISTS public.changes (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL, -- create, update, delete, merge, restore
  summary TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_photo TEXT,
  previous_snapshot JSONB,
  new_snapshot JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabla de Comentarios Familiares (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- person, event, media, tree
  target_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_photo TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_people_tree_id ON public.people(tree_id);
CREATE INDEX IF NOT EXISTS idx_people_last_name ON public.people(last_name);
CREATE INDEX IF NOT EXISTS idx_relationships_tree_id ON public.relationships(tree_id);
CREATE INDEX IF NOT EXISTS idx_relationships_p1_p2 ON public.relationships(person1_id, person2_id);
CREATE INDEX IF NOT EXISTS idx_media_tree_id ON public.media(tree_id);
CREATE INDEX IF NOT EXISTS idx_sources_tree_id ON public.sources(tree_id);
CREATE INDEX IF NOT EXISTS idx_changes_tree_timestamp ON public.changes(tree_id, timestamp DESC);

-- Habilitar RLS en tablas públicas para seguridad
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

-- Políticas de acceso permisivo para la app
CREATE POLICY "Permitir todo a trees" ON public.trees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a people" ON public.people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a relationships" ON public.relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a media" ON public.media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a sources" ON public.sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a access_requests" ON public.access_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a proposals" ON public.proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a changes" ON public.changes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
`;
  }
}
