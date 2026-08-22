import React, { useState, useMemo } from 'react';
import { 
  GitMerge, CheckCircle, X, ShieldCheck
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { detectDuplicates } from '../../services/duplicateService';
import { DuplicateMatch } from '../../types';

interface DuplicatesModalProps {
  onClose: () => void;
}

export const DuplicatesModal: React.FC<DuplicatesModalProps> = ({
  onClose
}) => {
  const { people, updatePerson, deletePerson, canManage } = useTree();
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  const duplicateMatches = useMemo(() => {
    return detectDuplicates(people);
  }, [people]);

  const handleMerge = async (match: DuplicateMatch) => {
    if (!confirm(`¿Confirmas fusionar los registros de "${match.personA.firstName} ${match.personA.lastName}" y "${match.personB.firstName} ${match.personB.lastName}"? Se preservará toda la información combinada.`)) {
      return;
    }

    setMergingId(match.personA.id);
    try {
      // Merge properties from Person B into Person A
      const mergedPerson = {
        ...match.personA,
        middleName: match.personA.middleName || match.personB.middleName,
        maidenName: match.personA.maidenName || match.personB.maidenName,
        birthDate: match.personA.birthDate || match.personB.birthDate,
        birthDateApprox: match.personA.birthDateApprox || match.personB.birthDateApprox,
        birthPlace: match.personA.birthPlace || match.personB.birthPlace,
        deathDate: match.personA.deathDate || match.personB.deathDate,
        deathDateApprox: match.personA.deathDateApprox || match.personB.deathDateApprox,
        deathPlace: match.personA.deathPlace || match.personB.deathPlace,
        profession: match.personA.profession || match.personB.profession,
        nationality: match.personA.nationality || match.personB.nationality,
        bio: `${match.personA.bio || ''}\n${match.personB.bio || ''}`.trim(),
        notes: `${match.personA.notes || ''}\n${match.personB.notes || ''}`.trim(),
        aliases: Array.from(new Set([...(match.personA.aliases || []), ...(match.personB.aliases || [])])),
        tags: Array.from(new Set([...(match.personA.tags || []), ...(match.personB.tags || [])])),
        sourceIds: Array.from(new Set([...(match.personA.sourceIds || []), ...(match.personB.sourceIds || [])]))
      };

      await updatePerson(mergedPerson);
      await deletePerson(match.personB.id);

      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 3000);
    } catch (err) {
      console.error('Error merging:', err);
    } finally {
      setMergingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <GitMerge className="w-5 h-5 text-[#F5F2ED]" />
            <h2 className="font-serif font-bold text-lg">
              Detección de Duplicados & Fusión
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          <div className="p-4 bg-[#E5E2D9]/70 rounded-2xl border border-[#D1CEC7] text-xs text-[#434331] space-y-1">
            <div className="font-serif font-bold flex items-center space-x-1.5 text-[#434331]">
              <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
              <span>Algoritmo de Coincidencia Genealógica Activo</span>
            </div>
            <p className="font-serif leading-relaxed text-[#2C2C2C]">
              El sistema analiza similitudes fonéticas, años aproximados de nacimiento, lugares y relaciones para detectar personas potencialmente duplicadas en el árbol.
            </p>
          </div>

          {mergeSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Los registros duplicados han sido fusionados exitosamente en un único perfil enriquecido.</span>
            </div>
          )}

          {duplicateMatches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E2D9] text-[#7C796F] space-y-2">
              <CheckCircle className="w-10 h-10 text-[#5A5A40] mx-auto" />
              <h4 className="font-serif font-bold text-[#434331] text-sm">¡Árbol Limpio y Consistente!</h4>
              <p className="text-xs text-[#9A968A] font-serif italic max-w-sm mx-auto">
                No se han detectado personas duplicadas ni inconsistencias en las identidades del árbol genealógico.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C796F]">
                Coincidencias Encontradas ({duplicateMatches.length})
              </h4>

              {duplicateMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E5E2D9] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A65D47]/15 text-[#A65D47] border border-[#A65D47]/30">
                      Coincidencia {match.confidence}%
                    </span>
                    <span className="text-xs text-[#7C796F] font-serif italic">
                      Motivo: {match.reason}
                    </span>
                  </div>

                  {/* Compare Side by Side */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-[#F5F2ED] border border-[#D1CEC7]">
                      <div className="font-serif font-bold text-[#434331]">
                        {match.personA.firstName} {match.personA.lastName}
                      </div>
                      <div className="text-[11px] text-[#7C796F] mt-1 font-mono">
                        Nac: {match.personA.birthDate || match.personA.birthDateApprox || 's/d'}
                      </div>
                      <div className="text-[11px] text-[#7C796F] truncate">
                        Lugar: {match.personA.birthPlace || 's/d'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2ED] border border-[#D1CEC7]">
                      <div className="font-serif font-bold text-[#434331]">
                        {match.personB.firstName} {match.personB.lastName}
                      </div>
                      <div className="text-[11px] text-[#7C796F] mt-1 font-mono">
                        Nac: {match.personB.birthDate || match.personB.birthDateApprox || 's/d'}
                      </div>
                      <div className="text-[11px] text-[#7C796F] truncate">
                        Lugar: {match.personB.birthPlace || 's/d'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div className="flex justify-end pt-2 border-t border-[#E5E2D9]">
                      <button
                        onClick={() => handleMerge(match)}
                        disabled={mergingId === match.personA.id}
                        className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs transition-colors disabled:opacity-50"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>{mergingId === match.personA.id ? 'Fusionando...' : 'Fusionar en un solo registro'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
