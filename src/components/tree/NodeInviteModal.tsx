import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, Mail, ShieldCheck, Sparkles, UserPlus, Link2
} from 'lucide-react';
import { Person, RelationshipType } from '../../types';

interface NodeInviteModalProps {
  person: Person;
  relationType?: string;
  onClose: () => void;
}

export const NodeInviteModal: React.FC<NodeInviteModalProps> = ({
  person,
  relationType = 'relative',
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState(relationType);
  const [guestName, setGuestName] = useState('');

  // Generate real dynamic invite link
  const currentOrigin = window.location.origin + window.location.pathname;
  const inviteUrl = `${currentOrigin}?invite=true&role=collaborator&targetId=${person.id}&rel=${encodeURIComponent(selectedRelation)}${guestName ? `&for=${encodeURIComponent(guestName)}` : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  const getRelationLabel = (rel: string) => {
    switch (rel) {
      case 'parent': return 'Padre / Madre';
      case 'child': return 'Hijo / Hija';
      case 'spouse': return 'Cónyuge / Pareja';
      case 'sibling': return 'Hermano / Hermana';
      default: return 'Familiar / Colaborador';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FDFBF7] border border-[#D1CEC7] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#434331]">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#434331]">
                Invitar a Rellenar este Campo
              </h3>
              <p className="text-xs text-[#7C796F]">
                Enlace colaborativo para conectar con <span className="font-semibold text-[#434331]">{person.firstName} {person.lastName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Relation selector pill */}
        <div className="space-y-2">
          <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#7C796F]">
            ¿Qué parentesco le corresponde a este familiar?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'parent', label: 'Padre / Madre' },
              { id: 'child', label: 'Hijo / Hija' },
              { id: 'spouse', label: 'Cónyuge' },
              { id: 'sibling', label: 'Hermano/a' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRelation(item.id)}
                className={`py-2 px-3 rounded-xl text-xs font-sans font-semibold transition-all border text-center ${
                  selectedRelation === item.id
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                    : 'bg-white border-[#E5E2D9] text-[#7C796F] hover:bg-[#F5F2ED]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Recipient Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#7C796F]">
            Nombre del destinatario (Opcional):
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ej. Tío Alberto, Prima Marcela..."
            className="w-full bg-white border border-[#D1CEC7] rounded-xl px-3.5 py-2 text-xs text-[#434331] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
          />
        </div>

        {/* Generated Link Box */}
        <div className="space-y-2 bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#E5E2D9]">
          <div className="flex items-center justify-between text-[11px] text-[#7C796F]">
            <span className="font-sans font-semibold uppercase tracking-wider flex items-center space-x-1 text-[#5A5A40]">
              <Link2 className="w-3.5 h-3.5" />
              <span>Enlace Directo de Invitación</span>
            </span>
            <span className="text-emerald-700 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Permiso de Edición Otorgado</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-white border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs font-mono text-[#5A5A40] truncate select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all flex items-center space-x-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#5A5A40] hover:bg-[#434331] text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#FDFBF7] border border-[#E5E2D9] p-3 rounded-2xl flex items-start space-x-3 text-xs text-[#7C796F]">
          <Sparkles className="w-4 h-4 text-[#A65D47] shrink-0 mt-0.5" />
          <p>
            Al abrir este enlace, tu familiar accederá con <strong>permiso de colaborador invitado</strong> y se le abrirá automáticamente el formulario para rellenar la ficha de <strong>{getRelationLabel(selectedRelation)}</strong> de {person.firstName}. Además, todos los cambios quedarán guardados en el historial público de movimientos.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E5E2D9]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-sans font-semibold text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCopy}
            className="px-5 py-2 text-xs font-sans font-semibold bg-[#5A5A40] hover:bg-[#434331] text-white rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Enlace en Portapapeles' : 'Copiar y Compartir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
