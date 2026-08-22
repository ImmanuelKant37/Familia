import React, { useState, useRef } from 'react';
import { 
  X, Edit3, Trash2, Plus, Calendar, MapPin, 
  Briefcase, Globe, Heart, Users, FileText, 
  Image as ImageIcon, BookOpen, MessageSquare, 
  Sparkles, CheckCircle, Send, ArrowRight, Camera, Upload, Loader2
} from 'lucide-react';
import { Person, CertaintyLevel } from '../../types';
import { useTree } from '../../context/TreeContext';
import { useAuth } from '../../context/AuthContext';
import { CompletenessMeter } from '../gamification/CompletenessMeter';
import { SupabaseStorageService } from '../../services/supabaseStorageService';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onOpenAddRelative: (person: Person) => void;
  onSelectRelative: (person: Person) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  onClose,
  onEdit,
  onOpenAddRelative,
  onSelectRelative
}) => {
  const { 
    people, relationships, events, media, sources, comments, 
    deletePerson, deleteRelationship, addComment, submitProposal,
    getSanitizedPerson, canEdit, canManage, updatePerson, addMedia, activeTree 
  } = useTree();
  const { isPublicMode } = useAuth();

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAddMediaInline, setShowAddMediaInline] = useState(false);
  const [inlineMediaTitle, setInlineMediaTitle] = useState('');
  const [inlineMediaUrl, setInlineMediaUrl] = useState('');
  const [inlineMediaType, setInlineMediaType] = useState<'photo' | 'document' | 'certificate'>('photo');

  const [activeTab, setActiveTab] = useState<'info' | 'family' | 'events' | 'media' | 'sources' | 'comments' | 'proposal'>('info');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !person || !canEdit) return;

    setIsUploadingAvatar(true);
    try {
      const result = await SupabaseStorageService.uploadPersonAvatar(
        file, 
        person.id, 
        activeTree?.id || person.treeId || 'default_tree'
      );

      if (result.publicUrl) {
        await updatePerson({
          ...person,
          avatarUrl: result.publicUrl
        });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };
  const [newComment, setNewComment] = useState('');
  const [proposalField, setProposalField] = useState('Fecha de nacimiento');
  const [proposalValue, setProposalValue] = useState('');
  const [proposalSource, setProposalSource] = useState('');
  const [proposalReason, setProposalReason] = useState('');
  const [proposalSent, setProposalSent] = useState(false);

  if (!person) return null;

  const sanitized = getSanitizedPerson(person);

  // Compute relatives with their relationship IDs
  const parents: { person: Person; relationshipId: string }[] = [];
  const children: { person: Person; relationshipId: string }[] = [];
  const spouses: { person: Person; relationshipId: string; notes?: string }[] = [];
  const siblings: Person[] = [];

  relationships.forEach(r => {
    if (r.type === 'parent') {
      if (r.person2Id === person.id) {
        const parent = people.find(p => p.id === r.person1Id);
        if (parent && !parents.some(p => p.person.id === parent.id)) {
          parents.push({ person: parent, relationshipId: r.id });
        }
      } else if (r.person1Id === person.id) {
        const child = people.find(p => p.id === r.person2Id);
        if (child && !children.some(c => c.person.id === child.id)) {
          children.push({ person: child, relationshipId: r.id });
        }
      }
    } else if (r.type === 'spouse' || r.type === 'partner') {
      if (r.person1Id === person.id) {
        const spouse = people.find(p => p.id === r.person2Id);
        if (spouse) spouses.push({ person: spouse, relationshipId: r.id, notes: r.notes });
      } else if (r.person2Id === person.id) {
        const spouse = people.find(p => p.id === r.person1Id);
        if (spouse) spouses.push({ person: spouse, relationshipId: r.id, notes: r.notes });
      }
    }
  });

  // Compute siblings through shared parents
  parents.forEach(({ person: parent }) => {
    relationships.forEach(r => {
      if (r.type === 'parent' && r.person1Id === parent.id && r.person2Id !== person.id) {
        const sib = people.find(p => p.id === r.person2Id);
        if (sib && !siblings.some(s => s.id === sib.id)) {
          siblings.push(sib);
        }
      }
    });
  });

  // Person-associated items
  const personEvents = events.filter(e => e.personIds?.includes(person.id));
  const personMedia = media.filter(m => m.relatedPersonIds?.includes(person.id));
  const personSources = sources.filter(s => person.sourceIds?.includes(s.id));
  const personComments = comments.filter(c => c.targetType === 'person' && c.targetId === person.id);

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar a ${person.firstName} ${person.lastName} del árbol?`)) {
      deletePerson(person.id);
      onClose();
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment('person', person.id, newComment);
    setNewComment('');
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalValue.trim()) return;
    await submitProposal({
      targetType: 'person',
      targetId: person.id,
      targetName: `${person.firstName} ${person.lastName}`,
      fieldChanged: proposalField,
      currentValue: (person as any)[proposalField === 'Fecha de nacimiento' ? 'birthDate' : 'deathDate'] || 'Desconocido',
      proposedValue: proposalValue.trim(),
      sourceNote: proposalSource.trim(),
      reason: proposalReason.trim()
    });
    setProposalSent(true);
    setTimeout(() => {
      setProposalSent(false);
      setActiveTab('info');
    }, 2000);
  };

  const getCertaintyColor = (certainty: CertaintyLevel) => {
    switch (certainty) {
      case 'confirmed': return 'bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30';
      case 'probable': return 'bg-[#A65D47]/15 text-[#A65D47] border-[#A65D47]/30';
      case 'estimated': return 'bg-[#E5E2D9] text-[#7C796F] border-[#D1CEC7]';
      case 'investigating': return 'bg-[#F5F2ED] text-[#9A968A] border-[#D1CEC7]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden max-h-[92vh] flex flex-col my-auto">
        
        {/* Modal Top Header Banner */}
        <div className="bg-[#434331] text-white p-5 sm:p-6 shrink-0 relative border-b border-[#5A5A40]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#E5E2D9] hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            {/* Avatar with direct Supabase Storage upload */}
            <div className="relative group/avatar shrink-0">
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
                id={`detail-avatar-upload-${person.id}`}
              />

              {isUploadingAvatar ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#5A5A40] flex flex-col items-center justify-center text-white ring-4 ring-white/20">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                  <span className="text-[9px] mt-1 font-semibold">Subiendo...</span>
                </div>
              ) : sanitized.avatarUrl ? (
                <img
                  src={sanitized.avatarUrl}
                  alt={sanitized.firstName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#5A5A40] flex items-center justify-center text-[#F5F2ED] text-3xl font-serif font-bold ring-4 ring-white/20">
                  {sanitized.firstName.charAt(0)}
                </div>
              )}

              {sanitized.isLiving && (
                <span className="absolute bottom-1 right-1 bg-[#5A5A40] text-white p-1 rounded-full ring-2 ring-[#434331]" title="Persona viva">
                  <Heart className="w-3 h-3 fill-current" />
                </span>
              )}

              {canEdit && !isUploadingAvatar && (
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-2xl text-white cursor-pointer"
                  title="Subir foto a Supabase"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[9px] font-bold uppercase mt-0.5">Supabase</span>
                </button>
              )}
            </div>

            {/* Main identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCertaintyColor(sanitized.certainty)} bg-white/90`}>
                  {sanitized.certainty === 'confirmed' ? '✓ Certeza Confirmada' : sanitized.certainty === 'probable' ? '? Probable' : '~ Estimado'}
                </span>
                {sanitized.generation && (
                  <span className="text-[11px] bg-white/15 text-[#E5E2D9] px-2.5 py-0.5 rounded-full">
                    {sanitized.generation}ª Generación
                  </span>
                )}
                {sanitized.isLiving ? (
                  <span className="text-[11px] bg-[#5A5A40]/40 text-[#E5E2D9] px-2.5 py-0.5 rounded-full border border-white/20">
                    Persona Viva
                  </span>
                ) : (
                  <span className="text-[11px] bg-black/30 text-[#E5E2D9] px-2.5 py-0.5 rounded-full">
                    Fallecido
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FDFBF7] truncate">
                {sanitized.firstName} {sanitized.middleName ? `${sanitized.middleName} ` : ''}{sanitized.lastName}
              </h2>
              {sanitized.maidenName && (
                <p className="text-sm text-[#E5E2D9] italic font-serif">
                  Apellido de nacimiento: {sanitized.maidenName}
                </p>
              )}

              {/* Dates and Places summary */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#E5E2D9] mt-2 font-mono">
                <span>
                  {sanitized.birthDate || sanitized.birthDateApprox || 'Nacimiento ?'} 
                  {' — '} 
                  {sanitized.isLiving ? 'Presente' : (sanitized.deathDate || sanitized.deathDateApprox || 'Defunción ?')}
                </span>
                {sanitized.birthPlace && (
                  <span className="flex items-center space-x-1 font-sans text-[#FDFBF7]">
                    <MapPin className="w-3 h-3 text-[#E5E2D9]" />
                    <span>{sanitized.birthPlace}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
              {canEdit && (
                <button
                  onClick={() => onEdit(person)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-full flex items-center space-x-1.5 transition-colors border border-white/20 font-medium uppercase tracking-wider"
                  title="Editar información"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => onOpenAddRelative(person)}
                  className="bg-[#A65D47] hover:bg-[#8e4f3c] text-white text-xs px-3.5 py-2 rounded-full flex items-center space-x-1.5 transition-colors font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
                  title="Conectar o agregar familiar"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Pariente</span>
                </button>
              )}

              {canEdit && (
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-400/30 rounded-full flex items-center space-x-1.5 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  title="Eliminar este registro del árbol"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Registro</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dossier Navigation Tabs */}
        <div className="flex border-b border-[#D1CEC7] bg-[#F5F2ED] px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#7C796F] shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Biografía & Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'family'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Parientes ({parents.length + spouses.length + children.length + siblings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'events'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Acontecimientos ({personEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galería ({personMedia.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'sources'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fuentes ({personSources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent hover:text-[#434331]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Memorias ({personComments.length})</span>
          </button>

          {!canEdit && (
            <button
              onClick={() => setActiveTab('proposal')}
              className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap text-[#A65D47] ${
                activeTab === 'proposal'
                  ? 'border-[#A65D47] font-bold bg-[#FDFBF7] rounded-t-xl'
                  : 'border-transparent hover:text-[#8e4f3c]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proponer Corrección</span>
            </button>
          )}
        </div>

        {/* Tab Contents Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-[#FDFBF7]">
          
          {/* TAB 1: BIOGRAFIA & DATOS */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Completeness & Quality Score Bar */}
              <CompletenessMeter 
                person={person} 
                relationships={relationships} 
                media={media} 
                sources={sources} 
              />

              {/* Bio block */}
              <div>
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] mb-2">
                  Biografía & Semblanza
                </h3>
                <div className="bg-white rounded-2xl p-4 text-[#2C2C2C] leading-relaxed text-sm border border-[#E5E2D9] shadow-2xs font-serif">
                  {sanitized.bio || 'No se ha registrado una biografía para esta persona.'}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E5E2D9] shadow-2xs">
                  <div className="text-xs text-[#7C796F] font-semibold uppercase tracking-wider mb-1 flex items-center space-x-1 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-[#9A968A]" />
                    <span>Nacimiento</span>
                  </div>
                  <div className="font-serif font-bold text-[#434331] text-sm">
                    {sanitized.birthDate || sanitized.birthDateApprox || 'Fecha no registrada'}
                  </div>
                  {sanitized.birthPlace && (
                    <div className="text-xs text-[#7C796F] mt-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#9A968A]" />
                      <span>{sanitized.birthPlace}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E5E2D9] shadow-2xs">
                  <div className="text-xs text-[#7C796F] font-semibold uppercase tracking-wider mb-1 flex items-center space-x-1 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-[#9A968A]" />
                    <span>Defunción / Estado</span>
                  </div>
                  <div className="font-serif font-bold text-[#434331] text-sm">
                    {sanitized.isLiving ? 'Persona Viva (Presente)' : (sanitized.deathDate || sanitized.deathDateApprox || 'Fecha no registrada')}
                  </div>
                  {sanitized.deathPlace && !sanitized.isLiving && (
                    <div className="text-xs text-[#7C796F] mt-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#9A968A]" />
                      <span>{sanitized.deathPlace}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E5E2D9] shadow-2xs">
                  <div className="text-xs text-[#7C796F] font-semibold uppercase tracking-wider mb-1 flex items-center space-x-1 font-sans">
                    <Briefcase className="w-3.5 h-3.5 text-[#9A968A]" />
                    <span>Profesión / Oficio</span>
                  </div>
                  <div className="font-serif font-bold text-[#434331] text-sm">
                    {sanitized.profession || 'Sin registro de profesión'}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E5E2D9] shadow-2xs">
                  <div className="text-xs text-[#7C796F] font-semibold uppercase tracking-wider mb-1 flex items-center space-x-1 font-sans">
                    <Globe className="w-3.5 h-3.5 text-[#9A968A]" />
                    <span>Nacionalidad / Origen</span>
                  </div>
                  <div className="font-serif font-bold text-[#434331] text-sm">
                    {sanitized.nationality || 'No especificada'}
                  </div>
                </div>
              </div>

              {/* Aliases & Tags */}
              {(sanitized.aliases && sanitized.aliases.length > 0) && (
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] mb-2">
                    Alias & Apodos Familiares
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sanitized.aliases.map((alias, i) => (
                      <span key={i} className="px-3 py-1 bg-[#E5E2D9] text-[#434331] rounded-full text-xs font-medium border border-[#D1CEC7]">
                        "{alias}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {sanitized.notes && (
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] mb-2">
                    Notas Genealógicas
                  </h3>
                  <div className="bg-[#F5F2ED] rounded-2xl p-4 text-xs text-[#434331] border border-[#D1CEC7] leading-relaxed font-serif">
                    {sanitized.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PARIENTES & FAMILIA */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              
              {/* Padres */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] flex items-center space-x-1.5">
                    <span>Padres ({parents.length})</span>
                  </h3>
                  {canEdit && (
                    <button
                      onClick={() => onOpenAddRelative(person)}
                      className="text-xs text-[#5A5A40] hover:text-[#434331] font-semibold uppercase tracking-wider flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Padre / Madre</span>
                    </button>
                  )}
                </div>

                {parents.length === 0 ? (
                  <p className="text-xs text-[#9A968A] italic font-serif">No hay padres registrados para esta persona.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parents.map(({ person: p, relationshipId }) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#5A5A40] transition-all group shadow-2xs"
                      >
                        <div 
                          onClick={() => onSelectRelative(p)}
                          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                        >
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={p.firstName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E5E2D9] shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-sm font-serif font-bold text-[#434331] group-hover:text-[#5A5A40] truncate">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-xs text-[#7C796F] italic">
                              {p.birthDate?.slice(0, 4) || '?'} — {p.isLiving ? 'Presente' : (p.deathDate?.slice(0, 4) || '†')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Desvincular a ${p.firstName} ${p.lastName} como padre/madre?`)) {
                                  deleteRelationship(relationshipId);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Desvincular relación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowRight 
                            onClick={() => onSelectRelative(p)}
                            className="w-4 h-4 text-[#9A968A] group-hover:text-[#5A5A40] transition-transform group-hover:translate-x-1 cursor-pointer" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cónyuges / Parejas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#A65D47]" />
                    <span>Cónyuges & Parejas ({spouses.length})</span>
                  </h3>
                  {canEdit && (
                    <button
                      onClick={() => onOpenAddRelative(person)}
                      className="text-xs text-[#5A5A40] hover:text-[#434331] font-semibold uppercase tracking-wider flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Cónyuge</span>
                    </button>
                  )}
                </div>

                {spouses.length === 0 ? (
                  <p className="text-xs text-[#9A968A] italic font-serif">No hay cónyuge o pareja registrada.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {spouses.map(({ person: sp, relationshipId, notes }) => (
                      <div
                        key={sp.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#A65D47] transition-all group shadow-2xs"
                      >
                        <div 
                          onClick={() => onSelectRelative(sp)}
                          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                        >
                          <img
                            src={sp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={sp.firstName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E5E2D9] shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-sm font-serif font-bold text-[#434331] group-hover:text-[#A65D47] truncate">
                              {sp.firstName} {sp.lastName}
                            </p>
                            <p className="text-xs text-[#7C796F] italic">
                              {sp.birthDate?.slice(0, 4) || '?'} — {sp.isLiving ? 'Presente' : (sp.deathDate?.slice(0, 4) || '†')}
                            </p>
                            {notes && <p className="text-[10px] text-[#A65D47] italic truncate">{notes}</p>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Desvincular a ${sp.firstName} ${sp.lastName} como cónyuge/pareja?`)) {
                                  deleteRelationship(relationshipId);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Desvincular relación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowRight 
                            onClick={() => onSelectRelative(sp)}
                            className="w-4 h-4 text-[#9A968A] group-hover:text-[#A65D47] transition-transform group-hover:translate-x-1 cursor-pointer" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hijos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F]">
                    Hijos ({children.length})
                  </h3>
                  {canEdit && (
                    <button
                      onClick={() => onOpenAddRelative(person)}
                      className="text-xs text-[#5A5A40] hover:text-[#434331] font-semibold uppercase tracking-wider flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Hijo/a</span>
                    </button>
                  )}
                </div>

                {children.length === 0 ? (
                  <p className="text-xs text-[#9A968A] italic font-serif">No hay hijos registrados para esta persona.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {children.map(({ person: c, relationshipId }) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#5A5A40] transition-all group shadow-2xs"
                      >
                        <div 
                          onClick={() => onSelectRelative(c)}
                          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                        >
                          <img
                            src={c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={c.firstName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E5E2D9] shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-sm font-serif font-bold text-[#434331] group-hover:text-[#5A5A40] truncate">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="text-xs text-[#7C796F] italic">
                              {c.birthDate?.slice(0, 4) || '?'} — {c.isLiving ? 'Presente' : (c.deathDate?.slice(0, 4) || '†')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Desvincular a ${c.firstName} ${c.lastName} como hijo/a?`)) {
                                  deleteRelationship(relationshipId);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Desvincular relación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowRight 
                            onClick={() => onSelectRelative(c)}
                            className="w-4 h-4 text-[#9A968A] group-hover:text-[#5A5A40] transition-transform group-hover:translate-x-1 cursor-pointer" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hermanos */}
              {siblings.length > 0 && (
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] mb-3">
                    Hermanos / Ramas Colaterales ({siblings.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siblings.map(sib => (
                      <div
                        key={sib.id}
                        onClick={() => onSelectRelative(sib)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#E5E2D9] bg-white hover:border-[#5A5A40] transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={sib.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={sib.firstName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E5E2D9]"
                          />
                          <div>
                            <p className="text-sm font-serif font-bold text-[#434331] group-hover:text-[#5A5A40]">
                              {sib.firstName} {sib.lastName}
                            </p>
                            <p className="text-xs text-[#7C796F] italic">
                              {sib.birthDate?.slice(0, 4) || '?'} — {sib.isLiving ? 'Presente' : (sib.deathDate?.slice(0, 4) || '†')}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9A968A] group-hover:text-[#5A5A40] transition-transform group-hover:translate-x-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACONTECIMIENTOS HISTORICOS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {personEvents.length === 0 ? (
                <div className="text-center py-8 text-[#9A968A] text-sm font-serif italic">
                  No se han registrado acontecimientos históricos para esta persona todavía.
                </div>
              ) : (
                <div className="relative border-l-2 border-[#5A5A40]/40 ml-4 space-y-6 pl-6">
                  {personEvents.map(ev => (
                    <div key={ev.id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#5A5A40] ring-4 ring-[#FDFBF7]"></div>
                      <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-[#434331] bg-[#E5E2D9] px-2.5 py-0.5 rounded-full">
                            {ev.date || ev.dateApprox || 'Fecha aproximada'}
                          </span>
                          <span className="text-[11px] uppercase tracking-wider text-[#7C796F] font-semibold font-sans">
                            {ev.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-serif font-bold text-[#434331] mt-2">{ev.title}</h4>
                        {ev.place && (
                          <div className="text-xs text-[#7C796F] mt-1 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-[#9A968A]" />
                            <span>{ev.place}</span>
                          </div>
                        )}
                        {ev.description && (
                          <p className="text-xs text-[#434331] mt-2 leading-relaxed font-serif">{ev.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MULTIMEDIA & DOCUMENTOS */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Header with Upload Action */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#7C796F] dark:text-[#94A3B8] flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#5A5A40] dark:text-amber-400" />
                  <span>Galería & Documentos Vinculados ({personMedia.length})</span>
                </h3>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setShowAddMediaInline(!showAddMediaInline)}
                    className="text-xs font-semibold text-[#5A5A40] dark:text-amber-400 hover:text-[#434331] dark:hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddMediaInline ? 'Ocultar Subida' : 'Subir a Supabase'}</span>
                  </button>
                )}
              </div>

              {/* Inline Upload Dropzone */}
              {showAddMediaInline && (
                <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E5E2D9] dark:border-[#334155] space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#7C796F] dark:text-[#94A3B8] mb-1">
                        Título o Descripción del Archivo
                      </label>
                      <input
                        type="text"
                        value={inlineMediaTitle}
                        onChange={e => setInlineMediaTitle(e.target.value)}
                        placeholder="Ej: Retrato de boda, Acta de bautismo, etc."
                        className="w-full bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl px-3 py-1.5 text-xs text-[#434331] dark:text-[#F1F5F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#7C796F] dark:text-[#94A3B8] mb-1">
                        Tipo de Archivo
                      </label>
                      <select
                        value={inlineMediaType}
                        onChange={e => setInlineMediaType(e.target.value as any)}
                        className="w-full bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl px-3 py-1.5 text-xs text-[#434331] dark:text-[#F1F5F9]"
                      >
                        <option value="photo">Fotografía Familiar</option>
                        <option value="document">Documento Histórico / PDF</option>
                        <option value="certificate">Acta o Certificado</option>
                      </select>
                    </div>
                  </div>

                  <ImageUploadDropzone
                    currentUrl={inlineMediaUrl}
                    personId={person.id}
                    treeId={person.treeId}
                    uploadType={inlineMediaType === 'photo' ? 'media' : 'document'}
                    label={`Subir ${inlineMediaType === 'photo' ? 'fotografía' : 'documento'} a Supabase`}
                    sublabel="Archivado seguro en Supabase Storage con URL permanente"
                    onUploadComplete={async (res) => {
                      setInlineMediaUrl(res.publicUrl);
                      if (res.publicUrl) {
                        await addMedia({
                          treeId: person.treeId,
                          title: inlineMediaTitle.trim() || `Documento de ${person.firstName}`,
                          url: res.publicUrl,
                          type: inlineMediaType,
                          relatedPersonIds: [person.id]
                        });
                        setInlineMediaTitle('');
                        setInlineMediaUrl('');
                        setShowAddMediaInline(false);
                      }
                    }}
                  />
                </div>
              )}

              {personMedia.length === 0 ? (
                <div className="text-center py-8 text-[#9A968A] text-sm font-serif italic">
                  No hay fotografías ni documentos históricos asociados a esta persona.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {personMedia.map(m => (
                    <div key={m.id} className="group relative rounded-2xl border border-[#E5E2D9] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#1E293B] shadow-2xs">
                      <div className="aspect-4/3 bg-[#E5E2D9] dark:bg-[#0F172A] overflow-hidden flex items-center justify-center">
                        {m.type === 'document' || m.type === 'certificate' ? (
                          <div className="flex flex-col items-center justify-center p-4 text-[#5A5A40] dark:text-amber-400">
                            <FileText className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-bold uppercase">{m.type}</span>
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <h5 className="text-xs font-serif font-bold text-[#434331] dark:text-[#F1F5F9] truncate">{m.title}</h5>
                        <p className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] truncate mt-0.5">
                          {m.historicalDate || 'Sin fecha'} • {m.historicalPlace || 'Lugar desconocido'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FUENTES & CERTEZA */}
          {activeTab === 'sources' && (
            <div className="space-y-3">
              {personSources.length === 0 ? (
                <div className="text-center py-8 text-[#9A968A] text-sm font-serif italic">
                  No hay fuentes documentales asociadas directamente a este registro.
                </div>
              ) : (
                personSources.map(src => (
                  <div key={src.id} className="p-4 rounded-2xl border border-[#E5E2D9] bg-white shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-[#434331]">{src.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5A5A40]/15 text-[#434331] font-semibold border border-[#5A5A40]/30 font-sans uppercase tracking-wider">
                        ✓ {src.confidence === 'confirmed' ? 'Confirmado' : src.confidence}
                      </span>
                    </div>
                    {src.repository && (
                      <p className="text-xs text-[#7C796F]">
                        <strong className="text-[#434331]">Repositorio:</strong> {src.repository}
                      </p>
                    )}
                    {src.citation && (
                      <p className="text-xs text-[#7C796F] font-mono">
                        <strong className="text-[#434331] font-sans">Cita:</strong> {src.citation}
                      </p>
                    )}
                    {src.notes && (
                      <p className="text-xs text-[#7C796F] italic mt-1 font-serif">{src.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: MEMORIA COLECTIVA / COMENTARIOS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {personComments.length === 0 ? (
                  <p className="text-xs text-[#9A968A] italic text-center py-4 font-serif">
                    Sé el primero en compartir un recuerdo o testimonio sobre {person.firstName}.
                  </p>
                ) : (
                  personComments.map(com => (
                    <div key={com.id} className="p-3.5 rounded-2xl bg-white border border-[#E5E2D9] flex items-start space-x-3 shadow-2xs">
                      <img
                        src={com.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={com.userName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#D1CEC7]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-[#434331]">{com.userName}</span>
                          <span className="text-[10px] text-[#9A968A] font-mono">
                            {new Date(com.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#2C2C2C] mt-1 leading-relaxed font-serif">{com.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input Form */}
              <form onSubmit={handleSendComment} className="flex items-center space-x-2 pt-2 border-t border-[#E5E2D9]">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Escribe un recuerdo o dato sobre ${person.firstName}...`}
                  className="flex-1 text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-full px-4 py-2 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white p-2.5 rounded-full text-xs font-medium transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: PROPONER CORRECCIÓN */}
          {activeTab === 'proposal' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="p-4 bg-[#E5E2D9] rounded-2xl border border-[#D1CEC7] text-xs text-[#434331]">
                <strong>Sistema de Propuestas Históricas:</strong> Para preservar la veracidad genealógica, los colaboradores pueden sugerir cambios respaldados por fuentes que el propietario del árbol revisará.
              </div>

              {proposalSent ? (
                <div className="p-4 bg-[#5A5A40]/15 text-[#434331] rounded-2xl text-center text-xs font-medium flex items-center justify-center space-x-2 border border-[#5A5A40]/30">
                  <CheckCircle className="w-4 h-4 text-[#5A5A40]" />
                  <span>¡Propuesta enviada con éxito! El administrador la revisará a la brevedad.</span>
                </div>
              ) : (
                <form onSubmit={handleSendProposal} className="space-y-3">
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Dato a corregir</label>
                    <select
                      value={proposalField}
                      onChange={(e) => setProposalField(e.target.value)}
                      className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    >
                      <option value="Fecha de nacimiento">Fecha de nacimiento</option>
                      <option value="Lugar de nacimiento">Lugar de nacimiento</option>
                      <option value="Fecha de defunción">Fecha de defunción</option>
                      <option value="Nombre o apellido">Nombre o apellido</option>
                      <option value="Profesión u origen">Profesión u origen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Valor propuesto</label>
                    <input
                      type="text"
                      value={proposalValue}
                      onChange={(e) => setProposalValue(e.target.value)}
                      placeholder="Ej: 1857-09-22"
                      required
                      className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Fuente documental de respaldo</label>
                    <input
                      type="text"
                      value={proposalSource}
                      onChange={(e) => setProposalSource(e.target.value)}
                      placeholder="Ej: Acta parroquial de Génova, Libro II Folio 45"
                      required
                      className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Motivo / Justificación</label>
                    <textarea
                      value={proposalReason}
                      onChange={(e) => setProposalReason(e.target.value)}
                      placeholder="Explica brevemente por qué consideras que el dato actual es incorrecto..."
                      rows={2}
                      className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-full shadow-xs transition-colors"
                  >
                    Enviar Propuesta de Corrección
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
