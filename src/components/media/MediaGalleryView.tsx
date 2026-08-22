import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, FileText, Upload, 
  Search, Calendar, MapPin, Tag, Plus, 
  Lock, Globe, Users, Download, X, MessageSquare, Trash2, Database, Sparkles
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { MediaItem, MediaType, MediaVisibility } from '../../types';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { SupabaseSqlModal } from '../supabase/SupabaseSqlModal';

interface MediaGalleryViewProps {
  onSelectPersonById: (personId: string) => void;
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({
  onSelectPersonById
}) => {
  const { media, people, addMedia, deleteMedia, comments, addComment, canEdit, activeTree } = useTree();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMediaModal, setActiveMediaModal] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<MediaType>('photo');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadPlace, setUploadPlace] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadPersonId, setUploadPersonId] = useState('');
  const [uploadTagsStr, setUploadTagsStr] = useState('');
  const [uploadVisibility, setUploadVisibility] = useState<MediaVisibility>('public');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    media.forEach(m => m.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [media]);

  // Filtered media
  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      const matchType = selectedType === 'all' || m.type === selectedType;
      const matchTag = selectedTag === 'all' || m.tags?.includes(selectedTag);
      const matchSearch = !searchQuery.trim() || 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.historicalPlace?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchTag && matchSearch;
    });
  }, [media, selectedType, selectedTag, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadUrl(event.target.result as string);
          if (!uploadTitle) {
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadUrl) return;

    const tags = uploadTagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    await addMedia({
      title: uploadTitle.trim(),
      type: uploadType,
      url: uploadUrl,
      historicalDate: uploadDate.trim() || undefined,
      historicalPlace: uploadPlace.trim() || undefined,
      description: uploadDesc.trim() || undefined,
      relatedPersonIds: uploadPersonId ? [uploadPersonId] : [],
      tags,
      visibility: uploadVisibility
    });

    setShowUploadModal(false);
    setUploadTitle('');
    setUploadUrl('');
    setUploadDate('');
    setUploadPlace('');
    setUploadDesc('');
    setUploadTagsStr('');
  };

  const handleAddMediaComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMediaModal || !commentText.trim()) return;
    await addComment('media', activeMediaModal.id, commentText);
    setCommentText('');
  };

  const mediaComments = activeMediaModal 
    ? comments.filter(c => c.targetType === 'media' && c.targetId === activeMediaModal.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#FDFBF7] dark:bg-[#1E293B] p-5 rounded-3xl border border-[#D1CEC7] dark:border-[#334155] shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#434331] dark:text-[#F1F5F9]">
            Galería & Archivo Histórico
          </h2>
          <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] mt-1 font-serif italic">
            Preservación de fotografías antiguas, actas parroquiales, cartas y testimonios documentales en Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSqlModal(true)}
            className="bg-white dark:bg-[#0F172A] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] text-[#5A5A40] dark:text-amber-400 border border-[#D1CEC7] dark:border-[#475569] text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Scripts SQL Supabase</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Subir a Supabase</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#D1CEC7] shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'photo', label: 'Fotografías' },
            { id: 'certificate', label: 'Actas & Certificados' },
            { id: 'letter', label: 'Cartas & Diarios' },
            { id: 'passport', label: 'Pasaportes' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider transition-colors ${
                selectedType === type.id
                  ? 'bg-[#5A5A40] text-white font-bold'
                  : 'bg-[#F5F2ED] text-[#7C796F] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Tag Filters & Search */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-[#D1CEC7] rounded-full px-3 py-1.5 bg-[#F5F2ED] text-[#434331] focus:outline-none"
            >
              <option value="all">Todas las etiquetas</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar documento..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F5F2ED] border border-[#D1CEC7] rounded-full text-xs text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#9A968A] absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Grid of Media Cards */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] text-[#7C796F]">
          <ImageIcon className="w-12 h-12 text-[#9A968A] mx-auto mb-3" />
          <p className="font-serif font-bold text-[#434331] text-base">No se encontraron archivos</p>
          <p className="text-xs text-[#9A968A] mt-1 font-serif italic">Prueba cambiando los filtros o sube un nuevo archivo histórico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map(item => {
            const related = people.filter(p => item.relatedPersonIds?.includes(p.id));

            return (
              <div
                key={item.id}
                onClick={() => setActiveMediaModal(item)}
                className="group bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
              >
                <div className="aspect-4/3 bg-[#E5E2D9] relative overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    {item.visibility === 'public' ? (
                      <span className="bg-[#434331]/80 backdrop-blur-xs text-white p-1 rounded-full inline-block">
                        <Globe className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="bg-[#A65D47]/90 backdrop-blur-xs text-white p-1 rounded-full inline-block">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-[#434331] text-sm leading-snug line-clamp-1 group-hover:text-[#5A5A40]">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-[#7C796F] font-mono mt-1">
                      <span>{item.historicalDate || 'Fecha s/d'}</span>
                      {item.historicalPlace && (
                        <>
                          <span>•</span>
                          <span className="truncate">{item.historicalPlace}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Related People Chips */}
                  {related.length > 0 && (
                    <div className="flex items-center space-x-1 overflow-hidden pt-2 border-t border-[#E5E2D9]">
                      <Users className="w-3 h-3 text-[#9A968A] shrink-0" />
                      <div className="flex items-center space-x-1 truncate text-[11px] text-[#7C796F]">
                        {related.map(p => (
                          <span key={p.id} className="truncate">{p.firstName} {p.lastName}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Detail Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left/Top: Image View */}
            <div className="md:w-3/5 bg-black/90 flex items-center justify-center p-4 relative min-h-[300px]">
              <img
                src={activeMediaModal.url}
                alt={activeMediaModal.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
              <a
                href={activeMediaModal.url}
                download={activeMediaModal.title}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="Descargar imagen"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>

            {/* Right/Bottom: Metadata and Comments */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-[#FDFBF7]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5A5A40]/15 text-[#434331] border border-[#5A5A40]/30">
                    {activeMediaModal.type}
                  </span>
                  <button
                    onClick={() => setActiveMediaModal(null)}
                    className="text-[#7C796F] hover:text-[#434331] p-1 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#434331] mt-3">
                  {activeMediaModal.title}
                </h3>

                {activeMediaModal.description && (
                  <p className="text-xs text-[#2C2C2C] mt-2 font-serif leading-relaxed">
                    {activeMediaModal.description}
                  </p>
                )}

                {/* Metadata list */}
                <div className="space-y-2 mt-4 text-xs text-[#7C796F] border-t border-b border-[#E5E2D9] py-3">
                  {activeMediaModal.historicalDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-[#9A968A]" />
                      <span>{activeMediaModal.historicalDate}</span>
                    </div>
                  )}
                  {activeMediaModal.historicalPlace && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#9A968A]" />
                      <span>{activeMediaModal.historicalPlace}</span>
                    </div>
                  )}
                </div>

                {/* Comments Stream */}
                <div className="mt-4">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-2 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comentarios & Testimonios ({mediaComments.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {mediaComments.map(c => (
                      <div key={c.id} className="text-xs bg-white p-2.5 rounded-xl border border-[#E5E2D9]">
                        <span className="font-bold text-[#434331] block">{c.userName}</span>
                        <p className="text-[#2C2C2C] font-serif mt-0.5">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom comment form & actions */}
              <div className="mt-4 pt-3 border-t border-[#E5E2D9]">
                <form onSubmit={handleAddMediaComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe un dato o recuerdo..."
                    className="flex-1 text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-full px-3 py-1.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#5A5A40] hover:bg-[#434331] text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    Publicar
                  </button>
                </form>

                {canEdit && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este archivo?')) {
                          deleteMedia(activeMediaModal.id);
                          setActiveMediaModal(null);
                        }
                      }}
                      className="text-xs text-[#A65D47] hover:underline flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar archivo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFBF7] dark:bg-[#1E293B] rounded-3xl p-6 max-w-lg w-full border border-[#D1CEC7] dark:border-[#334155] shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E2D9] dark:border-[#334155]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#434331] dark:text-[#F1F5F9]">
                  Cargar Documento o Fotografía a Supabase
                </h3>
                <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                  Almacenamiento persistente en Supabase Storage con URL pública
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#7C796F] hover:text-[#434331] dark:text-[#94A3B8] dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                  Archivo / Fotografía / Documento *
                </label>
                <ImageUploadDropzone
                  currentUrl={uploadUrl}
                  treeId={activeTree?.id || 'default_tree'}
                  personId={uploadPersonId || 'general'}
                  uploadType={uploadType === 'photo' ? 'media' : 'document'}
                  label="Subir a Supabase Storage"
                  sublabel="Soporta imágenes JPG/PNG y documentos escaneados o PDF"
                  onUploadComplete={(res) => {
                    setUploadUrl(res.publicUrl);
                    if (!uploadTitle && res.filePath) {
                      const cleanName = res.filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
                      if (cleanName) setUploadTitle(cleanName);
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                  Título o Nombre del Archivo *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: Retrato familiar en Sevilla, Acta de Bautismo 1892"
                  required
                  className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                    Tipo de Archivo
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as MediaType)}
                    className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  >
                    <option value="photo">Fotografía</option>
                    <option value="certificate">Acta o Certificado</option>
                    <option value="letter">Carta o Manuscrito</option>
                    <option value="passport">Pasaporte / Identificación</option>
                    <option value="newspaper">Prensa / Recorte</option>
                    <option value="other">Otro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                    Visibilidad
                  </label>
                  <select
                    value={uploadVisibility}
                    onChange={(e) => setUploadVisibility(e.target.value as MediaVisibility)}
                    className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  >
                    <option value="public">Público (Todos)</option>
                    <option value="private">Privado (Solo Familia)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                    Fecha Histórica
                  </label>
                  <input
                    type="text"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    placeholder="Ej: 1924 ó c. 1920"
                    className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={uploadPlace}
                    onChange={(e) => setUploadPlace(e.target.value)}
                    placeholder="Ej: Madrid, España"
                    className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                  Persona Asociada (Opcional)
                </label>
                <select
                  value={uploadPersonId}
                  onChange={(e) => setUploadPersonId(e.target.value)}
                  className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  <option value="">Ninguna o general del árbol</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={uploadTagsStr}
                  onChange={(e) => setUploadTagsStr(e.target.value)}
                  placeholder="Ej: Boda, Retrato, Inmigración"
                  className="w-full text-xs bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl p-2.5 text-[#434331] dark:text-[#F1F5F9] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#E5E2D9] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] dark:hover:bg-[#334155] rounded-full cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!uploadUrl || !uploadTitle.trim()}
                  className="bg-[#5A5A40] hover:bg-[#434331] disabled:opacity-50 text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Guardar en Árbol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase SQL Scripts Modal */}
      {showSqlModal && (
        <SupabaseSqlModal onClose={() => setShowSqlModal(false)} />
      )}
    </div>
  );
};
