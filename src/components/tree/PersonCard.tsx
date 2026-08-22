import React, { useState } from 'react';
import { 
  Eye, Plus, MapPin, Image as ImageIcon, FileText, 
  GripVertical, Share2, UserPlus, Heart, Sparkles, Edit3, HelpCircle
} from 'lucide-react';
import { Person, CertaintyLevel, RelationshipType } from '../../types';
import { useTree } from '../../context/TreeContext';
import { getSurnameStyle } from '../../utils/surnameTheme';

interface PersonCardProps {
  person: Person;
  isSelected?: boolean;
  onSelect: (person: Person) => void;
  onOpenDetailModal: (person: Person) => void;
  onOpenAddRelative?: (person: Person, relType?: RelationshipType | string) => void;
  onOpenInviteModal?: (person: Person, relType?: string) => void;
  onContextMenu?: (e: React.MouseEvent, person: Person) => void;
  onDragStartNode?: (e: React.DragEvent, person: Person) => void;
  onDropOnNode?: (e: React.DragEvent, targetPerson: Person) => void;
  compact?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  isSelected = false,
  onSelect,
  onOpenDetailModal,
  onOpenAddRelative,
  onOpenInviteModal,
  onContextMenu,
  onDragStartNode,
  onDropOnNode,
  compact = false
}) => {
  const { activeTree, getSanitizedPerson, media, sources, canEdit } = useTree();
  const sanitized = getSanitizedPerson(person);

  const [activePlusMenu, setActivePlusMenu] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const isPlaceholder = Boolean(person.isPlaceholder || person.firstName.startsWith('['));
  const surnameStyle = getSurnameStyle(sanitized.lastName, activeTree?.settings?.surnameStyles);

  const personMediaCount = media.filter(m => m.relatedPersonIds?.includes(person.id)).length;
  const personSourcesCount = sources.filter(s => person.sourceIds?.includes(s.id)).length;

  const getCertaintyBadge = (certainty: CertaintyLevel) => {
    if (isPlaceholder) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300" title="Tarjeta Vacía - Pendiente de rellenar">
          ⏳ Tarjeta Puente
        </span>
      );
    }

    switch (certainty) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#5A5A40]/15 text-[#434331] border border-[#5A5A40]/30" title="Dato Confirmado por Fuentes">
            ✓ Confirmado
          </span>
        );
      case 'probable':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#A65D47]/15 text-[#A65D47] border border-[#A65D47]/30" title="Dato Probable">
            ? Probable
          </span>
        );
      case 'estimated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#E5E2D9] text-[#7C796F] border border-[#D1CEC7]" title="Dato Estimado / Aproximado">
            ~ Estimado
          </span>
        );
      case 'investigating':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#F5F2ED] text-[#9A968A] border border-[#D1CEC7]" title="En Estudio">
            🔍 En Estudio
          </span>
        );
    }
  };

  const birthYear = sanitized.birthDate?.split('-')[0] || (sanitized.birthDateApprox ? sanitized.birthDateApprox : '?');
  const deathYear = sanitized.isLiving ? 'Presente' : (sanitized.deathDate?.split('-')[0] || sanitized.deathDateApprox || '†');

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(person);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(person);
    if (onContextMenu) {
      onContextMenu(e, person);
    }
  };

  const renderPlusButton = (side: 'top' | 'bottom' | 'left' | 'right', label: string, relType: RelationshipType) => {
    if (!canEdit) return null;

    let positionClasses = '';
    let popoverPosition = '';

    if (side === 'top') {
      positionClasses = 'absolute -top-3.5 left-1/2 -translate-x-1/2';
      popoverPosition = 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    } else if (side === 'bottom') {
      positionClasses = 'absolute -bottom-3.5 left-1/2 -translate-x-1/2';
      popoverPosition = 'top-full mt-2 left-1/2 -translate-x-1/2';
    } else if (side === 'left') {
      positionClasses = 'absolute top-1/2 -left-3.5 -translate-y-1/2';
      popoverPosition = 'right-full mr-2 top-1/2 -translate-y-1/2';
    } else if (side === 'right') {
      positionClasses = 'absolute top-1/2 -right-3.5 -translate-y-1/2';
      popoverPosition = 'left-full ml-2 top-1/2 -translate-x-0';
    }

    const isOpen = activePlusMenu === side;

    return (
      <div className={`${positionClasses} z-30 group/plus`} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setActivePlusMenu(isOpen ? null : side)}
          className="w-7 h-7 rounded-full bg-[#5A5A40] hover:bg-[#434331] text-white border-2 border-white shadow-md flex items-center justify-center transition-transform transform group-hover/plus:scale-110 active:scale-95"
          title={`Añadir o Invitar ${label}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Action Popover Menu */}
        {isOpen && (
          <div className={`absolute ${popoverPosition} z-40 bg-[#FDFBF7] border border-[#D1CEC7] rounded-2xl shadow-xl p-2 w-56 text-xs text-[#434331] animate-in fade-in zoom-in-95 backdrop-blur-md`}>
            <div className="px-2 py-1 border-b border-[#E5E2D9] mb-1 font-serif font-bold text-[11px] text-[#5A5A40]">
              {label}
            </div>

            <button
              onClick={() => {
                setActivePlusMenu(null);
                if (onOpenAddRelative) onOpenAddRelative(person, relType);
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-[#F5F2ED] rounded-xl flex items-center space-x-2 transition-colors font-sans text-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Añadir {label} directo</span>
            </button>

            {/* If TOP, also offer indirect grandparent */}
            {side === 'top' && (
              <button
                onClick={() => {
                  setActivePlusMenu(null);
                  if (onOpenAddRelative) onOpenAddRelative(person, 'grandparent');
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#F5F2ED] rounded-xl flex items-center space-x-2 transition-colors font-sans text-xs text-[#5A5A40] font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Añadir Abuelo (Indirecto)</span>
              </button>
            )}

            {/* If RIGHT, also offer Uncle / Cousin */}
            {side === 'right' && (
              <button
                onClick={() => {
                  setActivePlusMenu(null);
                  if (onOpenAddRelative) onOpenAddRelative(person, 'uncle_aunt');
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#F5F2ED] rounded-xl flex items-center space-x-2 transition-colors font-sans text-xs text-[#5A5A40] font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Añadir Tío/a (Indirecto)</span>
              </button>
            )}

            <button
              onClick={() => {
                setActivePlusMenu(null);
                if (onOpenInviteModal) onOpenInviteModal(person, relType);
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-[#F5F2ED] rounded-xl flex items-center space-x-2 transition-colors font-sans text-xs text-[#A65D47] font-semibold"
            >
              <Share2 className="w-3.5 h-3.5 text-[#A65D47]" />
              <span>Compartir enlace para rellenar</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      draggable={canEdit}
      onDragStart={(e) => {
        if (onDragStartNode) onDragStartNode(e, person);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (onDropOnNode) onDropOnNode(e, person);
      }}
      className={`relative group rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-xs select-none overflow-hidden ${
        isPlaceholder 
          ? 'bg-amber-50/70 border-dashed border-amber-400 hover:border-amber-500 hover:bg-amber-50' 
          : 'bg-white/95 hover:shadow-md hover:-translate-y-0.5'
      } ${
        isSelected
          ? 'ring-3 ring-[#A65D47] ring-offset-2 border-[#A65D47] shadow-lg transform -translate-y-0.5 bg-white'
          : isDragOver
          ? 'ring-2 ring-[#5A5A40] border-[#5A5A40] bg-[#F5F2ED]'
          : !isPlaceholder ? 'border-[#E5E2D9]' : ''
      } ${compact ? 'p-3 w-60' : 'p-4 w-68'}`}
      style={!isPlaceholder ? { borderTopColor: surnameStyle.bgColor } : undefined}
      id={`person-card-${person.id}`}
    >
      {/* Surname accent ribbon on top */}
      {!isPlaceholder && (
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: surnameStyle.bgColor }}
          title={`Linaje ${sanitized.lastName}`}
        />
      )}

      {/* 4 Interactive Plus (+) Buttons around the card */}
      {renderPlusButton('top', 'Padre / Madre', 'parent')}
      {renderPlusButton('bottom', 'Hijo / Hija', 'child')}
      {renderPlusButton('left', 'Cónyuge / Pareja', 'spouse')}
      {renderPlusButton('right', 'Hermano / Hermana', 'sibling')}

      {/* Top Header badges & Drag Handle */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <div className="flex items-center gap-1 overflow-hidden">
          {getCertaintyBadge(sanitized.certainty)}
          {sanitized.isLiving && !isPlaceholder && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#5A5A40] text-white">
              Vivo
            </span>
          )}
        </div>

        {/* Media & Sources Counts + Drag Indicator */}
        <div className="flex items-center space-x-1.5 text-[10px] text-[#9A968A] shrink-0 font-sans">
          {personMediaCount > 0 && (
            <span className="flex items-center space-x-0.5 bg-[#F5F2ED] px-1.5 py-0.5 rounded-md border border-[#E5E2D9]" title={`${personMediaCount} fotos`}>
              <ImageIcon className="w-2.5 h-2.5 text-[#7C796F]" />
              <span>{personMediaCount}</span>
            </span>
          )}
          {personSourcesCount > 0 && (
            <span className="flex items-center space-x-0.5 bg-[#F5F2ED] px-1.5 py-0.5 rounded-md border border-[#E5E2D9]" title={`${personSourcesCount} fuentes`}>
              <FileText className="w-2.5 h-2.5 text-[#7C796F]" />
              <span>{personSourcesCount}</span>
            </span>
          )}
          {canEdit && (
            <span className="text-[#9A968A] group-hover:text-[#5A5A40] transition-colors" title="Arrastrar para reposicionar o soltar sobre otro pariente">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Main Body: Avatar & Names */}
      <div className="flex items-start space-x-3">
        <div className="relative shrink-0">
          <div 
            className={`w-12 h-12 rounded-full border-2 border-white shadow-xs overflow-hidden flex items-center justify-center ${
              isPlaceholder ? 'bg-amber-200 text-amber-800' : 'bg-[#E5E2D9]'
            }`}
            style={!isPlaceholder ? { backgroundColor: `${surnameStyle.bgColor}25` } : undefined}
          >
            {sanitized.avatarUrl ? (
              <img
                src={sanitized.avatarUrl}
                alt={sanitized.firstName}
                className="w-full h-full object-cover"
              />
            ) : isPlaceholder ? (
              <Edit3 className="w-5 h-5 text-amber-700" />
            ) : (
              <span 
                className="text-xs font-serif font-bold"
                style={{ color: surnameStyle.bgColor }}
              >
                {sanitized.firstName?.[0] || '?'}{sanitized.lastName?.[0] || ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {isPlaceholder ? (
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-800 block">
                {sanitized.placeholderRole || 'Pariente Intermedio'}
              </span>
              <h4 className="font-serif font-bold text-amber-950 text-xs leading-snug">
                {sanitized.firstName} {sanitized.lastName}
              </h4>
              <p className="text-[10px] text-amber-700 font-sans mt-0.5">
                ✏️ Clic para rellenar datos
              </p>
            </div>
          ) : (
            <>
              <h4 className="font-serif font-bold text-[#434331] text-sm leading-snug truncate">
                {sanitized.firstName} {sanitized.lastName}
              </h4>
              {sanitized.maidenName && (
                <p className="text-[11px] text-[#7C796F] italic truncate">
                  (n. {sanitized.maidenName})
                </p>
              )}

              {/* Lifespan */}
              <div className="text-xs text-[#7C796F] italic mt-0.5 font-serif">
                {birthYear} — {deathYear}
              </div>

              {/* Profession */}
              {sanitized.profession && (
                <p className="text-[10px] uppercase tracking-wider text-[#9A968A] font-sans truncate mt-0.5">
                  {sanitized.profession}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Location bottom row */}
      {!isPlaceholder && sanitized.birthPlace && (
        <div className="mt-2.5 pt-2 border-t border-[#E5E2D9] flex items-center space-x-1 text-[11px] text-[#7C796F] truncate">
          <MapPin className="w-3 h-3 text-[#9A968A] shrink-0" />
          <span className="truncate">{sanitized.birthPlace}</span>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="mt-2.5 pt-2 border-t border-[#E5E2D9] flex items-center justify-between text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetailModal(person);
          }}
          className={`font-sans font-semibold uppercase tracking-wider text-[10px] flex items-center space-x-1 hover:underline ${
            isPlaceholder ? 'text-amber-800' : 'text-[#5A5A40] hover:text-[#434331]'
          }`}
        >
          {isPlaceholder ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span>{isPlaceholder ? 'Completar Datos' : 'Ver Ficha'}</span>
        </button>

        <div className="flex items-center space-x-1">
          {/* Share / Invite Link Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenInviteModal) onOpenInviteModal(person, 'relative');
            }}
            className="text-[#7C796F] hover:text-[#A65D47] hover:bg-[#F5F2ED] p-1 rounded-full transition-colors"
            title="Compartir enlace para invitar a rellenar"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Context Options Button */}
          <button
            onClick={handleContextMenu}
            className="text-[#7C796F] hover:text-[#5A5A40] hover:bg-[#F5F2ED] px-1.5 py-0.5 rounded-md text-[10px] font-sans font-semibold transition-colors"
            title="Clic derecho para más opciones"
          >
            •••
          </button>
        </div>
      </div>
    </div>
  );
};
