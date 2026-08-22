/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { useTree } from '../../context/TreeContext';
import { 
  Trophy, Flame, Sparkles, X, CheckCircle2, Lock, Shield, 
  Search, Award, BookOpen, Users, Camera, HardDrive, Calendar, 
  MapPin, Tag, Library, Download, Compass, Printer, Heart,
  ArrowRight, Check, Star, RefreshCw, ChevronRight, Layers, Eye
} from 'lucide-react';
import { AchievementCategory, AchievementRarity } from '../../types/gamification';

export const GamificationDashboardModal: React.FC = () => {
  const { modalState, closeGamificationModal, state, equippedTitle, equipTitle, triggerSound } = useGamification();
  const { activeTree, people, relationships, selectTree } = useTree();

  const [activeTab, setActiveTab] = useState<'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate'>(
    modalState.initialTab || 'summary'
  );

  // Filters for achievements catalog
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!modalState.isOpen) return null;

  const { level, nextLevel, progressToNextLevel, currentXp, streakDays, stats, achievements, missions, collections, recommendations, branchProgress, unlockedTitles } = state;

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;
  const totalAchievementsCount = achievements.length;
  const achievementsPercent = Math.round((unlockedAchievementsCount / totalAchievementsCount) * 100);

  // Filtered achievements
  const filteredAchievements = achievements.filter(ach => {
    // Category match
    if (selectedCategory !== 'all' && ach.category !== selectedCategory) {
      return false;
    }
    // Status match
    if (selectedStatus === 'unlocked' && !ach.unlocked) return false;
    if (selectedStatus === 'in_progress' && (ach.unlocked || ach.progress === 0)) return false;
    if (selectedStatus === 'locked' && (ach.unlocked || ach.progress > 0)) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ach.title.toLowerCase().includes(q);
      const matchDesc = ach.description.toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }

    return true;
  });

  const rarityBadgeStyles: Record<AchievementRarity, { bg: string; text: string; border: string; label: string }> = {
    common: { bg: 'bg-[#F0EDE6]', text: 'text-[#6A665A]', border: 'border-[#D1CEC7]', label: 'Común' },
    uncommon: { bg: 'bg-[#EBF2EA]', text: 'text-[#3F6B38]', border: 'border-[#BDD6BA]', label: 'Poco común' },
    rare: { bg: 'bg-[#EAF0F6]', text: 'text-[#3B5878]', border: 'border-[#B8CEE2]', label: 'Raro' },
    epic: { bg: 'bg-[#F6EBF4]', text: 'text-[#7D386E]', border: 'border-[#DEBBD9]', label: 'Épico' },
    legendary: { bg: 'bg-[#FCF5E3]', text: 'text-[#B57C1E]', border: 'border-[#ECCF87]', label: 'Legendario' },
    unique: { bg: 'bg-[#FCEAEB]', text: 'text-[#9E2A2B]', border: 'border-[#ECAEB0]', label: 'Único' }
  };

  const categoriesList: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'Todos los Logros', icon: Trophy },
    { id: 'construction', label: 'Construcción', icon: Users },
    { id: 'generations', label: 'Generaciones', icon: Layers },
    { id: 'photos', label: 'Fotografías', icon: Camera },
    { id: 'documents', label: 'Documentos', icon: HardDrive },
    { id: 'stories', label: 'Historias', icon: BookOpen },
    { id: 'dates', label: 'Fechas', icon: Calendar },
    { id: 'places', label: 'Lugares', icon: MapPin },
    { id: 'surnames', label: 'Apellidos', icon: Tag },
    { id: 'collaboration', label: 'Colaboración', icon: Heart },
    { id: 'verification', label: 'Verificación', icon: Shield },
    { id: 'sources', label: 'Fuentes', icon: Library },
    { id: 'secret', label: 'Logros Secretos 🔒', icon: Lock }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FDFBF7] w-full max-w-5xl rounded-2xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#F5F2ED] border-b border-[#D1CEC7] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-[#E8C547]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#434331]">
                  Progreso & Logros Genealógicos
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E5E2D9] text-[#5A5A40] border border-[#D1CEC7]">
                  {activeTree?.name || 'Árbol Familiar'}
                </span>
              </div>
              <p className="text-xs text-[#7C796F] font-serif italic">
                Incentivo a la calidad, profundidad, documentación y preservación del linaje familiar.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Streak Counter Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-white border border-[#D1CEC7] rounded-full text-xs font-bold text-[#9E4A2B] shadow-2xs">
              <Flame className="w-4 h-4 fill-[#E06D44] text-[#E06D44]" />
              <span>{streakDays} días de racha</span>
            </div>

            <button
              onClick={closeGamificationModal}
              className="p-1.5 text-[#7C796F] hover:text-[#2C2C2C] hover:bg-[#E5E2D9] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 bg-[#FAF8F5] border-b border-[#D1CEC7] overflow-x-auto scrollbar-none shrink-0 gap-1 sm:gap-2">
          {[
            { id: 'summary' as const, label: 'Resumen & Nivel', icon: Sparkles },
            { id: 'achievements' as const, label: `Álbum de Insignias (${unlockedAchievementsCount}/${totalAchievementsCount})`, icon: Trophy },
            { id: 'missions' as const, label: 'Misiones & Desafíos', icon: Compass },
            { id: 'collections' as const, label: 'Colecciones & Títulos', icon: Award },
            { id: 'branches' as const, label: 'Ramas de Apellidos', icon: Layers },
            { id: 'certificate' as const, label: 'Certificado de Linaje', icon: Printer }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#5A5A40] text-[#434331] font-bold bg-[#F0EDE6]/50'
                    : 'border-transparent text-[#7C796F] hover:text-[#2C2C2C] hover:bg-[#F5F2ED]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5A5A40]' : 'text-[#9A968A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Views */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: RESUMEN & PROGRESO */}
          {/* ========================================================================= */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Researcher Profile Hero Card */}
              <div className="bg-gradient-to-br from-[#F5F2ED] via-[#FDFBF7] to-[#EBE7DF] border-2 border-[#D1CEC7] rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Left: Level Avatar & Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#5A5A40] text-white flex flex-col items-center justify-center text-2xl sm:text-3xl shadow-md border-2 border-[#D1CEC7] shrink-0">
                      <span>{level.icon}</span>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#E8C547] mt-0.5">
                        Nv. {level.level}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C2C]">
                          {level.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E5E2D9] text-[#434331] border border-[#D1CEC7]">
                          Título Activo: {equippedTitle}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#55524A] font-serif italic mt-1 max-w-xl">
                        {level.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Total XP badge */}
                  <div className="bg-white/80 border border-[#D1CEC7] rounded-xl px-4 py-3 text-right shrink-0 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#7C796F] font-bold">
                      Experiencia Total
                    </span>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[#3F6B38]">
                      {currentXp.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div className="mt-5 pt-4 border-t border-[#D1CEC7]/60">
                  <div className="flex items-center justify-between text-xs font-sans text-[#55524A] mb-1.5">
                    <span className="font-medium">
                      Progreso hacia Nivel {nextLevel ? nextLevel.level : 10} {nextLevel ? `(${nextLevel.title})` : '(Máximo)'}
                    </span>
                    <span className="font-mono font-bold text-[#434331]">
                      {progressToNextLevel}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#D1CEC7] rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5A5A40] via-[#3F6B38] to-[#B57C1E] rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${progressToNextLevel}%` }}
                    />
                  </div>
                </div>

                {/* Unlocked Perks Pill List */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#7C796F] font-serif italic">Beneficios activos:</span>
                  {level.perks.map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/70 border border-[#D1CEC7] text-[#434331] rounded-md text-[11px] font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3 text-[#3F6B38]" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>

                {/* Stats Counters Bento Grid */}
              <div>
                <h4 className="font-serif font-bold text-base text-[#434331] mb-3 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#5A5A40]" />
                  <span>Estado General de Calidad del Árbol</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
                  {[
                    { label: 'Personas', val: stats.personsCount, icon: Users, color: 'text-[#434331]' },
                    { label: 'Generaciones', val: `${stats.generationsDepth} gen`, icon: GitCommitIcon, color: 'text-[#5A5A40]' },
                    { label: 'Fotografías', val: stats.photosCount, icon: Camera, color: 'text-[#3B5878]' },
                    { label: 'Documentos', val: stats.documentsCount, icon: HardDrive, color: 'text-[#7D386E]' },
                    { label: 'Historias', val: stats.storiesCount, icon: BookOpen, color: 'text-[#8C482A]' },
                    { label: 'Fuentes', val: stats.sourcesCount, icon: Library, color: 'text-[#3F6B38]' },
                    { label: 'Datos 100%', val: `${stats.completenessAverage}%`, icon: Shield, color: 'text-[#B57C1E]' },
                    { label: 'Colaboradores', val: stats.collaboratorsCount, icon: Heart, color: 'text-[#9E2A2B]' }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="bg-white p-3 rounded-xl border border-[#D1CEC7] shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[#7C796F]">
                          <span className="text-[11px] font-serif uppercase tracking-tight truncate">{stat.label}</span>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${stat.color}`}>
                          {stat.val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations: "💡 Próximo objetivo sugerido" */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#434331] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#B57C1E]" />
                  <span>Próximos Objetivos Recomendados por el Árbol</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map(rec => (
                    <div 
                      key={rec.id}
                      className="bg-white p-4 rounded-xl border border-[#D1CEC7] hover:border-[#B5B0A2] shadow-2xs flex items-start justify-between gap-3 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#434331] font-serif block">
                          {rec.title}
                        </span>
                        <p className="text-xs text-[#55524A] font-sans leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="flex items-center space-x-2 pt-1 text-[11px] font-semibold text-[#3F6B38]">
                          <span>Recompensa potencial: +{rec.xpPotential} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Daily & Weekly Missions Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#434331] flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[#5A5A40]" />
                    <span>Misiones Diarias & Desafíos Activos</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('missions')}
                    className="text-xs text-[#5A5A40] hover:text-[#2C2C2C] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Ver todas las misiones</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {missions.slice(0, 3).map(m => (
                    <div 
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        m.completed 
                          ? 'bg-[#F4F8F3] border-[#BDD6BA]' 
                          : 'bg-white border-[#D1CEC7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          m.type === 'daily' ? 'bg-[#FCF5E3] text-[#B57C1E]' : 'bg-[#EAF0F6] text-[#3B5878]'
                        }`}>
                          {m.type === 'daily' ? 'Misión Diaria' : 'Desafío Semanal'}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#3F6B38]">
                          +{m.xpReward} XP
                        </span>
                      </div>

                      <h5 className="font-serif font-bold text-xs text-[#2C2C2C] mt-2 truncate">
                        {m.title}
                      </h5>
                      <p className="text-[11px] text-[#7C796F] font-sans mt-0.5 line-clamp-2">
                        {m.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-[#D1CEC7]/50 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#7C796F]">
                          Progreso: {m.progress} / {m.target}
                        </span>
                        {m.completed ? (
                          <span className="text-[#3F6B38] font-bold text-[11px] flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completada</span>
                          </span>
                        ) : (
                          <span className="text-[#B57C1E] font-medium text-[11px]">En curso</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ÁLBUM DE INSIGNIAS (CATÁLOGO COMPLETO) */}
          {/* ========================================================================= */}
          {activeTab === 'achievements' && (
            <div className="space-y-5">
              {/* Filter controls */}
              <div className="bg-[#F5F2ED] p-3.5 rounded-xl border border-[#D1CEC7] space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  
                  {/* Search bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#7C796F] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar logro por nombre..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D1CEC7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>

                  {/* Status filter pills */}
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none text-xs">
                    {[
                      { id: 'all', label: `Todos (${totalAchievementsCount})` },
                      { id: 'unlocked', label: `Desbloqueados (${unlockedAchievementsCount})` },
                      { id: 'in_progress', label: 'En Progreso' },
                      { id: 'locked', label: 'Bloqueados' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStatus(st.id as any)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer text-xs ${
                          selectedStatus === st.id
                            ? 'bg-[#5A5A40] text-white font-semibold'
                            : 'bg-white text-[#55524A] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Pill Slider */}
                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1">
                  {categoriesList.map(cat => {
                    const Icon = cat.icon;
                    const isSel = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer ${
                          isSel
                            ? 'bg-[#434331] text-white shadow-2xs font-bold'
                            : 'bg-white/80 text-[#55524A] hover:bg-white border border-[#D1CEC7]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAchievements.map(ach => {
                  const rarityStyle = rarityBadgeStyles[ach.rarity] || rarityBadgeStyles.common;
                  const isSecretLocked = ach.isSecret && !ach.unlocked;

                  return (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                        ach.unlocked
                          ? 'bg-white border-[#5A5A40]/40 shadow-xs'
                          : 'bg-[#FAF8F5] border-[#D1CEC7]/80 opacity-90'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              ach.unlocked 
                                ? 'bg-[#5A5A40] text-white border-[#434331]' 
                                : 'bg-[#E5E2D9] text-[#7C796F] border-[#D1CEC7]'
                            }`}>
                              {isSecretLocked ? (
                                <Lock className="w-5 h-5 text-[#9A968A]" />
                              ) : (
                                <Trophy className={`w-5 h-5 ${ach.unlocked ? 'text-[#E8C547]' : 'text-[#7C796F]'}`} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h5 className="font-serif font-bold text-xs sm:text-sm text-[#2C2C2C] truncate">
                                {isSecretLocked ? 'Logro Secreto 🔒' : ach.title}
                              </h5>
                              {ach.chainName && (
                                <span className="text-[10px] text-[#7C796F] font-mono block">
                                  Cadena: {ach.chainName} {ach.tier ? `(Nivel ${ach.tier})` : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rarity badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}>
                            {rarityStyle.label}
                          </span>
                        </div>

                        {/* Description / Mystery Hint */}
                        <p className="text-xs text-[#55524A] font-sans mt-2.5 leading-relaxed">
                          {isSecretLocked 
                            ? (ach.secretDescription || '🔒 Hay algo interesante escondido en la historia de tu árbol...')
                            : ach.description}
                        </p>
                      </div>

                      {/* Footer Progress & Reward */}
                      <div className="mt-4 pt-3 border-t border-[#D1CEC7]/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-[#7C796F]">
                            {ach.unlocked 
                              ? '¡Completado!' 
                              : `Progreso: ${ach.progress} / ${ach.target}`}
                          </span>
                          <span className="font-mono font-bold text-[#3F6B38] text-xs">
                            +{ach.xpReward} XP
                          </span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full h-1.5 bg-[#D1CEC7] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              ach.unlocked ? 'bg-[#3F6B38]' : 'bg-[#5A5A40]'
                            }`}
                            style={{ width: `${ach.percent}%` }}
                          />
                        </div>

                        {ach.unlocked && ach.unlockedAt && (
                          <span className="text-[10px] text-[#9A968A] font-serif italic block text-right">
                            Desbloqueado el {new Date(ach.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MISIONES Y DESAFÍOS */}
          {/* ========================================================================= */}
          {activeTab === 'missions' && (
            <div className="space-y-6">
              
              {/* Daily Missions */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-[#5A5A40]" />
                  <h4 className="font-serif font-bold text-base text-[#434331]">
                    Misiones Diarias Dinámicas (Adaptadas a tu árbol)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {missions.filter(m => m.type === 'daily').map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-xl border border-[#D1CEC7] shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#FCF5E3] text-[#B57C1E]">
                          Misión Diaria
                        </span>
                        <span className="text-xs font-bold font-mono text-[#3F6B38]">
                          +{m.xpReward} XP
                        </span>
                      </div>

                      <div>
                        <h5 className="font-serif font-bold text-sm text-[#2C2C2C]">
                          {m.title}
                        </h5>
                        <p className="text-xs text-[#55524A] mt-1 leading-relaxed">
                          {m.description}
                        </p>
                        {m.actionHint && (
                          <div className="mt-2 text-[11px] text-[#5A5A40] bg-[#F5F2ED] p-2 rounded-md font-sans">
                            💡 {m.actionHint}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#D1CEC7]/50 flex items-center justify-between text-xs">
                        <span className="text-[#7C796F]">
                          Estado: {m.progress}/{m.target}
                        </span>
                        {m.completed ? (
                          <span className="text-[#3F6B38] font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completada</span>
                          </span>
                        ) : (
                          <span className="text-[#B57C1E] font-semibold">Pendiente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Challenges & Special Campaigns */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#B57C1E]" />
                  <h4 className="font-serif font-bold text-base text-[#434331]">
                    Desafíos Semanales & Eventos Especiales de Temporada
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {missions.filter(m => m.type !== 'daily').map(m => (
                    <div key={m.id} className="bg-gradient-to-r from-white to-[#F9F7F2] p-4 rounded-xl border-2 border-[#D1CEC7] shadow-2xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAF0F6] text-[#3B5878]">
                            {m.type === 'special_event' ? 'Campaña Especial' : 'Desafío Semanal'}
                          </span>
                          <span className="text-sm font-bold font-mono text-[#3F6B38]">
                            +{m.xpReward} XP
                          </span>
                        </div>

                        <h5 className="font-serif font-bold text-sm text-[#2C2C2C] mt-2">
                          {m.title}
                        </h5>
                        <p className="text-xs text-[#55524A] mt-1 leading-relaxed">
                          {m.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#D1CEC7]/50 flex items-center justify-between text-xs">
                        <span className="text-[#7C796F]">
                          Progreso: {m.progress} de {m.target}
                        </span>
                        {m.completed ? (
                          <span className="text-[#3F6B38] font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completado</span>
                          </span>
                        ) : (
                          <span className="text-[#B57C1E] font-semibold">En progreso</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COLECCIONES Y TÍTULOS */}
          {/* ========================================================================= */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              
              {/* Equippable Titles Selector */}
              <div className="bg-[#F5F2ED] p-4 rounded-xl border border-[#D1CEC7] space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#5A5A40]" />
                  <h4 className="font-serif font-bold text-base text-[#434331]">
                    Títulos Desbloqueados para tu Perfil
                  </h4>
                </div>
                <p className="text-xs text-[#55524A] font-serif italic">
                  Selecciona el título con el que deseas firmar tus investigaciones y exportaciones del árbol familiar:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {unlockedTitles.map((title, i) => {
                    const isEquipped = equippedTitle === title;
                    return (
                      <button
                        key={i}
                        onClick={() => equipTitle(title)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-[#5A5A40] text-white shadow-xs border border-[#434331]'
                            : 'bg-white text-[#434331] hover:bg-[#E5E2D9] border border-[#D1CEC7]'
                        }`}
                      >
                        {isEquipped && <Check className="w-3.5 h-3.5" />}
                        <span>{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collections Cards */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#434331] flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#5A5A40]" />
                  <span>Grandes Colecciones Genealógicas</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {collections.map(col => (
                    <div 
                      key={col.id}
                      className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        col.completed 
                          ? 'bg-[#F4F8F3] border-[#BDD6BA] shadow-sm'
                          : 'bg-white border-[#D1CEC7]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif font-bold text-sm text-[#2C2C2C]">
                            {col.title}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            col.completed ? 'bg-[#3F6B38] text-white' : 'bg-[#E5E2D9] text-[#5A5A40]'
                          }`}>
                            {col.completedCount} / {col.totalCount} Logros
                          </span>
                        </div>

                        <p className="text-xs text-[#55524A] font-sans mt-1.5 leading-relaxed">
                          {col.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#D1CEC7]/50 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#7C796F]">
                          <span>Recompensa de Colección:</span>
                          <span className="font-serif font-bold text-[#434331]">
                            🏆 {col.rewardTitle}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-[#D1CEC7] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#5A5A40] rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((col.completedCount / col.totalCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RAMAS Y APELLIDOS */}
          {/* ========================================================================= */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#5A5A40]" />
                <div>
                  <h4 className="font-serif font-bold text-base text-[#434331]">
                    Ramas de Apellidos del Linaje
                  </h4>
                  <p className="text-xs text-[#7C796F] font-serif italic">
                    Profundidad generacional, personas registradas y calidad documental por cada apellido.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {branchProgress.map((br, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-[#D1CEC7] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-sm text-[#2C2C2C]">
                        Familia {br.surname}
                      </h5>
                      <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F2ED] px-2 py-0.5 rounded-md border border-[#D1CEC7]">
                        {br.personCount} personas
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#55524A] font-sans">
                      <div className="flex items-center justify-between">
                        <span>Profundidad generacional:</span>
                        <span className="font-semibold">{br.generationsDepth} generaciones</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fotografías vinculadas:</span>
                        <span className="font-semibold">{br.photosCount} fotos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Completitud promedio:</span>
                        <span className="font-semibold">{br.completenessPercent}%</span>
                      </div>
                      {br.oldestAncestor && (
                        <div className="text-[11px] text-[#7C796F] font-serif italic pt-1 border-t border-[#D1CEC7]/40">
                          Antepasado más antiguo: {br.oldestAncestor}
                        </div>
                      )}
                    </div>

                    {/* Completeness Bar */}
                    <div className="w-full h-1.5 bg-[#D1CEC7] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5A5A40] rounded-full"
                        style={{ width: `${br.completenessPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: CERTIFICADO DE LINAJE FAMILIAR (DIPLOMA) */}
          {/* ========================================================================= */}
          {activeTab === 'certificate' && (
            <div className="space-y-4 flex flex-col items-center">
              
              {/* Print Action Bar */}
              <div className="w-full flex items-center justify-between bg-[#F5F2ED] p-3 rounded-xl border border-[#D1CEC7]">
                <span className="text-xs font-serif italic text-[#7C796F]">
                  Documento honorífico de preservación genealógica apto para impresión y archivo familiar.
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#434331] text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar Diploma</span>
                </button>
              </div>

              {/* Official Certificate Visual Frame */}
              <div className="w-full max-w-2xl bg-[#FCFAF6] border-8 border-double border-[#8C7355] p-8 sm:p-12 rounded-2xl shadow-xl text-center relative overflow-hidden">
                
                {/* Decorative watermark / seals */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#8C7355]/40" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#8C7355]/40" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#8C7355]/40" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#8C7355]/40" />

                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#5A5A40] text-[#E8C547] flex items-center justify-center shadow-md">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <span className="text-xs uppercase tracking-[0.25em] font-serif font-bold text-[#8C7355] block">
                    República Genealógica & Custodia de la Memoria
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C2C] tracking-wide">
                    Certificado de Linaje & Archivo Familiar
                  </h3>

                  <p className="text-xs sm:text-sm text-[#55524A] font-serif italic max-w-lg mx-auto">
                    Por medio del presente testimonio se hace constar que el árbol genealógico de la
                  </p>

                  <div className="py-2 border-y-2 border-[#8C7355]/30 my-3">
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#5A5A40]">
                      {activeTree?.name || 'Familia'}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-[#55524A] font-serif max-w-lg mx-auto leading-relaxed">
                    ha alcanzado una profundidad documentada de <strong>{stats.generationsDepth} generaciones</strong>, 
                    reuniendo <strong>{stats.personsCount} miembros</strong>, <strong>{stats.photosCount} fotografías</strong> y <strong>{stats.sourcesCount} fuentes históricas</strong> bajo la categoría de:
                  </p>

                  <div className="text-lg font-serif font-bold text-[#B57C1E] tracking-wider uppercase">
                    ★ {level.title} — {equippedTitle} ★
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#D1CEC7] flex items-center justify-between text-xs text-[#7C796F] font-serif">
                    <div>
                      <span className="block font-bold text-[#2C2C2C]">Sello de Autenticidad</span>
                      <span>{unlockedAchievementsCount} Logros Verificados</span>
                    </div>
                    <div>
                      <span className="block font-bold text-[#2C2C2C]">Fecha de Expedición</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#F5F2ED] border-t border-[#D1CEC7] flex items-center justify-between text-xs text-[#7C796F] shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#B57C1E]" />
            <span>
              {unlockedAchievementsCount} de {totalAchievementsCount} logros completados ({achievementsPercent}%)
            </span>
          </div>

          <button
            onClick={closeGamificationModal}
            className="px-4 py-1.5 bg-[#5A5A40] hover:bg-[#434331] text-white rounded-full font-semibold transition-colors cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper icon component
const GitCommitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);
