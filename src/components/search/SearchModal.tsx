import React, { useState, useEffect } from 'react';
import { Search, X, User, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { Person } from '../../types';

interface SearchModalProps {
  onClose: () => void;
  onSelectPerson: (person: Person) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  onSelectPerson
}) => {
  const { people, getSanitizedPerson } = useTree();
  const [query, setQuery] = useState('');

  const results = people.filter(p => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName} ${p.maidenName || ''}`.toLowerCase();
    const matchName = fullName.includes(q);
    const matchBirth = (p.birthDate || p.birthDateApprox || '').toLowerCase().includes(q);
    const matchPlace = (p.birthPlace || p.deathPlace || '').toLowerCase().includes(q);
    const matchProf = (p.profession || '').toLowerCase().includes(q);
    const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
    const matchAlias = (p.aliases || []).some(a => a.toLowerCase().includes(q));

    return matchName || matchBirth || matchPlace || matchProf || matchTags || matchAlias;
  });

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col">
        
        {/* Search Bar Input */}
        <div className="relative border-b border-[#E5E2D9] flex items-center px-4 py-3.5 bg-white">
          <Search className="w-5 h-5 text-[#5A5A40] shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido, año, lugar de nacimiento o apodo..."
            className="w-full bg-transparent text-sm text-[#434331] placeholder-[#9A968A] focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#7C796F] hover:text-[#434331] mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-[#F5F2ED] text-[#7C796F] hover:text-[#434331] px-2.5 py-1 rounded-full border border-[#D1CEC7] shrink-0 uppercase tracking-wider font-semibold"
          >
            Esc
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#E5E2D9]">
          {!query.trim() ? (
            <div className="p-8 text-center text-xs text-[#7C796F] font-serif italic">
              Escribe un nombre, fecha histórica, ciudad o etiqueta familiar para buscar en todo el árbol...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7C796F]">
              <p className="font-serif font-bold text-[#434331]">No se encontraron familiares</p>
              <p className="text-[#9A968A] mt-1 font-serif italic">Prueba con otra variante ortográfica o año aproximado.</p>
            </div>
          ) : (
            results.map(rawPerson => {
              const p = getSanitizedPerson(rawPerson);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPerson(rawPerson);
                    onClose();
                  }}
                  className="p-4 hover:bg-white transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={p.avatarUrl || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80`}
                      alt={p.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-[#D1CEC7] shrink-0"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-[#434331] text-sm group-hover:text-[#5A5A40] transition-colors">
                        {p.firstName} {p.middleName || ''} {p.lastName} {p.maidenName ? `(${p.maidenName})` : ''}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#7C796F] mt-0.5 font-mono">
                        {(p.birthDate || p.birthDateApprox) && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#9A968A]" />
                            <span>{p.birthDate || p.birthDateApprox}</span>
                          </span>
                        )}
                        {p.birthPlace && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-[#9A968A]" />
                            <span className="truncate max-w-[140px]">{p.birthPlace}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#9A968A] group-hover:text-[#5A5A40] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Search Modal Footer */}
        {results.length > 0 && (
          <div className="p-3 bg-[#F5F2ED] border-t border-[#E5E2D9] text-[11px] text-[#7C796F] flex items-center justify-between font-mono">
            <span>{results.length} familiares encontrados</span>
            <span>Usa ↵ para abrir ficha</span>
          </div>
        )}
      </div>
    </div>
  );
};
