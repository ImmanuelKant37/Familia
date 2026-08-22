import React, { useState } from 'react';
import { 
  Network, Calendar, Image as ImageIcon, MapPin, 
  BookOpen, Users, History, Settings, Search, 
  Plus, Upload, Shield, LogIn, LogOut, CheckCircle, 
  Sparkles, Share2, Globe, Lock, Trash2, FolderTree,
  Palette, BookMarked, HardDrive, Cloud, User, UserCheck,
  GitBranch, GitCommit, GitMerge, RotateCcw, RotateCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTree } from '../../context/TreeContext';

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
  onOpenGitModal
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

  const [treeDropdownOpen, setTreeDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  return (
    <header className="bg-[#FDFBF7] border-b border-[#D1CEC7] sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tree Selector */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs border border-[#434331]/30">
                <span className="tracking-tighter">F</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-serif font-bold text-[#434331] text-base sm:text-lg uppercase tracking-tight block leading-tight">
                  Familia
                </span>
                <span className="text-[10px] text-[#7C796F] font-sans font-semibold tracking-widest uppercase">
                  Árbol Genealógico Digital
                </span>
              </div>
            </div>

            {/* Tree Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTreeDropdownOpen(!treeDropdownOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-[#D1CEC7] transition-colors"
                title="Cambiar de árbol familiar"
              >
                <span className="truncate max-w-[120px] sm:max-w-[180px] font-serif">
                  {activeTree?.name || 'Familia'}
                </span>
                <span className="text-[#9A968A] text-[10px]">▼</span>
              </button>

              {treeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#D1CEC7] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#7C796F] font-sans uppercase tracking-widest border-b border-[#E5E2D9] flex items-center justify-between">
                    <span>Árboles Familiares ({trees.length})</span>
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('create');
                      }}
                      className="text-[#5A5A40] hover:text-[#434331] lowercase text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
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
                          className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-[#F5F2ED] transition-colors cursor-pointer group ${
                            isCurrent ? 'bg-[#E5E2D9] text-[#434331] font-semibold' : 'text-[#2C2C2C]'
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
                            <div className="text-[11px] text-[#7C796F] font-normal truncate italic font-serif">
                              {t.description || 'Sin descripción'}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {t.visibility === 'public' ? (
                              <Globe className="w-3.5 h-3.5 text-[#5A5A40]" title="Público" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#9A968A]" title="Privado" />
                            )}
                            
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTreeQuick(e, t.id, t.name)}
                              className="p-1 text-[#9A968A] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                              title={`Eliminar familia ${t.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E5E2D9] mt-1 pt-1.5 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('create');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#5A5A40] hover:bg-[#F5F2ED] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Crear Nueva Familia</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setTreeDropdownOpen(false);
                        onOpenSettings('list');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-[#7C796F] hover:bg-[#F5F2ED] rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Administrar Familias y Ajustes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Search Trigger */}
          <div className="flex-1 max-w-xs mx-4 hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between bg-[#F5F2ED] hover:bg-[#E5E2D9]/60 border border-[#D1CEC7] text-[#7C796F] text-xs rounded-full px-3.5 py-1.5 transition-all shadow-2xs"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-[#9A968A]" />
                <span className="font-sans">Buscar antepasado, año, lugar...</span>
              </div>
              <kbd className="bg-[#E5E2D9] text-[#7C796F] text-[10px] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Search mobile */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#7C796F] hover:text-[#434331] md:hidden rounded-full hover:bg-[#F5F2ED]"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Undo & Redo Quick Buttons */}
            {canEdit && (
              <div className="hidden lg:flex items-center space-x-1 bg-[#F5F2ED] rounded-full p-0.5 border border-[#D1CEC7]">
                <button
                  onClick={() => undo()}
                  className="p-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
                  title="Deshacer cambio en el árbol (Ctrl+Z)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => redo()}
                  className="p-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
                  title="Rehacer cambio en el árbol (Ctrl+Shift+Z / Ctrl+Y)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Branch Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#F5F2ED] hover:bg-[#E5E2D9] rounded-full text-xs font-sans font-medium text-[#434331] border border-[#D1CEC7] transition-colors cursor-pointer"
                title="Rama activa del árbol"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="truncate max-w-[100px] font-serif">{currentBranch?.name || 'main'}</span>
                <span className="text-[9px] text-[#9A968A]">▼</span>
              </button>

              {branchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#D1CEC7] py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#7C796F] font-sans uppercase tracking-widest border-b border-[#E5E2D9] flex items-center justify-between">
                    <span>Ramas ({branches.length})</span>
                    {onOpenGitModal && (
                      <button
                        onClick={() => {
                          setBranchDropdownOpen(false);
                          onOpenGitModal('branches');
                        }}
                        className="text-[#5A5A40] hover:text-[#434331] lowercase text-[11px] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>nueva</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-56 overflow-y-auto py-1">
                    {branches.map(b => {
                      const isCurrent = b.id === activeBranchId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            switchBranch(b.id);
                            setBranchDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F5F2ED] transition-colors cursor-pointer ${
                            isCurrent ? 'bg-[#E5E2D9] text-[#434331] font-semibold' : 'text-[#2C2C2C]'
                          }`}
                        >
                          <div className="truncate flex-1 mr-2">
                            <div className="flex items-center space-x-1.5 font-serif">
                              <span className="truncate">{b.name}</span>
                              {b.isDefault && (
                                <span className="text-[9px] bg-[#5A5A40] text-white px-1.5 py-0.2 rounded-full uppercase font-sans font-bold">
                                  Principal
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full uppercase font-sans font-bold">
                                  Activa
                                </span>
                              )}
                            </div>
                            {b.description && (
                              <div className="text-[10px] text-[#7C796F] truncate italic font-serif">
                                {b.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {onOpenGitModal && (
                    <div className="border-t border-[#E5E2D9] px-3 pt-1.5 mt-1">
                      <button
                        onClick={() => {
                          setBranchDropdownOpen(false);
                          onOpenGitModal('history');
                        }}
                        className="w-full text-center py-1.5 text-xs text-[#5A5A40] font-sans font-bold uppercase tracking-wider hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
                      >
                        Ver Historial & Integrar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alert for Abandoned Branches */}
            {abandonedBranches.length > 0 && onOpenGitModal && (
              <button
                onClick={() => onOpenGitModal('abandoned')}
                className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 bg-[#A65D47]/10 hover:bg-[#A65D47]/20 text-[#A65D47] rounded-full border border-[#A65D47]/30 text-xs font-sans font-semibold transition-colors cursor-pointer animate-pulse"
                title="Hay ramas secundarias que quedaron pendientes de integrar a la principal"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{abandonedBranches.length} rama olvidada</span>
              </button>
            )}

            {/* Version History Button */}
            {onOpenGitModal && (
              <button
                onClick={() => onOpenGitModal('history')}
                className="p-2 text-[#7C796F] hover:text-[#5A5A40] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7] cursor-pointer"
                title="Historial de Versiones & Trazabilidad"
              >
                <GitCommit className="w-4 h-4 text-[#5A5A40]" />
              </button>
            )}

            {/* Quick Add Person Button */}
            {canEdit && (
              <button
                onClick={onOpenNewPerson}
                className="bg-[#5A5A40] hover:bg-[#434331] text-white px-3 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs transition-colors"
                id="btn-quick-add-person"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Persona</span>
                <span className="sm:hidden">Añadir</span>
              </button>
            )}

            {/* Share public link */}
            <button
              onClick={handleCopyPublicLink}
              className="p-2 text-[#7C796F] hover:text-[#5A5A40] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7]"
              title="Compartir enlace del árbol"
            >
              {copiedLink ? (
                <CheckCircle className="w-4 h-4 text-[#5A5A40]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Libro Decorado Export Button */}
            {onOpenBookModal && (
              <button
                onClick={onOpenBookModal}
                className="px-2.5 py-1.5 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#5A5A40] rounded-full transition-colors border border-[#D1CEC7] hidden md:flex items-center space-x-1.5 text-xs font-sans font-semibold uppercase tracking-wider shadow-2xs cursor-pointer"
                title="Exportar Libro Genealógico Decorado (PDF, Excel, JSON)"
              >
                <BookMarked className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden xl:inline">Libro Decorado</span>
                <span className="xl:hidden">Libro</span>
              </button>
            )}

            {/* Surnames Theme Styler */}
            {onOpenSurnameStyles && canEdit && (
              <button
                onClick={onOpenSurnameStyles}
                className="px-2.5 py-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7] hidden lg:flex items-center space-x-1.5 text-xs font-sans font-semibold uppercase tracking-wider cursor-pointer"
                title="Personalizar Fondos y Paletas por Apellido"
              >
                <Palette className="w-3.5 h-3.5 text-[#A65D47]" />
                <span className="hidden xl:inline">Fondos Apellido</span>
                <span className="xl:hidden">Fondos</span>
              </button>
            )}

            {/* GEDCOM / Tools Button */}
            <button
              onClick={onOpenGedcom}
              className="px-2.5 py-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7] hidden 2xl:flex items-center space-x-1 text-xs font-sans font-semibold uppercase tracking-wider"
              title="Importar / Exportar GEDCOM"
            >
              <Upload className="w-3.5 h-3.5 text-[#7C796F]" />
              <span>GEDCOM</span>
            </button>

            {/* Duplicates detector */}
            {canEdit && (
              <button
                onClick={onOpenDuplicates}
                className="px-2.5 py-1.5 text-[#7C796F] hover:text-[#A65D47] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7] hidden xl:flex items-center space-x-1 text-xs font-sans font-semibold uppercase tracking-wider"
                title="Detector de posibles duplicados"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Duplicados</span>
              </button>
            )}

            {/* Collaboration Hub */}
            <button
              onClick={onOpenCollab}
              className="relative p-2 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7]"
              title="Colaboración y Propuestas Familiares"
            >
              <Users className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A65D47] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Tree Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors border border-[#D1CEC7]"
              title="Configuración y Privacidad del Árbol"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Storage Mode Badge */}
            <div 
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-[#F5F2ED] rounded-full text-[11px] font-sans font-medium text-[#5A5A40] border border-[#D1CEC7]"
              title="Sincronización en la base de datos de Firebase activa"
            >
              <Cloud className="w-3 h-3 text-[#5A5A40]" />
              <span>Nube Firebase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </div>

            {/* User Profile & Session Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 bg-[#F5F2ED] hover:bg-[#E5E2D9] rounded-full text-xs font-sans font-medium text-[#434331] border border-[#D1CEC7] transition-colors cursor-pointer"
                  title="Cuenta y sesión en Firebase"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.displayName}</span>
                  <span className="text-[10px] text-[#9A968A]">▼</span>
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#D1CEC7] py-2.5 z-50 animate-in fade-in duration-150">
                    {/* Current User Info */}
                    <div className="px-4 py-2 border-b border-[#E5E2D9] bg-[#F5F2ED]/60 mb-1">
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

                    <div className="pt-1 px-3">
                      <button
                        onClick={() => { logout(); setRoleDropdownOpen(false); }}
                        className="w-full text-left py-2 px-2 text-xs text-[#A65D47] hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-2 font-medium cursor-pointer"
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

        {/* Navigation Tabs */}
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm uppercase tracking-widest text-[#7C796F] font-sans font-semibold border-t border-[#E5E2D9]/60 pt-2">
          <button
            onClick={() => onTabChange('tree')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'tree'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Árbol</span>
          </button>

          <button
            onClick={() => onTabChange('timeline')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Línea de Tiempo</span>
          </button>

          <button
            onClick={() => onTabChange('media')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'media'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galería</span>
          </button>

          <button
            onClick={() => onTabChange('map')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Rutas & Migración</span>
          </button>

          <button
            onClick={() => onTabChange('sources')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'sources'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fuentes</span>
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`pb-1.5 flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              activeTab === 'audit'
                ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] font-bold'
                : 'hover:text-[#5A5A40]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
          </button>
        </div>
      </div>
    </header>
  );
};
