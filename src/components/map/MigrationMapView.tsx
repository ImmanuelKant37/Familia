import React, { useState, useMemo } from 'react';
import { 
  MapPin, Compass, Users, Calendar, Filter, Navigation, 
  Home, Heart, Sparkles, Search, ChevronRight, User, ExternalLink,
  Plus
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { extractFamilyGeoData, FamiliarGeoPoint, FamiliarRoute } from '../../utils/geoUtils';
import { Person } from '../../types';

interface MigrationMapViewProps {
  onSelectPersonById: (personId: string) => void;
}

export const MigrationMapView: React.FC<MigrationMapViewProps> = ({
  onSelectPersonById
}) => {
  const { people, events } = useTree();

  const [selectedPoint, setSelectedPoint] = useState<FamiliarGeoPoint | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FamiliarRoute | null>(null);
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('all');
  const [pointTypeFilter, setPointTypeFilter] = useState<'all' | 'origin' | 'residence' | 'destination'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically extract points and routes based exclusively on real tree people and events
  const { geoPoints, routes } = useMemo(() => {
    return extractFamilyGeoData(people, events);
  }, [people, events]);

  // Filtered routes based on selected person
  const filteredRoutes = useMemo(() => {
    if (selectedPersonFilter === 'all') return routes;
    return routes.filter(r => r.personId === selectedPersonFilter);
  }, [routes, selectedPersonFilter]);

  // Filtered points based on point type & search
  const filteredPoints = useMemo(() => {
    let pts = geoPoints;

    if (pointTypeFilter !== 'all') {
      pts = pts.filter(p => p.type === pointTypeFilter || p.type === 'mixed');
    }

    if (selectedPersonFilter !== 'all') {
      pts = pts.filter(p => p.people.some(item => item.person.id === selectedPersonFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pts = pts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.country.toLowerCase().includes(q) ||
        p.people.some(item => `${item.person.firstName} ${item.person.lastName || ''}`.toLowerCase().includes(q))
      );
    }

    return pts;
  }, [geoPoints, pointTypeFilter, selectedPersonFilter, searchQuery]);

  // People with registered places
  const peopleWithLocations = useMemo(() => {
    return people.filter(p => p.birthPlace || p.deathPlace || events.some(e => e.personIds && e.personIds.includes(p.id) && e.place));
  }, [people, events]);

  // Selected person detail if filtering by a single person
  const filteredPerson = useMemo(() => {
    if (selectedPersonFilter === 'all') return null;
    return people.find(p => p.id === selectedPersonFilter) || null;
  }, [people, selectedPersonFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FDFBF7] dark:bg-[#1E293B] p-6 rounded-3xl border border-[#D1CEC7] dark:border-[#334155] shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 dark:bg-amber-500/10 flex items-center justify-center text-[#5A5A40] dark:text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#434331] dark:text-[#F1F5F9]">
                Rutas y Geografía Familiar
              </h2>
              <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] font-serif italic">
                Cartografía interactiva basada en los lugares de nacimiento (origen), vivencia y defunción de los familiares.
              </p>
            </div>
          </div>
        </div>

        {/* Global Statistics Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] px-3.5 py-1.5 rounded-2xl flex items-center space-x-2 text-xs text-[#434331] dark:text-[#E2E8F0]">
            <MapPin className="w-3.5 h-3.5 text-[#A65D47]" />
            <span><strong>{geoPoints.length}</strong> Lugares Registrados</span>
          </div>

          <div className="bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] px-3.5 py-1.5 rounded-2xl flex items-center space-x-2 text-xs text-[#434331] dark:text-[#E2E8F0]">
            <Navigation className="w-3.5 h-3.5 text-[#5A5A40] dark:text-amber-400" />
            <span><strong>{routes.length}</strong> Trayectorias Familiares</span>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#D1CEC7] dark:border-[#334155] shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Person Selector Dropdown */}
        <div className="flex items-center space-x-2 min-w-[240px]">
          <User className="w-4 h-4 text-[#5A5A40] dark:text-amber-400 shrink-0" />
          <select
            value={selectedPersonFilter}
            onChange={(e) => {
              setSelectedPersonFilter(e.target.value);
              setSelectedRoute(null);
            }}
            className="w-full bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl px-3 py-1.5 text-xs text-[#2C2C2C] dark:text-[#F1F5F9] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
          >
            <option value="all">🗺️ Todos los Familiares ({peopleWithLocations.length} con lugares)</option>
            {peopleWithLocations.map(p => (
              <option key={p.id} value={p.id}>
                👤 {p.firstName} {p.lastName || ''} {p.birthPlace ? `(Nac: ${p.birthPlace})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Location Type Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setPointTypeFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
              pointTypeFilter === 'all'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:bg-[#E5E2D9] border border-[#D1CEC7] dark:border-[#334155]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setPointTypeFilter('origin')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors flex items-center space-x-1 cursor-pointer ${
              pointTypeFilter === 'origin'
                ? 'bg-[#A65D47] text-white shadow-2xs'
                : 'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:bg-[#E5E2D9] border border-[#D1CEC7] dark:border-[#334155]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#A65D47] inline-block"></span>
            <span>Nacimiento (Origen)</span>
          </button>
          <button
            onClick={() => setPointTypeFilter('residence')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors flex items-center space-x-1 cursor-pointer ${
              pointTypeFilter === 'residence'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:bg-[#E5E2D9] border border-[#D1CEC7] dark:border-[#334155]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block"></span>
            <span>Vivencia & Eventos</span>
          </button>
          <button
            onClick={() => setPointTypeFilter('destination')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors flex items-center space-x-1 cursor-pointer ${
              pointTypeFilter === 'destination'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:bg-[#E5E2D9] border border-[#D1CEC7] dark:border-[#334155]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#059669] inline-block"></span>
            <span>Defunción (Descanso)</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-[#9A968A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad o familiar..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-xl text-xs text-[#2C2C2C] dark:text-[#F1F5F9] placeholder-[#9A968A] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
          />
        </div>
      </div>

      {/* Main Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-[#E5E2D9]/70 dark:bg-[#0F172A] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] p-4 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          
          {/* Compass Accent */}
          <div className="absolute top-4 right-4 z-10 text-[#7C796F]/40 dark:text-[#94A3B8]/30 pointer-events-none">
            <Compass className="w-14 h-14 stroke-1" />
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[480px]">
            <svg viewBox="0 0 800 550" className="w-full h-full">
              <defs>
                <radialGradient id="waterGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#F5F2ED" className="dark:stop-[#1E293B]" />
                  <stop offset="100%" stopColor="#E5E2D9" className="dark:stop-[#0F172A]" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean / Background */}
              <rect width="800" height="550" fill="url(#waterGrad)" className="dark:fill-[#0B1120]" />

              {/* Continents Outlines (Simplified stylized world geometry) */}
              {/* Europa & Asia Menor */}
              <path
                d="M 390 120 Q 450 90 530 100 Q 610 120 620 180 Q 560 210 500 220 Q 440 230 420 190 Z"
                className="fill-[#D1CEC7]/80 dark:fill-[#1E293B]"
              />
              {/* Península Ibérica & Italia */}
              <path
                d="M 410 160 L 460 160 L 455 210 L 415 205 Z"
                className="fill-[#D1CEC7] dark:fill-[#334155]"
              />
              <path
                d="M 465 175 L 485 180 L 490 215 L 475 210 Z"
                className="fill-[#D1CEC7] dark:fill-[#334155]"
              />
              {/* América del Sur */}
              <path
                d="M 250 310 Q 320 310 350 360 Q 360 420 330 490 Q 290 520 270 470 Q 240 400 250 350 Z"
                className="fill-[#D1CEC7] dark:fill-[#1E293B]"
              />
              {/* América del Norte */}
              <path
                d="M 170 120 Q 240 100 300 130 Q 310 200 270 250 Q 220 270 180 230 Q 150 180 170 120 Z"
                className="fill-[#D1CEC7]/70 dark:fill-[#1E293B]/60"
              />

              {/* Dynamic Family Routes (Curved Splines connecting birth, life, and death) */}
              {filteredRoutes.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <g 
                    key={route.id} 
                    onClick={() => setSelectedRoute(route)}
                    className="cursor-pointer group"
                  >
                    {/* Wider transparent hit area for easy clicking */}
                    <path
                      d={route.path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                    />
                    {/* Animated dashed trajectory line */}
                    <path
                      d={route.path}
                      fill="none"
                      stroke={route.color}
                      strokeWidth={isSelected ? "4" : "2.5"}
                      strokeDasharray={isSelected ? "none" : "6 4"}
                      className="transition-all opacity-85 group-hover:opacity-100 group-hover:stroke-width-4"
                    />
                  </g>
                );
              })}

              {/* Dynamic Family GeoPoints */}
              {filteredPoints.map((pt) => {
                const isSelected = selectedPoint?.id === pt.id;
                const pointColor = 
                  pt.type === 'origin' ? '#A65D47' : 
                  pt.type === 'destination' ? '#059669' : 
                  pt.type === 'residence' ? '#2563EB' : '#5A5A40';

                return (
                  <g
                    key={pt.id}
                    onClick={() => {
                      setSelectedPoint(pt);
                      setSelectedRoute(null);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Halo on hover or selection */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 16 : 10}
                      fill={pointColor}
                      opacity={isSelected ? 0.35 : 0.15}
                      className="transition-all group-hover:scale-150"
                    />
                    {/* Core Point Marker */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 8 : 5.5}
                      fill={pointColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125 shadow-md"
                    />
                    {/* Point Label */}
                    <text
                      x={pt.x + 8}
                      y={pt.y + 3}
                      fontSize="10"
                      fontFamily="Lora, serif"
                      fontWeight="bold"
                      fill="#2C2C2C"
                      className="select-none pointer-events-none dark:fill-[#F1F5F9] drop-shadow-xs"
                    >
                      {pt.name.split(',')[0]} ({pt.people.length})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#7C796F] dark:text-[#94A3B8] pt-3 border-t border-[#D1CEC7] dark:border-[#334155] gap-2">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#A65D47] inline-block border border-white"></span>
                <span>Origen / Nacimiento</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#2563EB] inline-block border border-white"></span>
                <span>Vivencia / Residencia</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#059669] inline-block border border-white"></span>
                <span>Defunción / Descanso</span>
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#9A968A]">Basado en Datos Reales de Familiares</span>
          </div>
        </div>

        {/* Right Sidebar: Contextual Family Detail Card */}
        <div className="bg-[#FDFBF7] dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] p-5 shadow-xs flex flex-col justify-between space-y-4">
          
          {/* 1. Point Selected */}
          {selectedPoint ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] dark:border-[#334155] pb-3">
                <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedPoint.type === 'origin' ? 'bg-[#A65D47]/15 text-[#A65D47] dark:text-rose-400' : 
                  selectedPoint.type === 'destination' ? 'bg-[#059669]/15 text-[#059669] dark:text-emerald-400' :
                  selectedPoint.type === 'residence' ? 'bg-[#2563EB]/15 text-[#2563EB] dark:text-blue-400' :
                  'bg-[#5A5A40]/15 text-[#5A5A40] dark:text-amber-400'
                }`}>
                  {selectedPoint.type === 'origin' ? 'Lugar de Nacimiento (Origen)' : 
                   selectedPoint.type === 'destination' ? 'Lugar de Defunción (Destino)' : 
                   selectedPoint.type === 'residence' ? 'Lugar de Vivencia / Residencia' : 'Lugar Mixto Familiar'}
                </span>
                <span className="font-mono text-xs text-[#7C796F] dark:text-[#94A3B8]">
                  {selectedPoint.people.length} familiar(es)
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#434331] dark:text-[#F1F5F9]">
                  {selectedPoint.name}
                </h3>
                {selectedPoint.country && (
                  <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9A968A]" />
                    <span>{selectedPoint.country}</span>
                  </p>
                )}
              </div>

              {/* Relatives Linked to this Place */}
              <div className="space-y-2">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Familiares en este lugar:</span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedPoint.people.map((item, i) => (
                    <div 
                      key={i}
                      className="p-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="font-serif font-bold text-xs text-[#434331] dark:text-[#F1F5F9] flex items-center space-x-1.5">
                          <span>{item.person.firstName} {item.person.lastName || ''}</span>
                        </div>
                        <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] flex items-center space-x-1">
                          <span className={`px-1.5 py-0.2 rounded-md font-semibold text-[9px] ${
                            item.role === 'birth' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300' :
                            item.role === 'death' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {item.role === 'birth' ? '🌟 Nacimiento' : item.role === 'death' ? '✝️ Defunción' : '🏠 Vivencia'}
                          </span>
                          {item.year && <span>({item.year})</span>}
                          {item.eventTitle && <span className="italic truncate max-w-[120px]">- {item.eventTitle}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPersonById(item.person.id)}
                        className="text-xs font-semibold text-[#5A5A40] dark:text-amber-400 hover:underline flex items-center space-x-0.5 p-1 cursor-pointer"
                        title="Ver ficha completa"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedRoute ? (
            /* 2. Route Selected */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] dark:border-[#334155] pb-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5A5A40]/15 text-[#5A5A40] dark:text-amber-400">
                  Ruta de Vida Familiar
                </span>
                <span className="font-mono text-xs text-[#7C796F] dark:text-[#94A3B8]">
                  {selectedRoute.startYear || ''} {selectedRoute.endYear ? `— ${selectedRoute.endYear}` : ''}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#434331] dark:text-[#F1F5F9]">
                  {selectedRoute.person.firstName} {selectedRoute.person.lastName || ''}
                </h3>
                <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] mt-1 font-serif">
                  {selectedRoute.description}
                </p>
              </div>

              {/* Step-by-step life trajectory */}
              <div className="space-y-2 bg-white dark:bg-[#0F172A] p-3.5 rounded-2xl border border-[#E5E2D9] dark:border-[#334155]">
                <h4 className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#434331] dark:text-[#F1F5F9] mb-2">
                  Etapas Geográficas:
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Origin */}
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#A65D47] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-[#A65D47] dark:text-rose-400 block text-[11px]">
                        🌟 Origen / Nacimiento:
                      </span>
                      <span className="font-serif text-[#2C2C2C] dark:text-[#E2E8F0]">
                        {selectedRoute.originPoint.name}
                      </span>
                      {selectedRoute.person.birthDate && (
                        <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] block">
                          Año: {selectedRoute.person.birthDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Waypoints */}
                  {selectedRoute.waypointPoints?.map((wp, wIdx) => (
                    <div key={wIdx} className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {wIdx + 2}
                      </span>
                      <div>
                        <span className="font-bold text-[#2563EB] dark:text-blue-400 block text-[11px]">
                          🏠 Vivencia / Evento:
                        </span>
                        <span className="font-serif text-[#2C2C2C] dark:text-[#E2E8F0]">
                          {wp.name}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Destination */}
                  {selectedRoute.destinationPoint && (
                    <div className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {(selectedRoute.waypointPoints?.length || 0) + 2}
                      </span>
                      <div>
                        <span className="font-bold text-[#059669] dark:text-emerald-400 block text-[11px]">
                          ✝️ Defunción / Destino:
                        </span>
                        <span className="font-serif text-[#2C2C2C] dark:text-[#E2E8F0]">
                          {selectedRoute.destinationPoint.name}
                        </span>
                        {selectedRoute.person.deathDate && (
                          <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] block">
                            Año: {selectedRoute.person.deathDate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectPersonById(selectedRoute.person.id)}
                    className="w-full bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold py-1.5 rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Ver Perfil de {selectedRoute.person.firstName}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : filteredPerson ? (
            /* 3. Filtered Single Person Overview */
            <div className="space-y-4">
              <div className="flex items-center space-x-3 border-b border-[#E5E2D9] dark:border-[#334155] pb-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white font-serif font-bold text-base flex items-center justify-center">
                  {filteredPerson.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#434331] dark:text-[#F1F5F9]">
                    {filteredPerson.firstName} {filteredPerson.lastName || ''}
                  </h3>
                  <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                    {filteredPerson.birthDate ? `*${filteredPerson.birthDate}` : ''} {filteredPerson.deathDate ? `— †${filteredPerson.deathDate}` : ''}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {filteredPerson.birthPlace && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E5E2D9] dark:border-[#334155]">
                    <span className="text-[10px] font-bold uppercase text-[#A65D47] dark:text-rose-400 block">
                      🌟 Origen / Nacimiento:
                    </span>
                    <span className="font-serif text-sm">{filteredPerson.birthPlace}</span>
                  </div>
                )}

                {filteredPerson.deathPlace && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E5E2D9] dark:border-[#334155]">
                    <span className="text-[10px] font-bold uppercase text-[#059669] dark:text-emerald-400 block">
                      ✝️ Defunción / Descanso:
                    </span>
                    <span className="font-serif text-sm">{filteredPerson.deathPlace}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectPersonById(filteredPerson.id)}
                className="w-full bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
              >
                Abrir Ficha Genealógica
              </button>
            </div>
          ) : (
            /* 4. Default Prompt */
            <div className="text-center py-8 text-[#7C796F] dark:text-[#94A3B8] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E5E2D9]/70 dark:bg-[#334155] flex items-center justify-center mx-auto text-[#5A5A40] dark:text-amber-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#434331] dark:text-[#F1F5F9]">
                  Explora las Rutas de tus Familiares
                </h4>
                <p className="text-xs text-[#9A968A] mt-1 font-serif italic max-w-xs mx-auto">
                  Haz clic en cualquier punto del mapa o selecciona un familiar para ver su trayectoria de vida desde su origen hasta su descanso.
                </p>
              </div>

              {geoPoints.length === 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 text-left">
                  <p className="font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Añade lugares a tus familiares:</span>
                  </p>
                  <p className="text-[11px] mt-1">
                    Edita una tarjeta de familiar y escribe su <strong>Lugar de Nacimiento</strong> y <strong>Lugar de Defunción</strong> para que sus rutas aparezcan trazadas automáticamente en este mapa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Trajectory List Summary */}
          {routes.length > 0 && (
            <div className="pt-3 border-t border-[#E5E2D9] dark:border-[#334155] text-xs text-[#7C796F] dark:text-[#94A3B8] space-y-2">
              <h5 className="font-sans font-bold uppercase tracking-wider text-[#434331] dark:text-[#F1F5F9] text-[10px]">
                Trayectorias Detectadas ({routes.length}):
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {routes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRoute(r);
                      setSelectedPoint(null);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      selectedRoute?.id === r.id 
                        ? 'bg-[#5A5A40]/10 border-[#5A5A40] dark:border-amber-400'
                        : 'bg-white dark:bg-[#0F172A] border-[#E5E2D9] dark:border-[#334155] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-serif font-bold text-[#434331] dark:text-[#F1F5F9] truncate">
                        {r.person.firstName} {r.person.lastName || ''}
                      </div>
                      <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] truncate">
                        {r.originPoint.name.split(',')[0]} ➔ {r.destinationPoint?.name.split(',')[0]}
                      </div>
                    </div>
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: r.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

