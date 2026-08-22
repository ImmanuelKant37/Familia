import React, { useState } from 'react';
import { 
  GitBranch, GitCommit, GitMerge, RotateCcw, Clock, 
  User, CheckCircle, AlertTriangle, ArrowRight, Plus, 
  Trash2, Shield, Play, ChevronDown, ChevronRight,
  Split, Eye, Sparkles, RefreshCw, X, FileText, Check, HelpCircle
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { useAuth } from '../../context/AuthContext';
import { TreeCommit, TreeBranch, BranchDiffSummary, MergeStrategy } from '../../types';

interface GitVersionModalProps {
  onClose: () => void;
  initialTab?: 'history' | 'branches' | 'merge' | 'abandoned';
}

export const GitVersionModal: React.FC<GitVersionModalProps> = ({
  onClose,
  initialTab = 'history'
}) => {
  const { 
    commits, 
    branches, 
    activeBranchId, 
    currentCommitId,
    activeTree,
    canEdit,
    undo,
    redo,
    createBranch,
    switchBranch,
    deleteBranch,
    restoreCommit,
    getBranchDiff,
    mergeBranch
  } = useTree();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'merge' | 'abandoned'>(initialTab);
  
  // Create branch modal/form
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDesc, setNewBranchDesc] = useState('');
  const [newBranchSourceCommitId, setNewBranchSourceCommitId] = useState<string | undefined>(undefined);
  const [showCreateBranchForm, setShowCreateBranchForm] = useState(false);

  // Merge state
  const [sourceBranchId, setSourceBranchId] = useState<string>('');
  const [targetBranchId, setTargetBranchId] = useState<string>(activeBranchId || 'main');
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('merge_combine');
  const [branchDiff, setBranchDiff] = useState<BranchDiffSummary | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState<string | null>(null);

  // Expanded commit diff view
  const [expandedCommitId, setExpandedCommitId] = useState<string | null>(null);

  // Filter commits by branch
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  const filteredCommits = commits.filter(c => {
    if (branchFilter === 'all') return true;
    return c.branchId === branchFilter;
  });

  // Calculate abandoned / secondary branches
  const abandonedBranches = branches.filter(b => {
    if (b.isDefault || b.id === activeBranchId) return false;
    // Check if head commit is old or different from main
    const mainBranch = branches.find(br => br.isDefault);
    return b.headCommitId !== mainBranch?.headCommitId;
  });

  // Handle create branch
  const handleCreateBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      await createBranch(newBranchName.trim(), newBranchDesc.trim(), newBranchSourceCommitId);
      setNewBranchName('');
      setNewBranchDesc('');
      setShowCreateBranchForm(false);
      setNewBranchSourceCommitId(undefined);
    } catch (err: any) {
      alert(err.message || 'Error al crear la rama');
    }
  };

  // Handle diff check
  const handleCheckDiff = (sourceId: string, targetId: string) => {
    setSourceBranchId(sourceId);
    setTargetBranchId(targetId);
    const diff = getBranchDiff(sourceId, targetId);
    setBranchDiff(diff);
  };

  // Handle merge execution
  const handleExecuteMerge = async () => {
    if (!sourceBranchId || !targetBranchId) return;
    setIsMerging(true);
    setMergeSuccessMsg(null);

    try {
      const srcName = branches.find(b => b.id === sourceBranchId)?.name || 'rama';
      const tgtName = branches.find(b => b.id === targetBranchId)?.name || 'rama';
      
      const success = await mergeBranch(sourceBranchId, targetBranchId, mergeStrategy);
      if (success) {
        setMergeSuccessMsg(`¡Integración completada con éxito! La rama "${srcName}" fue fusionada en "${tgtName}".`);
        setBranchDiff(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al fusionar ramas');
    } finally {
      setIsMerging(false);
    }
  };

  // Handle restore / rollback commit
  const handleRestoreCommit = async (commit: TreeCommit) => {
    const confirmMsg = `¿Deseas restaurar el árbol al estado del commit "${commit.message}"? (Generará un nuevo punto en el historial conservando la trazabilidad).`;
    if (window.confirm(confirmMsg)) {
      await restoreCommit(commit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E2D9] flex items-center justify-between bg-[#F5F2ED]/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#5A5A40] text-white shadow-xs">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-[#434331]">
                  Control de Versiones & Trazabilidad
                </h2>
                <span className="bg-[#5A5A40]/15 text-[#434331] text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#5A5A40]/30">
                  Rama: {currentBranch?.name || 'main'}
                </span>
              </div>
              <p className="text-xs text-[#7C796F] font-serif italic mt-0.5">
                Historial inmutable, ramificaciones, auditoría de autoría y fusión de movimientos familiares.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7C796F] hover:text-[#434331] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-[#E5E2D9] bg-[#FDFBF7] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-sans font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Puntos de Restauración ({commits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-3 px-3 text-xs font-sans font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'branches'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Gestión de Ramas ({branches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('abandoned')}
            className={`pb-3 px-3 text-xs font-sans font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'abandoned'
                ? 'border-[#A65D47] text-[#A65D47]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#A65D47]" />
            <span>Ramas Olvidadas ({abandonedBranches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('merge')}
            className={`pb-3 px-3 text-xs font-sans font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'merge'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>Integrar / Fusionar Ramas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: HISTORY / COMMITS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Filter and Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#D1CEC7]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#7C796F] font-medium">Filtrar por rama:</span>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="text-xs bg-white border border-[#D1CEC7] rounded-full px-3 py-1 text-[#434331] font-sans focus:outline-none cursor-pointer"
                  >
                    <option value="all">Todas las ramas</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} {b.isDefault ? '(Principal)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCreateBranchForm(true)}
                    className="text-xs bg-[#5A5A40] hover:bg-[#434331] text-white px-3 py-1.5 rounded-full font-sans font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Rama desde aquí</span>
                  </button>
                </div>
              </div>

              {/* Commit List Timeline */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D1CEC7]">
                {filteredCommits.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#9A968A] font-serif italic">
                    No hay puntos de restauración registrados en esta rama aún.
                  </div>
                ) : (
                  filteredCommits.map((commit, idx) => {
                    const isHead = commit.id === currentCommitId;
                    const isExpanded = expandedCommitId === commit.id;
                    const branchOfCommit = branches.find(b => b.id === commit.branchId);

                    return (
                      <div 
                        key={commit.id} 
                        className={`relative p-4 rounded-2xl border transition-all ${
                          isHead 
                            ? 'bg-[#FDFBF7] border-[#5A5A40] shadow-sm ring-1 ring-[#5A5A40]/20' 
                            : 'bg-white border-[#E5E2D9] hover:border-[#D1CEC7]'
                        }`}
                      >
                        {/* Dot marker on timeline */}
                        <div 
                          className={`absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 transform -translate-x-1/2 ${
                            isHead 
                              ? 'bg-[#5A5A40] border-[#FDFBF7] ring-2 ring-[#5A5A40]' 
                              : 'bg-[#D1CEC7] border-white'
                          }`}
                        />

                        {/* Commit Card Content */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            
                            {/* Tags & Action type */}
                            <div className="flex flex-wrap items-center gap-2">
                              {isHead && (
                                <span className="bg-[#5A5A40] text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  Estado Actual
                                </span>
                              )}
                              <span className="bg-[#E5E2D9] text-[#434331] text-[10px] font-sans font-medium px-2 py-0.5 rounded-full">
                                Rama: {branchOfCommit?.name || commit.branchName || commit.branchId}
                              </span>
                              <span className="font-mono text-[10px] text-[#7C796F] bg-[#F5F2ED] px-1.5 py-0.5 rounded border border-[#D1CEC7]">
                                #{commit.shortHash}
                              </span>
                              {(commit.delta?.action || commit.actionType) && (
                                <span className="text-[10px] text-[#7C796F] uppercase tracking-wider font-semibold">
                                  {commit.delta?.action || commit.actionType}
                                </span>
                              )}
                            </div>

                            {/* Message */}
                            <p className="font-serif font-semibold text-sm sm:text-base text-[#2C2C2C]">
                              {commit.message}
                            </p>

                            {/* Authorship details ("validar quién fue") */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7C796F] pt-1">
                              <div className="flex items-center space-x-1.5">
                                <div className="w-5 h-5 rounded-full bg-[#E5E2D9] border border-[#D1CEC7] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#434331]">
                                  {(commit.author?.userPhoto || commit.authorPhoto) ? (
                                    <img 
                                      src={commit.author?.userPhoto || commit.authorPhoto} 
                                      alt={commit.author?.userName || commit.authorName || 'Autor'} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    (commit.author?.userName || commit.authorName || 'U')[0]?.toUpperCase()
                                  )}
                                </div>
                                <span className="font-medium text-[#434331]">
                                  {commit.author?.userName || commit.authorName || 'Investigador'}
                                </span>
                                {(commit.author?.isAnonymous || commit.isAnonymous) && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-sans">
                                    Anónimo
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 font-mono text-[11px]">
                                <Clock className="w-3 h-3 text-[#9A968A]" />
                                <span>{new Date(commit.timestamp).toLocaleString()}</span>
                              </div>

                              {commit.snapshot && (
                                <div className="text-[11px] text-[#9A968A]">
                                  {commit.snapshot.people.length} personas • {commit.snapshot.relationships.length} vínculos
                                </div>
                              )}
                            </div>

                            {/* Detailed Diffs Breakdown if available */}
                            {((commit.delta?.fieldDiffs && commit.delta.fieldDiffs.length > 0) || (commit.metadata?.diffs && commit.metadata.diffs.length > 0)) && (
                              <div className="pt-2">
                                {(() => {
                                  const diffsList = commit.delta?.fieldDiffs?.map(d => ({
                                    fieldName: d.fieldLabel || d.field,
                                    oldValue: d.oldValue,
                                    newValue: d.newValue
                                  })) || commit.metadata?.diffs || [];

                                  return (
                                    <>
                                      <button
                                        onClick={() => setExpandedCommitId(isExpanded ? null : commit.id)}
                                        className="text-xs text-[#5A5A40] hover:underline flex items-center space-x-1 font-medium cursor-pointer"
                                      >
                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        <span>{isExpanded ? 'Ocultar detalles del cambio' : `Ver ${diffsList.length} modificación(es)`}</span>
                                      </button>

                                      {isExpanded && (
                                        <div className="mt-2 p-3 bg-[#FDFBF7] rounded-xl border border-[#E5E2D9] space-y-1.5 text-xs font-mono">
                                          {diffsList.map((diff, dIdx) => (
                                            <div key={dIdx} className="flex flex-wrap items-center gap-1.5 text-[#434331]">
                                              <span className="font-bold text-[#5A5A40]">{diff.fieldName}:</span>
                                              <span className="line-through text-red-600 bg-red-50 px-1 rounded">{String(diff.oldValue || 'vacío')}</span>
                                              <ArrowRight className="w-3 h-3 text-[#9A968A]" />
                                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{String(diff.newValue || 'vacío')}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Quick Actions for this commit */}
                          {canEdit && (
                            <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-start">
                              <button
                                onClick={() => handleRestoreCommit(commit)}
                                className="px-2.5 py-1 text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] rounded-full border border-[#D1CEC7] transition-colors flex items-center space-x-1 cursor-pointer font-medium"
                                title="Volver atrás a este punto del árbol"
                              >
                                <RotateCcw className="w-3 h-3 text-[#5A5A40]" />
                                <span>Restaurar</span>
                              </button>

                              <button
                                onClick={() => {
                                  setNewBranchSourceCommitId(commit.id);
                                  setShowCreateBranchForm(true);
                                }}
                                className="px-2.5 py-1 text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#7C796F] hover:text-[#434331] rounded-full border border-[#D1CEC7] transition-colors flex items-center space-x-1 cursor-pointer"
                                title="Crear nueva rama a partir de este commit"
                              >
                                <GitBranch className="w-3 h-3 text-[#7C796F]" />
                                <span>Rama aquí</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHES MANAGEMENT */}
          {activeTab === 'branches' && (
            <div className="space-y-6">
              
              {/* Top Create Branch Form */}
              <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-[#D1CEC7]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-[#5A5A40]" />
                    <h3 className="font-serif font-bold text-sm text-[#434331]">
                      Crear Nueva Rama de Trabajo
                    </h3>
                  </div>
                  <span className="text-xs text-[#7C796F] font-serif italic">
                    Permite experimentar o investigar ramas familiares secundarias sin afectar la principal.
                  </span>
                </div>

                <form onSubmit={handleCreateBranchSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#434331] mb-1">
                        Nombre de la Rama (ej: rama-materna-gomez, hipotesis-italia)
                      </label>
                      <input
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="ej: rama-abuelo-paterno"
                        className="w-full bg-white border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#434331] mb-1">
                        Descripción o Hipótesis Genealógica
                      </label>
                      <input
                        type="text"
                        value={newBranchDesc}
                        onChange={(e) => setNewBranchDesc(e.target.value)}
                        placeholder="ej: Investigación de antepasados inmigrantes"
                        className="w-full bg-white border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-full text-xs font-sans font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Rama</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Branches List */}
              <div className="bg-white rounded-2xl border border-[#E5E2D9] divide-y divide-[#E5E2D9] overflow-hidden">
                {branches.map(branch => {
                  const isCurrent = branch.id === activeBranchId;
                  const branchCommitsCount = commits.filter(c => c.branchId === branch.id).length;

                  return (
                    <div key={branch.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFBF7] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <GitBranch className={`w-4 h-4 ${isCurrent ? 'text-[#5A5A40]' : 'text-[#7C796F]'}`} />
                          <span className="font-serif font-bold text-sm text-[#434331]">
                            {branch.name}
                          </span>
                          {branch.isDefault && (
                            <span className="bg-[#5A5A40]/15 text-[#5A5A40] text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded-full">
                              Principal / Default
                            </span>
                          )}
                          {isCurrent && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded-full">
                              Activa
                            </span>
                          )}
                        </div>

                        {branch.description && (
                          <p className="text-xs text-[#7C796F] font-serif italic">
                            {branch.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-3 text-[11px] text-[#9A968A] font-mono">
                          <span>Creada por: {branch.createdBy?.userName || branch.createdByName || 'Usuario'}</span>
                          <span>•</span>
                          <span>{branchCommitsCount} {branchCommitsCount === 1 ? 'punto registrado' : 'puntos registrados'}</span>
                          <span>•</span>
                          <span>{new Date(branch.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {!isCurrent && (
                          <button
                            onClick={() => switchBranch(branch.id)}
                            className="px-3 py-1.5 text-xs bg-[#5A5A40] hover:bg-[#434331] text-white rounded-full transition-colors font-sans font-medium flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <Play className="w-3 h-3" />
                            <span>Cambiar a esta rama</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSourceBranchId(branch.id);
                            const defaultB = branches.find(b => b.isDefault)?.id || 'main';
                            setTargetBranchId(defaultB);
                            handleCheckDiff(branch.id, defaultB);
                            setActiveTab('merge');
                          }}
                          className="px-3 py-1.5 text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] rounded-full border border-[#D1CEC7] transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <GitMerge className="w-3 h-3 text-[#5A5A40]" />
                          <span>Fusionar</span>
                        </button>

                        {!branch.isDefault && !isCurrent && canEdit && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la rama "${branch.name}"?`)) {
                                deleteBranch(branch.id);
                              }
                            }}
                            className="p-1.5 text-[#9A968A] hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            title="Eliminar rama"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ABANDONED / FORGOTTEN BRANCHES */}
          {activeTab === 'abandoned' && (
            <div className="space-y-4">
              <div className="bg-[#A65D47]/10 p-4 rounded-2xl border border-[#A65D47]/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#A65D47] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#A65D47]">
                    Detección de Ramas Secundarias Desconectadas u Olvidadas
                  </h3>
                  <p className="text-xs text-[#7C796F] font-serif mt-1">
                    Aquí se listan investigaciones, árboles secundarios o ramas paralelas que quedaron desactualizadas con respecto a la rama principal. Puedes integrarlas en cualquier momento con 1 clic sin perder información.
                  </p>
                </div>
              </div>

              {abandonedBranches.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-[#E5E2D9] text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-serif font-bold text-sm text-[#434331]">
                    ¡Todas las ramas están al día!
                  </p>
                  <p className="text-xs text-[#7C796F] font-serif italic">
                    No hay ramas secundarias huérfanas o con cambios pendientes de integrar.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] divide-y divide-[#E5E2D9] overflow-hidden">
                  {abandonedBranches.map(branch => {
                    return (
                      <div key={branch.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFBF7] transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif font-bold text-sm text-[#434331]">
                              {branch.name}
                            </span>
                            <span className="bg-[#A65D47]/15 text-[#A65D47] text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded-full">
                              Rama Secundaria
                            </span>
                          </div>
                          {branch.description && (
                            <p className="text-xs text-[#7C796F] font-serif italic">
                              {branch.description}
                            </p>
                          )}
                          <div className="text-[11px] text-[#9A968A] font-mono">
                            Última modificación: {new Date(branch.updatedAt || branch.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              const defaultBranch = branches.find(b => b.isDefault)?.id || 'main';
                              setSourceBranchId(branch.id);
                              setTargetBranchId(defaultBranch);
                              handleCheckDiff(branch.id, defaultBranch);
                              setActiveTab('merge');
                            }}
                            className="px-3.5 py-1.5 text-xs bg-[#5A5A40] hover:bg-[#434331] text-white rounded-full font-sans font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>Integrar a Rama Principal</span>
                          </button>

                          <button
                            onClick={() => switchBranch(branch.id)}
                            className="px-3 py-1.5 text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] rounded-full border border-[#D1CEC7] transition-colors cursor-pointer"
                          >
                            <span>Revisar Rama</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MERGE / FUSION */}
          {activeTab === 'merge' && (
            <div className="space-y-6">
              
              {mergeSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{mergeSuccessMsg}</span>
                </div>
              )}

              {/* Selector Source -> Target */}
              <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-[#D1CEC7] space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#434331] flex items-center space-x-2">
                  <GitMerge className="w-4 h-4 text-[#5A5A40]" />
                  <span>Configurar Fusión de Ramas</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#434331] mb-1">
                      Rama Origen (Cambios a importar)
                    </label>
                    <select
                      value={sourceBranchId}
                      onChange={(e) => {
                        setSourceBranchId(e.target.value);
                        if (targetBranchId) handleCheckDiff(e.target.value, targetBranchId);
                      }}
                      className="w-full bg-white border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                    >
                      <option value="">Selecciona una rama origen...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id} disabled={b.id === targetBranchId}>
                          {b.name} {b.isDefault ? '(Principal)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#434331] mb-1">
                      Rama Destino (Receptora de los cambios)
                    </label>
                    <select
                      value={targetBranchId}
                      onChange={(e) => {
                        setTargetBranchId(e.target.value);
                        if (sourceBranchId) handleCheckDiff(sourceBranchId, e.target.value);
                      }}
                      className="w-full bg-white border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                    >
                      <option value="">Selecciona la rama destino...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id} disabled={b.id === sourceBranchId}>
                          {b.name} {b.isDefault ? '(Principal)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Merge Strategy */}
                <div>
                  <label className="block text-xs font-semibold text-[#434331] mb-1.5">
                    Estrategia de Resolución en caso de conflicto:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label 
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                        mergeStrategy === 'merge_combine' 
                          ? 'bg-white border-[#5A5A40] ring-1 ring-[#5A5A40]' 
                          : 'bg-[#FDFBF7] border-[#D1CEC7] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <input
                          type="radio"
                          name="mergeStrategy"
                          checked={mergeStrategy === 'merge_combine'}
                          onChange={() => setMergeStrategy('merge_combine')}
                          className="text-[#5A5A40]"
                        />
                        <span className="font-bold text-[#434331]">Unión Inteligente</span>
                      </div>
                      <p className="text-[11px] text-[#7C796F]">
                        Combina registros nuevos y actualiza con la versión más completa.
                      </p>
                    </label>

                    <label 
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                        mergeStrategy === 'take_source' 
                          ? 'bg-white border-[#5A5A40] ring-1 ring-[#5A5A40]' 
                          : 'bg-[#FDFBF7] border-[#D1CEC7] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <input
                          type="radio"
                          name="mergeStrategy"
                          checked={mergeStrategy === 'take_source'}
                          onChange={() => setMergeStrategy('take_source')}
                          className="text-[#5A5A40]"
                        />
                        <span className="font-bold text-[#434331]">Prioridad Origen</span>
                      </div>
                      <p className="text-[11px] text-[#7C796F]">
                        Sobrescribe personas duplicadas con los datos de la rama que se integra.
                      </p>
                    </label>

                    <label 
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                        mergeStrategy === 'take_target' 
                          ? 'bg-white border-[#5A5A40] ring-1 ring-[#5A5A40]' 
                          : 'bg-[#FDFBF7] border-[#D1CEC7] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <input
                          type="radio"
                          name="mergeStrategy"
                          checked={mergeStrategy === 'take_target'}
                          onChange={() => setMergeStrategy('take_target')}
                          className="text-[#5A5A40]"
                        />
                        <span className="font-bold text-[#434331]">Prioridad Destino</span>
                      </div>
                      <p className="text-[11px] text-[#7C796F]">
                        Conserva los datos existentes en la rama destino si existen colisiones.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Branch Diff Preview */}
              {branchDiff && (
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#434331] flex items-center space-x-2">
                      <Split className="w-4 h-4 text-[#5A5A40]" />
                      <span>Resumen de Cambios a Integrar (Diff)</span>
                    </h4>
                    <span className="text-xs text-[#7C796F] font-mono">
                      {branchDiff.ahead} {branchDiff.ahead === 1 ? 'cambio de ventaja' : 'cambios de ventaja'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E5E2D9] text-center">
                      <div className="text-base font-bold text-emerald-700">+{branchDiff.addedPeople.length}</div>
                      <div className="text-[10px] text-[#7C796F] font-medium uppercase">Personas Nuevas</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E5E2D9] text-center">
                      <div className="text-base font-bold text-[#5A5A40]">~{branchDiff.modifiedPeople.length}</div>
                      <div className="text-[10px] text-[#7C796F] font-medium uppercase">Personas Modificadas</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E5E2D9] text-center">
                      <div className="text-base font-bold text-emerald-700">+{branchDiff.addedRelationships.length}</div>
                      <div className="text-[10px] text-[#7C796F] font-medium uppercase">Vínculos Nuevos</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E5E2D9] text-center">
                      <div className="text-base font-bold text-red-600">-{branchDiff.deletedPeople.length}</div>
                      <div className="text-[10px] text-[#7C796F] font-medium uppercase">Eliminaciones</div>
                    </div>
                  </div>

                  {/* List of affected people */}
                  {branchDiff.addedPeople.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-emerald-800">Personas a agregar al destino:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {branchDiff.addedPeople.map(p => (
                          <span key={p.id} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                            + {p.firstName} {p.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleExecuteMerge}
                      disabled={isMerging}
                      className="bg-[#5A5A40] hover:bg-[#434331] disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>{isMerging ? 'Integrando...' : 'Confirmar & Fusionar Rama'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E2D9] bg-[#F5F2ED]/60 flex items-center justify-between text-xs text-[#7C796F] font-serif shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#5A5A40]" />
            <span>Trazabilidad Histórica: Cada modificación registra autor, fecha, identificador único y registro detallado de cambios.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#E5E2D9] hover:bg-[#D1CEC7] text-[#434331] rounded-full text-xs font-sans font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
