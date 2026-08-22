/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, Filter, Globe, Lock, Shield, Users, 
  MapPin, GitBranch, Sparkles, UserPlus, ArrowRight, 
  CheckCircle, FileText, Image as ImageIcon, BookOpen, 
  X, Compass, ShieldCheck, HeartHandshake, Eye, Clock, 
  ChevronRight, RefreshCw, Key
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { useAuth } from '../../context/AuthContext';
import { FamilySummary, FamilyVisibility } from '../../types/familyLobby';

export const FamilyLobbyModal: React.FC = () => {
  const { 
    filteredFamilies, 
    filterOptions, 
    setFilterOptions, 
    smartMatches,
    openPublicProfile,
    openRequestAccessModal,
    openConnectFamiliesModal,
    openMyAccessesModal,
    openPermissionsManager,
    closeModals,
    pendingRequestsCount
  } = useFamilyLobby();

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'smart_matches'>('discover');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const countries = ['all', 'Argentina', 'España', 'Uruguay', 'Italia', 'México'];
  const regions = ['all', 'Entre Ríos', 'Santa Fe', 'Córdoba', 'Buenos Aires', 'Mendoza', 'Andalucía'];

  const handleResetFilters = () => {
    setFilterOptions({
      searchQuery: '',
      surname: '',
      country: 'all',
      region: 'all',
      minGenerations: 0,
      minPeople: 0,
      visibility: 'all',
      onlyOpenRequests: false
    });
  };

  const getVisibilityBadge = (visibility: FamilyVisibility) => {
    switch (visibility) {
      case 'public':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Globe className="w-3 h-3 mr-1" />
            Pública
          </span>
        );
      case 'public_restricted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Pública Restringida
          </span>
        );
      case 'discoverable':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Eye className="w-3 h-3 mr-1" />
            Descubrible
          </span>
        );
      case 'private':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            <Lock className="w-3 h-3 mr-1" />
            Privada
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-6xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Header Bar */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Compass className="w-5 h-5 text-[#F5F2ED]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white leading-tight">
                Lobby de Familias & Descubrimiento
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8] font-sans">
                Explora árboles genealógicos, encuentra tus raíces y colabora con ramas familiares
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openMyAccessesModal()}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/20"
              title="Ver mis accesos y permisos"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Mis Accesos</span>
            </button>

            <button
              onClick={() => openPermissionsManager()}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Panel de solicitudes y permisos del propietario"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Panel Propietario</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={closeModals}
              className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#E5E2D9] dark:border-[#334155] bg-[#F5F2ED] dark:bg-[#1E293B]/70 px-4 sm:px-6 pt-2 shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
                activeTab === 'discover'
                  ? 'border-[#5A5A40] dark:border-amber-400 text-[#434331] dark:text-white'
                  : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explorar Familias ({filteredFamilies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('smart_matches')}
              className={`px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
                activeTab === 'smart_matches'
                  ? 'border-[#A65D47] dark:border-amber-400 text-[#A65D47] dark:text-amber-400'
                  : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#A65D47]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>¿Podrían estar relacionados? ({smartMatches.length})</span>
            </button>
          </div>

          <div className="sm:hidden pb-2">
            <button
              onClick={() => openMyAccessesModal()}
              className="text-xs text-[#5A5A40] dark:text-amber-400 font-semibold underline"
            >
              Mis Accesos
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SEARCH & FILTERS ROW (For Discover tab) */}
          {activeTab === 'discover' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#7C796F] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={filterOptions.searchQuery}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
                    placeholder="Buscar apellido, familia, lugar (ej: Cantero, Entre Ríos, Sevilla)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-sm text-[#434331] dark:text-[#F8FAFC] placeholder-[#9A968A] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] dark:focus:ring-amber-400"
                  />
                  {filterOptions.searchQuery && (
                    <button
                      onClick={() => setFilterOptions(prev => ({ ...prev, searchQuery: '' }))}
                      className="absolute right-3 top-3 text-[#9A968A] hover:text-[#434331] dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                    className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      showFiltersDrawer || filterOptions.country !== 'all' || filterOptions.region !== 'all' || filterOptions.minGenerations > 0 || filterOptions.surname
                        ? 'bg-[#5A5A40] dark:bg-amber-600 text-white border-transparent'
                        : 'bg-white dark:bg-[#1E293B] text-[#434331] dark:text-[#E2E8F0] border-[#D1CEC7] dark:border-[#334155] hover:bg-[#F5F2ED] dark:hover:bg-[#334155]'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtros avanzados</span>
                  </button>

                  {(filterOptions.searchQuery || filterOptions.surname || filterOptions.country !== 'all' || filterOptions.region !== 'all' || filterOptions.minGenerations > 0) && (
                    <button
                      onClick={handleResetFilters}
                      className="p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white transition-colors cursor-pointer"
                      title="Reiniciar filtros"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Surname Tags Pill Bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
                <span className="text-[11px] font-sans font-semibold text-[#7C796F] dark:text-[#94A3B8] shrink-0 uppercase tracking-wider">
                  Apellidos frecuentes:
                </span>
                {['Cantero', 'Pérez', 'González', 'Martínez', 'Rossi', 'De la Fuente', 'Albarracín'].map(sn => {
                  const isSelected = filterOptions.surname.toLowerCase() === sn.toLowerCase();
                  return (
                    <button
                      key={sn}
                      onClick={() => setFilterOptions(prev => ({ ...prev, surname: isSelected ? '' : sn }))}
                      className={`px-2.5 py-1 rounded-full text-xs font-serif font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#A65D47] text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B] text-[#5A5A40] dark:text-[#CBD5E1] border border-[#D1CEC7] dark:border-[#334155] hover:border-[#5A5A40]'
                      }`}
                    >
                      {sn}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filter Drawer */}
              {showFiltersDrawer && (
                <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in">
                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      País de origen
                    </label>
                    <select
                      value={filterOptions.country}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-[#434331] dark:text-[#E2E8F0]"
                    >
                      {countries.map(c => (
                        <option key={c} value={c}>{c === 'all' ? 'Todos los países' : c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      Provincia / Región
                    </label>
                    <select
                      value={filterOptions.region}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-[#434331] dark:text-[#E2E8F0]"
                    >
                      {regions.map(r => (
                        <option key={r} value={r}>{r === 'all' ? 'Todas las regiones' : r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      Mínimo de generaciones
                    </label>
                    <select
                      value={filterOptions.minGenerations}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, minGenerations: Number(e.target.value) }))}
                      className="w-full p-2 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-[#434331] dark:text-[#E2E8F0]"
                    >
                      <option value={0}>Cualquier cantidad</option>
                      <option value={5}>5+ generaciones</option>
                      <option value={7}>7+ generaciones</option>
                      <option value={10}>10+ generaciones</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      Visibilidad
                    </label>
                    <select
                      value={filterOptions.visibility}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, visibility: e.target.value as any }))}
                      className="w-full p-2 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-[#434331] dark:text-[#E2E8F0]"
                    >
                      <option value="all">Todas las visibilidades</option>
                      <option value="public">Solo públicas</option>
                      <option value="public_restricted">Públicas restringidas</option>
                      <option value="discoverable">Descubribles</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: DISCOVER FAMILIES GRID */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              {filteredFamilies.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-[#D1CEC7] dark:border-[#334155]">
                  <Compass className="w-12 h-12 text-[#9A968A] mx-auto mb-3 opacity-60" />
                  <h3 className="font-serif font-bold text-lg text-[#434331] dark:text-[#F8FAFC]">
                    No se encontraron familias con esos criterios
                  </h3>
                  <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] max-w-md mx-auto mt-1">
                    Prueba buscando por otro apellido, quitando los filtros de región o restableciendo la búsqueda.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#434331] cursor-pointer"
                  >
                    Restablecer búsqueda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredFamilies.map((family) => {
                    return (
                      <div
                        key={family.id}
                        className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                      >
                        {/* Cover Image & Badges */}
                        <div className="relative h-36 bg-[#E5E2D9] dark:bg-[#0F172A] overflow-hidden">
                          {family.coverImage ? (
                            <img
                              src={family.coverImage}
                              alt={family.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-3xl font-bold text-[#5A5A40]/30">
                              {family.name.substring(0, 2)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            {getVisibilityBadge(family.visibility)}
                            {family.isVerifiedOrigin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-amber-500/90 text-white shadow-xs">
                                ✓ Origen Verificado
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2.5 left-3 right-3 text-white">
                            <h3 className="font-serif font-bold text-base leading-tight truncate drop-shadow-sm">
                              {family.name}
                            </h3>
                            <div className="flex items-center space-x-1 text-[11px] text-white/90 drop-shadow-sm truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{family.region}, {family.country}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                            {family.description}
                          </p>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-2xl text-center text-xs">
                            <div>
                              <div className="font-serif font-bold text-[#434331] dark:text-[#F8FAFC] text-sm">
                                {family.generationsCount}
                              </div>
                              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase">Gen.</div>
                            </div>
                            <div>
                              <div className="font-serif font-bold text-[#434331] dark:text-[#F8FAFC] text-sm">
                                {family.peopleCount}
                              </div>
                              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase">Personas</div>
                            </div>
                            <div>
                              <div className="font-serif font-bold text-[#434331] dark:text-[#F8FAFC] text-sm">
                                {family.branchesCount}
                              </div>
                              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase">Ramas</div>
                            </div>
                          </div>

                          {/* Surnames & Author */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center space-x-1 text-[#7C796F] dark:text-[#94A3B8] text-[11px]">
                              <Users className="w-3 h-3 shrink-0" />
                              <span>Autor:</span>
                              <span className="font-medium text-[#434331] dark:text-[#E2E8F0]">{family.ownerName}</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {family.surnameTags.slice(0, 4).map(s => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded-md bg-[#E5E2D9]/70 dark:bg-[#334155] text-[#5A5A40] dark:text-[#CBD5E1] font-serif text-[10px] font-semibold"
                                >
                                  {s}
                                </span>
                              ))}
                              {family.surnameTags.length > 4 && (
                                <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] self-center">
                                  +{family.surnameTags.length - 4} más
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-[#E5E2D9] dark:border-[#334155] flex items-center gap-2">
                            <button
                              onClick={() => openPublicProfile(family)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#F5F2ED] dark:bg-[#334155] hover:bg-[#E5E2D9] dark:hover:bg-[#475569] text-[#434331] dark:text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#5A5A40] dark:text-amber-400" />
                              <span>Ver Ficha</span>
                            </button>

                            <button
                              onClick={() => openRequestAccessModal(family)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] dark:hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Colaborar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART MATCHES ("¿Podrían estar relacionados?") */}
          {activeTab === 'smart_matches' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-amber-950 dark:text-amber-100">
                    Detección Inteligente de Nexos Familiares
                  </h4>
                  <p className="mt-0.5 leading-relaxed">
                    Hemos analizado apellidos documentados, orígenes geográficos y ramas genealógicas. Estas sugerencias representan <strong>posibles coincidencias</strong> que requieren verificación mutua entre investigadores, sin asumir automáticamente un parentesco confirmado.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {smartMatches.map((match) => (
                  <div
                    key={match.family.id}
                    className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                          {match.matchScore}% Coincidencia
                        </span>
                        <span className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                          {match.family.name}
                        </span>
                        <span className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                          (Autor: {match.family.ownerName})
                        </span>
                      </div>

                      <p className="text-xs text-[#434331] dark:text-[#CBD5E1] leading-relaxed">
                        {match.explanation}
                      </p>

                      {/* Matching Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                        <span className="text-[11px] font-semibold text-[#7C796F] dark:text-[#94A3B8]">
                          Apellidos comunes:
                        </span>
                        {match.matchedSurnames.map(sn => (
                          <span key={sn} className="px-2 py-0.5 rounded-md bg-[#5A5A40]/15 dark:bg-amber-950/60 text-[#434331] dark:text-amber-300 font-serif font-bold text-[10px]">
                            {sn}
                          </span>
                        ))}

                        <span className="text-[11px] font-semibold text-[#7C796F] dark:text-[#94A3B8] ml-2">
                          Lugar:
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] text-[10px]">
                          {match.family.region} ({match.family.country})
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => openConnectFamiliesModal(match.family)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        title="Proponer conexión entre ambas familias"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Conectar Familias</span>
                      </button>

                      <button
                        onClick={() => openRequestAccessModal(match.family)}
                        className="px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Solicitar colaborar en este árbol"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Solicitar Acceso</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Info */}
        <div className="bg-[#F5F2ED] dark:bg-[#0F172A] px-6 py-3 border-t border-[#E5E2D9] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7C796F] dark:text-[#94A3B8] gap-2 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-[#5A5A40] dark:text-amber-400" />
            <span>Los permisos de visualización y edición son independientes en cada rama y apellido.</span>
          </div>

          <div className="flex items-center space-x-3">
            <span>Familia ≠ Apellido único</span>
          </div>
        </div>

      </div>
    </div>
  );
};
