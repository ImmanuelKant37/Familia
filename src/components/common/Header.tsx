import React, { useState, useRef, useEffect } from 'react';
import { 
  Network, Calendar, Image as ImageIcon, MapPin, 
  BookOpen, Users, History, Settings, Search, 
  Plus, Upload, Shield, LogIn, LogOut, CheckCircle, 
  Sparkles, Share2, Globe, Lock, Trash2, FolderTree,
  Palette, BookMarked, HardDrive, Cloud, User, UserCheck,
  GitBranch, GitCommit, GitMerge, RotateCcw, RotateCw, AlertTriangle,
  MoreHorizontal, ChevronDown, Trophy, Sun, Moon, Compass, Key, Database,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTree } from '../../context/TreeContext';
import { useTheme } from '../../context/ThemeContext';
import { HeaderGamificationBadge } from '../gamification/HeaderGamificationBadge';
import { useGamification } from '../../context/GamificationContext';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';

interface HeaderProps {
  activeTab: 'tree' | 'timeline' | 'map' | 'media' | 'sources' | 'audit';
  onTabChange: (tab: 'tree' | 'timeline' | 'map' | 'media' | 'sources' | 'audit') => void;
  onOpenNewPerson: () => void;
  onOpenCollab: () => void;
  onOpenDuplicates: () => void;
  onOpenGedcom: () => void;
  onOpenSettings: (tab?: 'settings' | 'create' | 'list') => void;
  onOpenSearch: () => void;
  onOpenBookModal?: () => void;
  onOpenSurnameStyles?: () => void;
  onOpenGitModal?: (tab?: 'history' | 'branches' | 'merge' | 'abandoned') => void;
  onOpenGamification?: (tab?: 'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate') => void;
  onOpenSupabaseSql?: () => void;
  onOpenChatAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewPerson,
  onOpenCollab,
  onOpenDuplicates,
  onOpenGedcom,
  onOpenSettings,
  onOpenSearch,
  onOpenBookModal,
  onOpenSurnameStyles,
  onOpenGitModal,
  onOpenGamification,
  onOpenSupabaseSql,
  onOpenChatAssistant
}) => {
  const { 
    currentUser, 
    activeRole, 
    isPublicMode, 
    logout 
  } = useAuth();
  const { 
    trees, activeTree, selectTree, deleteTree, requests, proposals, canEdit,
    undo, redo, branches, activeBranchId, switchBranch, commits
  } = useTree();
  const { openGamificationModal } = useGamification();
  const { theme, toggleTheme, isDark } = useTheme();
  const { openLobby, openMyAccessesModal, openPermissionsManager, pendingRequestsCount: lobbyPendingCount } = useFamilyLobby();

  const [treeDropdownOpen, setTreeDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'pending').length;
  const totalNotifications = pendingRequestsCount + pendingProposalsCount;

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  const abandonedBranches = branches.filter(b => !b.isDefault && b.id !== activeBranchId);

  const handleCopyPublicLink = () => {
    const url = window.location.origin + `?tree=${activeTree?.slug || activeTree?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDeleteTreeQuick = async (e: React.MouseEvent, treeId: string, treeName: string) => {
    e.stopPropagation();
    const isOnlyOne = trees.length <= 1;
    const msg = isOnlyOne
      ? `¿Eliminar "${treeName}"? Al ser la única familia, se creará un árbol limpio.`
      : `¿Estás seguro de eliminar la familia "${treeName}" y todos sus miembros?`;

    if (window.confirm(msg)) {
      await deleteTree(treeId);
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-dropdown-container')) {
        setTreeDropdownOpen(false);
        setBranchDropdownOpen(false);
        setRoleDropdownOpen(false);
        setMoreToolsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navTabs = [
    { id: 'tree' as const, label: 'Árbol', shortLabel: 'Árbol', icon: Network },
    { id: 'timeline' as const, label: 'Línea de Tiempo', shortLabel: 'Cronología', icon: Calendar },
    { id: 'media' as const, label: 'Galería', shortLabel: 'Galería', icon: ImageIcon },
    { id: 'map' as const, label: 'Rutas & Mapa', shortLabel: 'Mapa', icon: MapPin },
    { id: 'sources' as const, label: 'Fuentes', shortLabel: 'Fuentes', icon: BookOpen },
    { id: 'audit' as const, label: 'Historial', shortLabel: 'Historial', icon: History }
  ];

  return (
    <header className="w-full max-w-full bg-[#FDFBF7] dark:bg-[#0F172A] border-b border-[#D1CEC7] dark:border-[#334155] sticky top-0 z-30 shadow-xs header-dropdown-container transition-colors duration-200">
      {/* Main Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Left: Brand & Tree Selector */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 shrink-0">
            {/* Brand Emblem */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5A5A40] dark:bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-xs sm:text-sm shadow-xs border border-[#434331]/30 dark:border-amber-400/30 shrink-0">
                <span>F</span>
              </div>
              <div className="hidden xl:block shrink-0">
                <span className="font-serif font-bold text-[#434331] dark:text-[#F8FAFC] text-xs uppercase tracking-wider block leading-tight">
                  Linajes
                </span>
              </div>
            </div>

            {/* Tree Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTreeDropdownOpen(!treeDropdownOpen);
                  setBranchDropdownOpen(false);
                  setRoleDropdownOpen(false);
                  setMoreToolsOpen(false);
                }}
                className="flex items-center space-x-1.5 bg-[#F5F2ED] dark:bg-[#1E293B] hover:bg-[#E5E2D9] dark:hover:bg-[#334155] text-[#434331] dark:text-[#F1F5F9] px-2.5 py-1 rounded-full text-xs font-medium border border-[#D1CEC7] dark:border-[#334155] transition-colors cursor-pointer max-w-[140px] sm:max-w-[180px] md:max-w-[200px]"
                title="Cambiar de árbol familiar"
              >
                <FolderTree className="w-3 h-3 text-[#5A5A40] dark:text-amber-400 shrink-0" />
                <span className="truncate font-serif text-[11px] sm:text-xs">
                  {activeTree?.name || 'Familia'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#9A968A] shrink-0" />
              </button>

              {treeDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-[#FDFBF7] dark:bg-[#0F172A] rounded-2xl shadow-xl border border-[#D1CEC7] dark:border-[#334155] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#7C796F] dark:text-[#94A3B8] font-sans uppercase tracking-widest border-b border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between">
                    <span>Árboles Familiares ({trees.length})</span>
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('create');
                      }}
                      className="text-[#5A5A40] dark:text-amber-400 hover:text-[#434331] lowercase text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>nueva</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {trees.map((t) => {
                      const isCurrent = activeTree?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            selectTree(t.id);
                            setTreeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] transition-colors cursor-pointer group ${
                            isCurrent ? 'bg-[#E5E2D9] dark:bg-[#1E293B] text-[#434331] dark:text-white font-semibold' : 'text-[#2C2C2C] dark:text-[#CBD5E1]'
                          }`}
                        >
                          <div className="truncate flex-1 mr-2">
                            <div className="font-serif flex items-center space-x-1.5">
                              <span className="truncate">{t.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-[#5A5A40] text-white px-1.5 py-0.2 rounded-full uppercase font-sans font-bold shrink-0">
                                  Activo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] font-normal truncate italic font-serif">
                              {t.description || 'Sin descripción'}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {t.visibility === 'public' ? (
                              <Globe className="w-3.5 h-3.5 text-[#5A5A40] dark:text-amber-400" title="Público" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#9A968A]" title="Privado" />
                            )}
                            
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTreeQuick(e, t.id, t.name)}
                              className="p-1 text-[#9A968A] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                              title={`Eliminar familia ${t.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E5E2D9] dark:border-[#334155] mt-1 pt-1.5 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('create');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#5A5A40] dark:text-amber-400 hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Crear Nueva Familia</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('list');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-[#7C796F] dark:text-[#94A3B8] hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Administrar Familias y Ajustes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Branch Selector (Visible on Desktop / Tablet) */}
            <div className="relative hidden md:block shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBranchDropdownOpen(!branchDropdownOpen);
                  setTreeDropdownOpen(false);
                  setRoleDropdownOpen(false);
                  setMoreToolsOpen(false);
                }}
                className="flex items-center space-x-1 px-2 py-1 bg-[#F5F2ED] dark:bg-[#1E293B] hover:bg-[#E5E2D9] dark:hover:bg-[#334155] rounded-full text-xs font-sans font-medium text-[#434331] dark:text-[#F1F5F9] border border-[#D1CEC7] dark:border-[#334155] transition-colors cursor-pointer max-w-[120px]"
                title="Rama activa del árbol"
              >
                <GitBranch className="w-3 h-3 text-[#5A5A40] dark:text-amber-400 shrink-0" />
                <span className="truncate font-mono text-[10px]">{currentBranch?.name || 'main'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-[#9A968A] shrink-0" />
              </button>

              {branchDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-[#FDFBF7] dark:bg-[#0F172A] rounded-2xl shadow-xl border border-[#D1CEC7] dark:border-[#334155] py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#7C796F] dark:text-[#94A3B8] font-sans uppercase tracking-widest border-b border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between">
                    <span>Ramas ({branches.length})</span>
                    {onOpenGitModal && (
                      <button
                        onClick={() => {
                          setBranchDropdownOpen(false);
                          onOpenGitModal('branches');
                        }}
                        className="text-[#5A5A40] dark:text-amber-400 hover:text-[#434331] lowercase text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>nueva</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto py-1">
                    {branches.map(b => {
                      const isCurrent = b.id === activeBranchId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            switchBranch(b.id);
                            setBranchDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] transition-colors cursor-pointer ${
                            isCurrent ? 'bg-[#E5E2D9] dark:bg-[#1E293B] text-[#434331] dark:text-white font-semibold' : 'text-[#2C2C2C] dark:text-[#CBD5E1]'
                          }`}
                        >
                          <div className="truncate flex-1 mr-2">
                            <div className="flex items-center space-x-1 font-serif">
                              <span className="truncate">{b.name}</span>
                              {b.isDefault && (
                                <span className="text-[8px] bg-[#5A5A40] text-white px-1 py-0.2 rounded-full uppercase font-sans font-bold">
                                  Base
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[8px] bg-emerald-700 text-white px-1 py-0.2 rounded-full uppercase font-sans font-bold">
                                  Activa
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {onOpenGitModal && (
                    <div className="border-t border-[#E5E2D9] dark:border-[#334155] px-3 pt-1.5 mt-1">
                      <button
                        onClick={() => {
                          setBranchDropdownOpen(false);
                          onOpenGitModal('history');
                        }}
                        className="w-full text-center py-1 text-[11px] text-[#5A5A40] dark:text-amber-400 font-sans font-bold uppercase tracking-wider hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
                      >
                        Ver Historial & Integrar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar Trigger (Hidden on mobile, sleek on desktop) */}
          <div className="hidden lg:block flex-1 max-w-xs mx-2">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between bg-[#F5F2ED] hover:bg-[#E5E2D9]/70 border border-[#D1CEC7] text-[#7C796F] text-xs rounded-full px-3 py-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Search className="w-3.5 h-3.5 text-[#9A968A] shrink-0" />
                <span className="font-sans truncate">Buscar antepasado, año, lugar...</span>
              </div>
              <kbd className="bg-[#E5E2D9] text-[#7C796F] text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1">⌘K</kbd>
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* Search Icon (Mobile & Tablet) */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-[#7C796F] hover:text-[#434331] lg:hidden rounded-full hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              title="Buscar en el árbol"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Undo & Redo (Visible on xl+ screens) */}
            {canEdit && (
              <div className="hidden 2xl:flex items-center space-x-0.5 bg-[#F5F2ED] rounded-full p-0.5 border border-[#D1CEC7]">
                <button
                  onClick={() => undo()}
                  className="p-1 text-[#7C796F] hover:text-[#434331] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
                  title="Deshacer (Ctrl+Z)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => redo()}
                  className="p-1 text-[#7C796F] hover:text-[#434331] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
                  title="Rehacer (Ctrl+Y)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Primary Action: + Nueva Persona */}
            {canEdit && (
              <button
                onClick={onOpenNewPerson}
                className="bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] dark:hover:bg-amber-500 text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wider flex items-center space-x-1 shadow-xs transition-colors cursor-pointer shrink-0"
                id="btn-quick-add-person"
                title="Añadir nueva persona al árbol"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Persona</span>
              </button>
            )}

            {/* Chat Assistant (NLP Quick Tree Builder) */}
            {canEdit && onOpenChatAssistant && (
              <button
                onClick={onOpenChatAssistant}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 rounded-full text-xs font-sans font-semibold uppercase tracking-wider shadow-2xs transition-all cursor-pointer shrink-0"
                id="btn-quick-chat-assistant"
                title="Asistente Chat: Creación rápida por parentesco (ej: 'a es hijo de b')"
              >
                <Bot className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden md:inline">Asistente Chat</span>
              </button>
            )}

            {/* Header Gamification Badge (Responsive) */}
            <HeaderGamificationBadge onClick={() => openGamificationModal()} />

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-[#7C796F] dark:text-amber-400 hover:text-[#434331] dark:hover:text-amber-300 hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-full transition-colors border border-[#D1CEC7] dark:border-[#334155] cursor-pointer"
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              id="btn-toggle-dark-mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C796F] animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Family Lobby Button */}
            <button
              onClick={openLobby}
              className="relative p-1.5 sm:p-2 text-[#5A5A40] dark:text-amber-400 hover:text-[#434331] dark:hover:text-amber-300 hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-full transition-colors border border-[#D1CEC7] dark:border-[#334155] cursor-pointer"
              title="Lobby de Familias, Descubrimiento & Ramas"
              id="btn-open-family-lobby"
            >
              <Compass className="w-4 h-4" />
              {lobbyPendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {lobbyPendingCount}
                </span>
              )}
            </button>

            {/* Collab Button (with badge count) */}
            <button
              onClick={onOpenCollab}
              className="relative p-1.5 sm:p-2 text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-full transition-colors border border-[#D1CEC7] dark:border-[#334155] cursor-pointer"
              title="Colaboración y Solicitudes"
            >
              <Users className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A65D47] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* More Tools Dropdown (Accessible on all screen sizes) */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreToolsOpen(!moreToolsOpen);
                  setTreeDropdownOpen(false);
                  setBranchDropdownOpen(false);
                  setRoleDropdownOpen(false);
                }}
                className="p-1.5 sm:p-2 text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] rounded-full transition-colors border border-[#D1CEC7] dark:border-[#334155] cursor-pointer flex items-center"
                title="Herramientas adicionales y opciones"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {moreToolsOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-[#FDFBF7] dark:bg-[#1E293B] rounded-2xl shadow-xl border border-[#D1CEC7] dark:border-[#334155] py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[10px] font-semibold text-[#7C796F] dark:text-[#94A3B8] font-sans uppercase tracking-widest border-b border-[#E5E2D9] dark:border-[#334155]">
                    Herramientas del Árbol
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Chat Assistant item */}
                    {onOpenChatAssistant && canEdit && (
                      <button
                        onClick={() => {
                          onOpenChatAssistant();
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer bg-amber-50/70 dark:bg-amber-950/40 font-semibold"
                      >
                        <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Asistente Chat (Parentescos)</span>
                      </button>
                    )}

                    {/* Family Lobby Item */}
                    <button
                      onClick={() => {
                        openLobby();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer bg-amber-50/40 dark:bg-amber-950/20 font-semibold"
                    >
                      <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Lobby de Familias & Descubrimiento</span>
                    </button>

                    {/* My Accesses Item */}
                    <button
                      onClick={() => {
                        openMyAccessesModal();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-[#5A5A40] dark:text-amber-400" />
                      <span>Mis Accesos y Permisos</span>
                    </button>

                    {/* Owner Permissions Manager */}
                    <button
                      onClick={() => {
                        openPermissionsManager();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Panel del Propietario (Permisos)</span>
                    </button>

                    {/* Share Link */}
                    <button
                      onClick={() => {
                        handleCopyPublicLink();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                    >
                      {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#5A5A40]" />}
                      <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir enlace público'}</span>
                    </button>

                    {/* Libro Decorado */}
                    {onOpenBookModal && (
                      <button
                        onClick={() => {
                          onOpenBookModal();
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                      >
                        <BookMarked className="w-4 h-4 text-[#5A5A40] dark:text-amber-400" />
                        <span>Libro Genealógico Decorado</span>
                      </button>
                    )}

                    {/* Fondos por Apellido */}
                    {onOpenSurnameStyles && canEdit && (
                      <button
                        onClick={() => {
                          onOpenSurnameStyles();
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-[#A65D47] dark:text-amber-400" />
                        <span>Fondos por Apellido</span>
                      </button>
                    )}

                    {/* Duplicates */}
                    {canEdit && (
                      <button
                        onClick={() => {
                          onOpenDuplicates();
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#A65D47] dark:text-amber-400" />
                        <span>Detectar Duplicados</span>
                      </button>
                    )}

                    {/* GEDCOM */}
                    <button
                      onClick={() => {
                        onOpenGedcom();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#7C796F] dark:text-[#94A3B8]" />
                      <span>Importar / Exportar GEDCOM</span>
                    </button>

                    {/* Logros & Gamificación */}
                    <button
                      onClick={() => {
                        openGamificationModal();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer bg-[#FCF8EC]/50 dark:bg-amber-950/20 font-medium"
                    >
                      <Trophy className="w-4 h-4 text-[#B57C1E] dark:text-amber-400" />
                      <span>Logros & Gamificación Familiar</span>
                    </button>

                    {/* Git Versioning */}
                    {onOpenGitModal && (
                      <button
                        onClick={() => {
                          onOpenGitModal('history');
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer"
                      >
                        <GitCommit className="w-4 h-4 text-[#5A5A40] dark:text-amber-400" />
                        <span>Marcas de Versión & Ramas</span>
                      </button>
                    )}

                    {/* Supabase Storage & SQL Setup */}
                    {onOpenSupabaseSql && (
                      <button
                        onClick={() => {
                          onOpenSupabaseSql();
                          setMoreToolsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer bg-amber-500/10 text-amber-900 dark:text-amber-300 font-medium"
                      >
                        <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Supabase Storage & SQL Setup</span>
                      </button>
                    )}

                    {/* Tree Settings */}
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setMoreToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#2C2C2C] dark:text-[#E2E8F0] hover:bg-[#F5F2ED] dark:hover:bg-[#334155] transition-colors flex items-center space-x-2.5 cursor-pointer border-t border-[#E5E2D9] dark:border-[#334155] mt-1 pt-1.5"
                    >
                      <Settings className="w-4 h-4 text-[#7C796F] dark:text-[#94A3B8]" />
                      <span>Configuración del Árbol</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Session Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoleDropdownOpen(!roleDropdownOpen);
                    setTreeDropdownOpen(false);
                    setBranchDropdownOpen(false);
                    setMoreToolsOpen(false);
                  }}
                  className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-[#F5F2ED] hover:bg-[#E5E2D9] rounded-full text-xs font-sans font-medium text-[#434331] border border-[#D1CEC7] transition-colors cursor-pointer"
                  title="Cuenta de usuario"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate hidden md:inline text-[11px]">
                    {currentUser.displayName}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#9A968A] shrink-0" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#D1CEC7] py-2.5 z-50 animate-in fade-in duration-150">
                    <div className="px-3.5 py-2 border-b border-[#E5E2D9] bg-[#F5F2ED]/60 mb-1">
                      <p className="text-[12px] font-sans font-bold text-[#434331] truncate">
                        {currentUser.displayName}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-[#7C796F]">
                        <span className="inline-flex items-center text-blue-700 font-medium truncate">
                          <Cloud className="w-3 h-3 mr-1 shrink-0" /> {currentUser.email}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded text-[10px] font-semibold uppercase tracking-wider">
                          Rol: {activeRole === 'owner' ? 'Propietario' : activeRole}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 px-2.5">
                      <button
                        onClick={() => { logout(); setRoleDropdownOpen(false); }}
                        className="w-full text-left py-1.5 px-2 text-xs text-[#A65D47] hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Mobile & Desktop Responsive */}
        <div className="relative border-t border-[#E5E2D9]/80 dark:border-[#334155] pt-1.5 pb-1.5">
          <div 
            ref={tabsContainerRef}
            className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 text-xs uppercase tracking-wider text-[#7C796F] dark:text-[#94A3B8] font-sans font-semibold touch-pan-x"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-semibold cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#5A5A40] dark:bg-amber-600 text-white shadow-xs font-bold'
                      : 'hover:bg-[#E5E2D9] dark:hover:bg-[#1E293B] text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#7C796F] dark:text-[#94A3B8]'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

