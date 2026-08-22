import React, { useState, useMemo } from 'react';
import { 
  MapPin, Compass, Users, Calendar
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';

interface MigrationMapViewProps {
  onSelectPersonById: (personId: string) => void;
}

interface GeoPoint {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  x: number; // projected svg 0 - 1000
  y: number; // projected svg 0 - 600
  type: 'origin' | 'destination' | 'milestone';
  year?: string;
  peopleNames: string[];
  description: string;
}

export const MigrationMapView: React.FC<MigrationMapViewProps> = ({
  onSelectPersonById
}) => {
  const { people } = useTree();
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('all');

  // Defined historical migration hubs
  const geoPoints: GeoPoint[] = useMemo(() => [
    {
      id: 'pt-asturias',
      name: 'Oviedo & Gijón (Asturias)',
      country: 'España',
      lat: 43.36,
      lng: -5.84,
      x: 485,
      y: 190,
      type: 'origin',
      year: '1852 — 1880',
      peopleNames: ['Mateo Cantero'],
      description: 'Lugar de nacimiento de Mateo Cantero. Partida en 1880 desde el puerto de Gijón rumbo a América.'
    },
    {
      id: 'pt-genova',
      name: 'Génova (Liguria)',
      country: 'Italia',
      lat: 44.40,
      lng: 8.94,
      x: 525,
      y: 195,
      type: 'origin',
      year: '1858 — 1882',
      peopleNames: ['Rosa Isabel Rossi'],
      description: 'Cuna de la familia Rossi. Embarque en el vapor "Regina Margherita" en 1882.'
    },
    {
      id: 'pt-bsas',
      name: 'Puerto de Buenos Aires',
      country: 'Argentina',
      lat: -34.60,
      lng: -58.38,
      x: 310,
      y: 490,
      type: 'milestone',
      year: '1882 & 1918',
      peopleNames: ['Rosa Rossi', 'Esteban Cantero', 'Martina Cantero'],
      description: 'Principal puerto de desembarco de los inmigrantes y sede de estudios universitarios.'
    },
    {
      id: 'pt-concordia',
      name: 'Concordia (Río Uruguay)',
      country: 'Entre Ríos, Argentina',
      lat: -31.39,
      lng: -58.02,
      x: 315,
      y: 465,
      type: 'destination',
      year: '1882 — Presente',
      peopleNames: ['Mateo Cantero', 'Rosa Rossi', 'Esteban Cantero', 'Julián Cantero'],
      description: 'Asentamiento definitivo del linaje familiar. Fundación de la chacra y almacén de ramos generales.'
    },
    {
      id: 'pt-montevideo',
      name: 'Montevideo',
      country: 'Uruguay',
      lat: -34.90,
      lng: -56.16,
      x: 325,
      y: 492,
      type: 'origin',
      year: '1927',
      peopleNames: ['Ana Beatriz Pérez'],
      description: 'Ciudad natal de Ana Beatriz Pérez antes de su matrimonio con Esteban Cantero.'
    }
  ], []);

  // Defined migration routes
  const migrationRoutes = [
    {
      id: 'route-spain-arg',
      name: 'Ruta Asturiana Trasatlántica (1880)',
      from: 'pt-asturias',
      to: 'pt-concordia',
      color: '#5A5A40', // Olive
      path: 'M 485 190 C 400 280, 240 380, 315 465',
      traveler: 'Mateo Cantero',
      ship: 'Bergantín Santa María (34 días de navegación)'
    },
    {
      id: 'route-italy-arg',
      name: 'Ruta Italiana Ligur (1882)',
      from: 'pt-genova',
      to: 'pt-bsas',
      color: '#A65D47', // Terracotta
      path: 'M 525 195 C 440 300, 260 410, 310 490',
      traveler: 'Rosa Isabel Rossi & Familia',
      ship: 'Vapor Regina Margherita'
    },
    {
      id: 'route-bsas-concordia',
      name: 'Travesía Fluvial Río Uruguay (1882)',
      from: 'pt-bsas',
      to: 'pt-concordia',
      color: '#434331', // Forest Olive
      path: 'M 310 490 Q 305 475, 315 465',
      traveler: 'Familia Rossi & Cantero',
      ship: 'Vapor de rueda fluvial'
    },
    {
      id: 'route-uruguay-concordia',
      name: 'Unión Rioplatense (1956)',
      from: 'pt-montevideo',
      to: 'pt-concordia',
      color: '#A65D47', // Terracotta
      path: 'M 325 492 Q 330 475, 315 465',
      traveler: 'Ana Beatriz Pérez',
      ship: 'Ferry fluvial del Río Uruguay'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-[#FDFBF7] p-6 rounded-3xl border border-[#D1CEC7] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-[#5A5A40]" />
            <h2 className="font-serif text-2xl font-bold text-[#434331]">
              Rutas Migratorias & Lugares de Origen
            </h2>
          </div>
          <p className="text-xs text-[#7C796F] mt-1 font-serif italic">
            Visualización geo-histórica de los desplazamientos que dieron forma al árbol familiar desde Europa hasta el Río de la Plata.
          </p>
        </div>

        {/* Route Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveRouteFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeRouteFilter === 'all'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F5F2ED] text-[#7C796F] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
            }`}
          >
            Todas las Rutas
          </button>
          <button
            onClick={() => setActiveRouteFilter('spain')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeRouteFilter === 'spain'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F5F2ED] text-[#7C796F] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
            }`}
          >
            🇪🇸 España (Asturias)
          </button>
          <button
            onClick={() => setActiveRouteFilter('italy')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeRouteFilter === 'italy'
                ? 'bg-[#A65D47] text-white shadow-2xs'
                : 'bg-[#F5F2ED] text-[#7C796F] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
            }`}
          >
            🇮🇹 Italia (Génova)
          </button>
          <button
            onClick={() => setActiveRouteFilter('uruguay')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeRouteFilter === 'uruguay'
                ? 'bg-[#434331] text-white shadow-2xs'
                : 'bg-[#F5F2ED] text-[#7C796F] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
            }`}
          >
            🇺🇾 Uruguay
          </button>
        </div>
      </div>

      {/* Main Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-[#E5E2D9]/60 rounded-3xl border border-[#D1CEC7] p-4 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          
          {/* Compass Rose Accent */}
          <div className="absolute top-4 right-4 z-10 text-[#7C796F]/50 pointer-events-none">
            <Compass className="w-12 h-12 stroke-1" />
          </div>

          {/* SVG Canvas with Continents and Routes */}
          <div className="relative w-full h-[460px]">
            <svg viewBox="0 0 800 550" className="w-full h-full">
              <defs>
                <radialGradient id="waterGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#F5F2ED" />
                  <stop offset="100%" stopColor="#E5E2D9" />
                </radialGradient>
              </defs>

              {/* Ocean / Background */}
              <rect width="800" height="550" fill="url(#waterGrad)" />

              {/* Europa Stylized Outlines */}
              <path
                d="M 430 140 Q 470 120 530 120 Q 590 140 580 180 Q 560 210 520 220 Q 470 230 450 200 Z"
                fill="#D1CEC7"
                opacity="0.85"
              />
              <path
                d="M 460 170 L 490 170 L 485 220 L 455 215 Z"
                fill="#D1CEC7"
                opacity="0.85"
              />
              {/* América del Sur */}
              <path
                d="M 270 330 Q 330 330 360 380 Q 370 440 340 500 Q 300 530 280 480 Q 250 420 260 370 Z"
                fill="#D1CEC7"
                opacity="0.85"
              />

              {/* Routes */}
              {migrationRoutes.map((route) => {
                const isFiltered = activeRouteFilter !== 'all' && (
                  (activeRouteFilter === 'spain' && !route.id.includes('spain')) ||
                  (activeRouteFilter === 'italy' && !route.id.includes('italy')) ||
                  (activeRouteFilter === 'uruguay' && !route.id.includes('uruguay'))
                );

                if (isFiltered) return null;

                return (
                  <g key={route.id} className="cursor-pointer group">
                    <path
                      d={route.path}
                      fill="none"
                      stroke={route.color}
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="transition-all opacity-85 hover:opacity-100"
                    />
                  </g>
                );
              })}

              {/* Geo Points */}
              {geoPoints.map((pt) => (
                <g
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={selectedPoint?.id === pt.id ? 9 : 6}
                    fill={pt.type === 'origin' ? '#A65D47' : pt.type === 'destination' ? '#5A5A40' : '#434331'}
                    stroke="#FDFBF7"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text
                    x={pt.x + 10}
                    y={pt.y + 4}
                    fontSize="11"
                    fontFamily="Lora, serif"
                    fontWeight="bold"
                    fill="#434331"
                    className="select-none pointer-events-none"
                  >
                    {pt.name.split(' ')[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Map Legend Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#7C796F] pt-2 border-t border-[#D1CEC7]">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#A65D47] inline-block"></span>
                <span>Puntos de Origen (Europa)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#5A5A40] inline-block"></span>
                <span>Destino Familiar (Argentina)</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#9A968A]">Cartografía Histórica</span>
          </div>
        </div>

        {/* Right: Point / Route Detail Card */}
        <div className="bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] p-6 shadow-xs flex flex-col justify-between">
          {selectedPoint ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
                <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedPoint.type === 'origin' ? 'bg-[#A65D47]/15 text-[#A65D47]' : 'bg-[#5A5A40]/15 text-[#5A5A40]'
                }`}>
                  {selectedPoint.type === 'origin' ? 'Punto de Origen' : 'Destino & Asentamiento'}
                </span>
                <span className="font-mono text-xs text-[#7C796F]">{selectedPoint.year}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#434331]">{selectedPoint.name}</h3>
                <p className="text-xs text-[#7C796F] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#9A968A]" />
                  <span>{selectedPoint.country}</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] text-xs text-[#2C2C2C] leading-relaxed font-serif">
                {selectedPoint.description}
              </div>

              <div>
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F] mb-2 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Familiares Vinculados</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPoint.peopleNames.map((name, i) => {
                    const matchedPerson = people.find(p => `${p.firstName} ${p.lastName}`.includes(name) || name.includes(p.firstName));
                    return (
                      <button
                        key={i}
                        onClick={() => matchedPerson && onSelectPersonById(matchedPerson.id)}
                        className="text-xs font-medium text-[#5A5A40] bg-[#F5F2ED] hover:bg-[#E5E2D9] border border-[#D1CEC7] px-3 py-1 rounded-full transition-colors"
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#7C796F]">
              <MapPin className="w-10 h-10 text-[#9A968A] mx-auto mb-2" />
              <h4 className="font-serif font-bold text-[#434331]">Selecciona un puerto o ciudad</h4>
              <p className="text-xs text-[#9A968A] mt-1 font-serif italic">Haz clic en los puntos del mapa para explorar testimonios y barcos.</p>
            </div>
          )}

          {/* Quick Route Summary */}
          <div className="mt-6 pt-4 border-t border-[#E5E2D9] text-xs text-[#7C796F] space-y-2">
            <h5 className="font-sans font-bold uppercase tracking-wider text-[#434331]">Resumen de Travesías</h5>
            {migrationRoutes.map(r => (
              <div key={r.id} className="p-2.5 rounded-xl bg-white border border-[#E5E2D9]">
                <div className="flex items-center justify-between font-serif font-bold text-[#434331]">
                  <span>{r.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                </div>
                <p className="text-[11px] text-[#7C796F] mt-0.5">{r.traveler} — {r.ship}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
