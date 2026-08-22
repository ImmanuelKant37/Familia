import React, { useState, useMemo } from 'react';
import { 
  Calendar, MapPin, Users, Plus, Filter, 
  ArrowRight, X, Trash2
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { EventType } from '../../types';

interface TimelineViewProps {
  onSelectPersonById: (personId: string) => void;
  onOpenNewEvent?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  onSelectPersonById
}) => {
  const { events, people, addEvent, deleteEvent, canEdit } = useTree();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event Form State
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState<EventType>('migration');
  const [evDate, setEvDate] = useState('');
  const [evPlace, setEvPlace] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evPersonId, setEvPersonId] = useState('');

  // Synthesize events from people's births and deaths + direct events
  const allChronologicalEvents = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      dateStr: string;
      year: number;
      type: EventType;
      place?: string;
      description?: string;
      personIds: string[];
    }> = [];

    // 1. Explicit events
    events.forEach(e => {
      const year = parseInt(e.date?.slice(0, 4) || e.dateApprox?.match(/\b\d{4}\b/)?.[0] || '1900', 10);
      list.push({
        id: e.id,
        title: e.title,
        dateStr: e.date || e.dateApprox || 'Fecha aproximada',
        year,
        type: e.type,
        place: e.place,
        description: e.description,
        personIds: e.personIds || []
      });
    });

    // 2. Add births and deaths from people records
    people.forEach(p => {
      if (p.birthDate || p.birthDateApprox) {
        const year = parseInt(p.birthDate?.slice(0, 4) || p.birthDateApprox?.match(/\b\d{4}\b/)?.[0] || '1900', 10);
        list.push({
          id: `birth-${p.id}`,
          title: `Nacimiento de ${p.firstName} ${p.lastName}`,
          dateStr: p.birthDate || p.birthDateApprox || '',
          year,
          type: 'birth',
          place: p.birthPlace,
          description: p.profession ? `Profesión: ${p.profession}` : undefined,
          personIds: [p.id]
        });
      }

      if (p.deathDate || (p.deathDateApprox && !p.isLiving)) {
        const year = parseInt(p.deathDate?.slice(0, 4) || p.deathDateApprox?.match(/\b\d{4}\b/)?.[0] || '1950', 10);
        list.push({
          id: `death-${p.id}`,
          title: `Fallecimiento de ${p.firstName} ${p.lastName}`,
          dateStr: p.deathDate || p.deathDateApprox || '',
          year,
          type: 'death',
          place: p.deathPlace,
          personIds: [p.id]
        });
      }
    });

    // Sort chronologically ascending
    return list.sort((a, b) => a.year - b.year);
  }, [events, people]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allChronologicalEvents.filter(ev => {
      if (selectedType !== 'all' && ev.type !== selectedType) return false;
      if (selectedPerson !== 'all' && !ev.personIds.includes(selectedPerson)) return false;
      return true;
    });
  }, [allChronologicalEvents, selectedType, selectedPerson]);

  // Group events by decade
  const decadeGroups = useMemo(() => {
    const groups: { [key: string]: typeof filteredEvents } = {};
    filteredEvents.forEach(ev => {
      const decade = Math.floor(ev.year / 10) * 10;
      const key = `${decade}s`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    await addEvent({
      title: evTitle.trim(),
      type: evType,
      date: evDate || undefined,
      place: evPlace.trim() || undefined,
      description: evDesc.trim() || undefined,
      personIds: evPersonId ? [evPersonId] : [],
      certainty: 'confirmed'
    });
    setShowAddEventModal(false);
    setEvTitle('');
    setEvPlace('');
    setEvDesc('');
  };

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'birth': return 'bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30';
      case 'marriage': return 'bg-[#A65D47]/15 text-[#A65D47] border-[#A65D47]/30';
      case 'immigration':
      case 'emigration':
      case 'migration': return 'bg-[#A65D47]/20 text-[#8e4f3c] border-[#A65D47]/40';
      case 'education': return 'bg-[#E5E2D9] text-[#434331] border-[#D1CEC7]';
      case 'death': return 'bg-[#E5E2D9] text-[#7C796F] border-[#D1CEC7]';
      default: return 'bg-[#F5F2ED] text-[#434331] border-[#D1CEC7]';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#FDFBF7] p-5 rounded-3xl border border-[#D1CEC7] shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#434331]">
            Línea de Tiempo Familiar
          </h2>
          <p className="text-xs text-[#7C796F] mt-1 font-serif italic">
            Recorrido cronológico de generaciones, migraciones e hitos históricos familiares.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-[#7C796F]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-[#D1CEC7] rounded-full px-3 py-1.5 bg-[#F5F2ED] text-[#434331] focus:outline-none"
            >
              <option value="all">Todos los Eventos</option>
              <option value="birth">Nacimientos</option>
              <option value="marriage">Matrimonios</option>
              <option value="migration">Migraciones & Viajes</option>
              <option value="education">Estudios & Trabajo</option>
              <option value="death">Fallecimientos</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-[#7C796F]" />
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="border border-[#D1CEC7] rounded-full px-3 py-1.5 bg-[#F5F2ED] text-[#434331] focus:outline-none max-w-[160px]"
            >
              <option value="all">Todas las personas</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddEventModal(true)}
              className="bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center space-x-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Evento</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-12 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-[#5A5A40]/30">
        {(Object.entries(decadeGroups) as [string, Array<any>][]).map(([decade, decEvents]) => (
          <div key={decade} className="relative space-y-6">
            
            {/* Decade Header Flag */}
            <div className="flex items-center space-x-3">
              <span className="relative z-10 font-serif font-bold text-sm bg-[#5A5A40] text-[#FDFBF7] px-4 py-1.5 rounded-full shadow-sm">
                Década de {decade}
              </span>
              <div className="h-px bg-[#D1CEC7] flex-1"></div>
            </div>

            {/* Decade Events */}
            <div className="space-y-4 pl-8">
              {decEvents.map(ev => {
                const involvedPeople = people.filter(p => ev.personIds.includes(p.id));

                return (
                  <div
                    key={ev.id}
                    className="relative bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-2xs hover:shadow-md transition-all group"
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[39px] top-6 w-4 h-4 rounded-full bg-[#5A5A40] border-4 border-[#FDFBF7] shadow-xs"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[11px] font-sans font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getEventBadge(ev.type)} capitalize`}>
                          {ev.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#434331]">
                          {ev.dateStr}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {ev.place && (
                          <div className="flex items-center space-x-1 text-xs text-[#7C796F]">
                            <MapPin className="w-3.5 h-3.5 text-[#9A968A]" />
                            <span>{ev.place}</span>
                          </div>
                        )}
                        {!ev.id.startsWith('birth-') && !ev.id.startsWith('death-') && canEdit && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el evento "${ev.title}"?`)) {
                                deleteEvent(ev.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#434331] mt-2">
                      {ev.title}
                    </h4>

                    {ev.description && (
                      <p className="text-xs text-[#7C796F] mt-1.5 leading-relaxed font-serif">
                        {ev.description}
                      </p>
                    )}

                    {/* Involved People Pills */}
                    {involvedPeople.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E5E2D9] flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A968A]">Relacionado con:</span>
                        {involvedPeople.map(p => (
                          <button
                            key={p.id}
                            onClick={() => onSelectPersonById(p.id)}
                            className="inline-flex items-center space-x-1 text-xs font-medium text-[#5A5A40] bg-[#F5F2ED] hover:bg-[#E5E2D9] border border-[#D1CEC7] px-2.5 py-1 rounded-full transition-colors group/btn"
                          >
                            <span>{p.firstName} {p.lastName}</span>
                            <ArrowRight className="w-3 h-3 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl p-6 max-w-md w-full border border-[#D1CEC7] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E2D9]">
              <h3 className="font-serif font-bold text-lg text-[#434331]">Registrar Nuevo Acontecimiento</h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-[#7C796F] hover:text-[#434331] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Título del Evento *</label>
                <input
                  type="text"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Ej: Emigración desde Santander a Buenos Aires"
                  required
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Tipo de Evento</label>
                  <select
                    value={evType}
                    onChange={(e) => setEvType(e.target.value as EventType)}
                    className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  >
                    <option value="migration">Migración / Viaje</option>
                    <option value="marriage">Matrimonio</option>
                    <option value="birth">Nacimiento</option>
                    <option value="education">Estudios / Carrera</option>
                    <option value="military">Servicio Militar / Guerra</option>
                    <option value="death">Fallecimiento</option>
                    <option value="other">Otro Suceso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Fecha (o Año)</label>
                  <input
                    type="text"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    placeholder="Ej: 1912 ó 1912-04-14"
                    className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Lugar</label>
                <input
                  type="text"
                  value={evPlace}
                  onChange={(e) => setEvPlace(e.target.value)}
                  placeholder="Ej: Puerto de Génova, Italia"
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Persona Asociada</label>
                <select
                  value={evPersonId}
                  onChange={(e) => setEvPersonId(e.target.value)}
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  <option value="">Seleccionar familiar (opcional)</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-1">Descripción & Detalles</label>
                <textarea
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  placeholder="Información sobre el barco, testigos o anécdotas..."
                  rows={3}
                  className="w-full text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
