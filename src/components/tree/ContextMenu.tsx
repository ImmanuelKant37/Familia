import React, { useEffect, useRef } from 'react';
import { 
  Edit3, UserPlus, Users, Link2, Eye, MapPin, Trash2, 
  PlusCircle, RotateCcw, Sparkles, Share2, Shield
} from 'lucide-react';
import { Person, RelationshipType } from '../../types';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  person?: Person | null;
  type: 'node' | 'canvas';
}

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  canEdit: boolean;
  onEditPerson: (person: Person) => void;
  onViewDetails: (person: Person) => void;
  onAddRelative: (person: Person, relType?: RelationshipType) => void;
  onCopyInviteLink: (person: Person, relation?: string) => void;
  onCenterPerson: (personId: string) => void;
  onDeletePerson: (personId: string) => void;
  onAddNewRootPerson: () => void;
  onResetView: () => void;
  onCreateEmptyTemplate: () => void;
  onResetToDemoTree: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  canEdit,
  onEditPerson,
  onViewDetails,
  onAddRelative,
  onCopyInviteLink,
  onCenterPerson,
  onDeletePerson,
  onAddNewRootPerson,
  onResetView,
  onCreateEmptyTemplate,
  onResetToDemoTree
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!state.isOpen) return null;

  // Prevent menu from overflowing window viewport
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const menuW = 240;
  const menuH = 340;
  const posX = state.x + menuW > screenW ? Math.max(10, state.x - menuW) : state.x;
  const posY = state.y + menuH > screenH ? Math.max(10, state.y - menuH) : state.y;

  return (
    <div
      ref={menuRef}
      style={{ left: `${posX}px`, top: `${posY}px` }}
      className="fixed z-50 w-60 bg-[#FDFBF7] border border-[#D1CEC7] rounded-2xl shadow-xl py-2 font-sans text-xs text-[#434331] animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md select-none"
    >
      {state.type === 'node' && state.person ? (
        <>
          {/* Header with Person Name */}
          <div className="px-3.5 py-1.5 border-b border-[#E5E2D9] mb-1">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#9A968A]">
              Opciones de Registro
            </p>
            <p className="font-serif font-bold text-sm text-[#434331] truncate">
              {state.person.firstName} {state.person.lastName}
            </p>
          </div>

          {/* Edit & Details */}
          {canEdit ? (
            <button
              onClick={() => {
                onEditPerson(state.person!);
                onClose();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors font-medium text-[#434331]"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Editar Datos (Formulario)</span>
            </button>
          ) : (
            <div className="px-3.5 py-1 text-[11px] text-[#A65D47] flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Modo Lectura (Invitados editan)</span>
            </div>
          )}

          <button
            onClick={() => {
              onViewDetails(state.person!);
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#434331]"
          >
            <Eye className="w-3.5 h-3.5 text-[#7C796F]" />
            <span>Ver Ficha Completa</span>
          </button>

          <button
            onClick={() => {
              onCenterPerson(state.person!.id);
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#434331]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#7C796F]" />
            <span>Centrar en el Árbol</span>
          </button>

          {/* Family Connections */}
          {canEdit && (
            <>
              <div className="my-1 border-t border-[#E5E2D9]"></div>
              <p className="px-3.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#9A968A]">
                Conectar Pariente
              </p>

              <button
                onClick={() => {
                  onAddRelative(state.person!, 'parent');
                  onClose();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Añadir Padre o Madre</span>
              </button>

              <button
                onClick={() => {
                  onAddRelative(state.person!, 'child');
                  onClose();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Añadir Hijo o Hija</span>
              </button>

              <button
                onClick={() => {
                  onAddRelative(state.person!, 'spouse');
                  onClose();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Añadir Cónyuge / Pareja</span>
              </button>
            </>
          )}

          {/* Share / Invite Link to fill this node */}
          <div className="my-1 border-t border-[#E5E2D9]"></div>
          <button
            onClick={() => {
              onCopyInviteLink(state.person!);
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#5A5A40] font-semibold"
          >
            <Share2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Compartir enlace para rellenar</span>
          </button>

          {/* Delete Option */}
          {canEdit && (
            <>
              <div className="my-1 border-t border-[#E5E2D9]"></div>
              <button
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar a ${state.person!.firstName} ${state.person!.lastName}?`)) {
                    onDeletePerson(state.person!.id);
                  }
                  onClose();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center space-x-2.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Eliminar Registro</span>
              </button>
            </>
          )}
        </>
      ) : (
        <>
          {/* Canvas Background Context Menu */}
          <div className="px-3.5 py-1.5 border-b border-[#E5E2D9] mb-1">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#9A968A]">
              Lienzo Genealógico
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => {
                onAddNewRootPerson();
                onClose();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors font-semibold text-[#5A5A40]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Añadir Nueva Persona al Árbol</span>
            </button>
          )}

          <button
            onClick={() => {
              onResetView();
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#434331]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7C796F]" />
            <span>Reajustar Vista y Zoom (100%)</span>
          </button>

          {canEdit && (
            <>
              <div className="my-1 border-t border-[#E5E2D9]"></div>
              <button
                onClick={() => {
                  if (confirm('¿Deseas iniciar una plantilla vacía con una tarjeta inicial limpia para comenzar tu propio linaje?')) {
                    onCreateEmptyTemplate();
                  }
                  onClose();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#434331]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Plantilla Vacía (Nueva Raíz)</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('¿Restaurar el árbol de demostración de la Familia Cantero & Rossi?')) {
                    onResetToDemoTree();
                  }
                  onClose();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F5F2ED] flex items-center space-x-2.5 transition-colors text-[#7C796F]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#9A968A]" />
                <span>Restaurar Árbol Demo Cantero</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};
