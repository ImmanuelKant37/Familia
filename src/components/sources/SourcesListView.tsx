import React, { useState } from 'react';
import { 
  BookOpen, Plus, ExternalLink, 
  Search, Shield, MapPin, FileText, UserCheck, X, Trash2
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { CertaintyLevel } from '../../types';

interface SourcesListViewProps {
  onSelectPersonById: (personId: string) => void;
}

export const SourcesListView: React.FC<SourcesListViewProps> = ({
  onSelectPersonById
}) => {
  const { sources, people, addSource, deleteSource, canEdit } = useTree();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New source form state
  const [srcTitle, setSrcTitle] = useState('');
  const [srcRepo, setSrcRepo] = useState('');
  const [srcCitation, setSrcCitation] = useState('');
  const [srcUrl, setSrcUrl] = useState('');
  const [srcConfidence, setSrcConfidence] = useState<CertaintyLevel>('confirmed');
  const [srcNotes, setSrcNotes] = useState('');

  const filteredSources = sources.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.repository?.toLowerCase().includes(search.toLowerCase()) ||
    s.citation?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcTitle.trim()) return;

    await addSource({
      title: srcTitle.trim(),
      repository: srcRepo.trim() || undefined,
      citation: srcCitation.trim() || undefined,
      url: srcUrl.trim() || undefined,
      confidence: srcConfidence,
      notes: srcNotes.trim() || undefined
    });

    setShowAddModal(false);
    setSrcTitle('');
    setSrcRepo('');
    setSrcCitation('');
    setSrcUrl('');
    setSrcNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#FDFBF7] p-6 rounded-3xl border border-[#D1CEC7] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#5A5A40]" />
            <h2 className="font-serif text-2xl font-bold text-[#434331]">
              Fuentes & Repositorios Documentales
            </h2>
          </div>
          <p className="text-xs text-[#7C796F] mt-1 font-serif italic">
            Registro de actas parroquiales, censos nacionales, libros de navegación y archivos diocesanos que respaldan el árbol genealógico.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar fuente..."
              className="pl-8 pr-3 py-1.5 bg-[#F5F2ED] border border-[#D1CEC7] rounded-full text-xs text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none w-44 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-[#9A968A] absolute left-2.5 top-2.5" />
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full flex items-center space-x-1 shadow-2xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Fuente</span>
            </button>
          )}
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSources.map((src) => {
          const associatedPeople = people.filter(p => p.sourceIds?.includes(src.id));

          return (
            <div key={src.id} className="bg-white rounded-3xl border border-[#E5E2D9] p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5A5A40]/15 text-[#434331] border border-[#5A5A40]/30">
                    {src.confidence === 'confirmed' ? '✓ Fuente Primaria' : src.confidence}
                  </span>
                  <div className="flex items-center space-x-2">
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#5A5A40] hover:underline flex items-center space-x-1"
                      >
                        <span>Ver enlace</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la fuente "${src.title}"?`)) {
                            deleteSource(src.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Eliminar fuente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-[#434331]">{src.title}</h3>

                {src.repository && (
                  <p className="text-xs text-[#7C796F] mt-1.5 flex items-center space-x-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-[#9A968A] shrink-0" />
                    <span><strong>Archivo:</strong> {src.repository}</span>
                  </p>
                )}

                {src.citation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#F5F2ED] border border-[#D1CEC7] text-[11px] font-mono text-[#434331]">
                    {src.citation}
                  </div>
                )}

                {src.notes && (
                  <p className="text-xs text-[#2C2C2C] mt-2 italic font-serif leading-relaxed">
                    {src.notes}
                  </p>
                )}
              </div>

              {/* Linked People */}
              <div className="mt-4 pt-3 border-t border-[#E5E2D9]">
                <div className="flex items-center space-x-1 text-xs text-[#7C796F] mb-1.5 font-sans font-bold uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-[#9A968A]" />
                  <span>Personas respaldadas ({associatedPeople.length})</span>
                </div>
                {associatedPeople.length === 0 ? (
                  <p className="text-[11px] text-[#9A968A] italic">General del árbol familiar</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {associatedPeople.map(p => (
                      <button
                        key={p.id}
                        onClick={() => onSelectPersonById(p.id)}
                        className="text-[11px] bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#5A5A40] border border-[#D1CEC7] px-2.5 py-0.5 rounded-full transition-colors font-medium"
                      >
                        {p.firstName} {p.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl p-6 max-w-lg w-full border border-[#D1CEC7] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E2D9]">
              <h3 className="font-serif font-bold text-lg text-[#434331]">Registrar Nueva Fuente Histórica</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7C796F] hover:text-[#434331] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Título de la Fuente *</label>
                <input
                  type="text"
                  value={srcTitle}
                  onChange={(e) => setSrcTitle(e.target.value)}
                  placeholder="Ej: Registro Parroquial de San Juan Bautista, Tomo IV"
                  required
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Repositorio / Institución</label>
                <input
                  type="text"
                  value={srcRepo}
                  onChange={(e) => setSrcRepo(e.target.value)}
                  placeholder="Ej: Archivo Histórico de Asturias, España"
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Cita Bibliográfica / Folio</label>
                <input
                  type="text"
                  value={srcCitation}
                  onChange={(e) => setSrcCitation(e.target.value)}
                  placeholder="Ej: Libro de Bautismos 1850-1860, Folio 112, Acta 43"
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Grado de Certeza</label>
                  <select
                    value={srcConfidence}
                    onChange={(e) => setSrcConfidence(e.target.value as CertaintyLevel)}
                    className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  >
                    <option value="confirmed">Confirmado (Primaria)</option>
                    <option value="probable">Probable (Secundaria)</option>
                    <option value="estimated">Estimado (Oral/Tradición)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Enlace / URL (Opcional)</label>
                  <input
                    type="url"
                    value={srcUrl}
                    onChange={(e) => setSrcUrl(e.target.value)}
                    placeholder="https://familysearch..."
                    className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Notas & Transcripción</label>
                <textarea
                  value={srcNotes}
                  onChange={(e) => setSrcNotes(e.target.value)}
                  placeholder="Texto literal del documento o anotaciones genealógicas..."
                  rows={3}
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  Guardar Fuente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
