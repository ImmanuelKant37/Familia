/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, HeartHandshake, Sparkles, CheckCircle, 
  MapPin, GitBranch, Send, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { useAuth } from '../../context/AuthContext';
import { FamilyConnectionType } from '../../types/familyLobby';

export const ConnectFamiliesModal: React.FC = () => {
  const { 
    selectedFamilyForConnection, 
    families, 
    closeModals, 
    proposeFamilyConnection 
  } = useFamilyLobby();

  const { currentUser } = useAuth();

  const [selectedMyFamilyId, setSelectedMyFamilyId] = useState(families[0]?.id || '');
  const [connectionType, setConnectionType] = useState<FamilyConnectionType>('POSSIBLE_COMMON_ORIGIN');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!selectedFamilyForConnection) return null;

  const targetFamily = selectedFamilyForConnection;
  const myFamily = families.find(f => f.id === selectedMyFamilyId) || families[0];

  // Calculate common surnames between myFamily and targetFamily
  const commonSurnames = myFamily 
    ? myFamily.surnameTags.filter(s => targetFamily.surnameTags.includes(s))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myFamily) return;

    setIsSubmitting(true);
    try {
      await proposeFamilyConnection(
        myFamily.id,
        targetFamily.id,
        connectionType,
        notes.trim() || `Propuesta de conexión basada en apellidos compartidos (${commonSurnames.join(', ')}) y cercanía geográfica.`
      );
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-2.5">
            <HeartHandshake className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Proponer Conexión Entre Familias
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8]">
                Vincular investigaciones independientes sin fusionar árboles
              </p>
            </div>
          </div>
          <button
            onClick={closeModals}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#434331] dark:text-[#F8FAFC]">
              ¡Propuesta de Conexión Enviada!
            </h3>
            <p className="text-xs sm:text-sm text-[#7C796F] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              El propietario de <strong>{targetFamily.name}</strong> ({targetFamily.ownerName}) ha recibido tu propuesta. Cuando la acepte, ambas familias quedarán interconectadas como linajes emparentados.
            </p>
            <button
              onClick={closeModals}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#5A5A40] dark:bg-amber-600 text-white text-xs font-semibold hover:bg-[#434331] cursor-pointer"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Visual Connection Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* My Family Card */}
              <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] space-y-1.5">
                <span className="text-[10px] font-sans font-bold uppercase text-[#7C796F] dark:text-[#94A3B8]">
                  Tu Familia / Árbol:
                </span>
                <select
                  value={selectedMyFamilyId}
                  onChange={(e) => setSelectedMyFamilyId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs font-serif font-bold text-[#434331] dark:text-[#F8FAFC]"
                >
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                  {myFamily?.region}, {myFamily?.country} · {myFamily?.peopleCount} personas
                </div>
              </div>

              {/* Target Family Card */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-300 dark:border-amber-700 space-y-1.5">
                <span className="text-[10px] font-sans font-bold uppercase text-amber-800 dark:text-amber-300">
                  Familia Destino:
                </span>
                <h4 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC]">
                  {targetFamily.name}
                </h4>
                <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                  Autor: {targetFamily.ownerName} · {targetFamily.region}, {targetFamily.country}
                </div>
              </div>
            </div>

            {/* Common Attributes Detected */}
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Puntos de contacto identificados:</span>
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">Apellidos compartidos:</span>
                {commonSurnames.length > 0 ? (
                  commonSurnames.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-[#5A5A40]/10 dark:bg-amber-950 text-[#5A5A40] dark:text-amber-300 font-serif font-bold text-[10px]">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[#7C796F] italic text-[11px]">Posible nexo geográfico o migratorio</span>
                )}
              </div>
            </div>

            {/* Connection Type */}
            <div className="space-y-2">
              <label className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC] block">
                Tipo de relación o hipótesis genealógica
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { type: 'POSSIBLE_COMMON_ORIGIN', label: 'Posible origen común', desc: 'Mismo apellido y región en siglos pasados' },
                  { type: 'MARRIAGE_UNION', label: 'Matrimonio o alianza familiar', desc: 'Entrecruzamiento de ramas' },
                  { type: 'GEOGRAPHIC_NEIGHBORHOOD', label: 'Misma colonia o pueblo', desc: 'Llegada en el mismo contingente migratorio' },
                  { type: 'DOCUMENTED_MATCH', label: 'Coincidencia documental', desc: 'Mismo antepasado en partidas de nacimiento' }
                ].map(item => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setConnectionType(item.type as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      connectionType === item.type
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white dark:bg-[#1E293B] text-[#434331] dark:text-[#E2E8F0] border-[#D1CEC7] dark:border-[#334155]'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs block">{item.label}</span>
                    <span className={`text-[10px] ${connectionType === item.type ? 'text-white/80' : 'text-[#7C796F] dark:text-[#94A3B8]'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Proposal */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0]">
                Explicación de la conexión para {targetFamily.ownerName}:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej: Hola! Noto que ambas familias tienen raíces en Entre Ríos con los Cantero y Pérez hacia 1880. Mi bisabuelo Ramón podría ser hermano de tu antepasado..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={closeModals}
                className="px-4 py-2 rounded-xl border border-[#D1CEC7] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Propuesta de Conexión'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
