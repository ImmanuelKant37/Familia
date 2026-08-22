import React, { useState } from 'react';
import { 
  History, Clock, User, Filter, ArrowRight, 
  FileEdit, PlusCircle, Trash2, Link2, GitBranch,
  GitCommit, GitMerge, RotateCcw, AlertTriangle, ChevronRight, ChevronDown, CheckCircle
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { TreeCommit } from '../../types';
import { GitVersionModal } from '../git/GitVersionModal';

interface ChangeHistoryViewProps {
  onSelectPersonById: (personId: string) => void;
}

export const ChangeHistoryView: React.FC<ChangeHistoryViewProps> = ({
  onSelectPersonById
}) => {
  const { 
    changes, 
    commits, 
    branches, 
    activeBranchId, 
    currentCommitId,
    restoreCommit,
    switchBranch,
    canEdit 
  } = useTree();

  const [viewMode, setViewMode] = useState<'git' | 'audit'>('git');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [showGitModal, setShowGitModal] = useState(false);
  const [gitModalTab, setGitModalTab] = useState<'history' | 'branches' | 'merge' | 'abandoned'>('history');
  const [expandedCommitId, setExpandedCommitId] = useState<string | null>(null);

  const filteredLogs = changes.filter(log => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const filteredCommits = commits.filter(c => {
    if (branchFilter === 'all') return true;
    return c.branchId === branchFilter;
  });

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  const abandonedBranches = branches.filter(b => !b.isDefault && b.id !== activeBranchId);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Creación', color: 'bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30', icon: PlusCircle };
      case 'update':
        return { label: 'Edición de Datos', color: 'bg-[#A65D47]/15 text-[#A65D47] border-[#A65D47]/30', icon: FileEdit };
      case 'delete':
        return { label: 'Registro Eliminado', color: 'bg-red-100 text-red-800 border-red-200', icon: Trash2 };
      case 'restore':
        return { label: 'Restaurado', color: 'bg-[#E5E2D9] text-[#434331] border-[#D1CEC7]', icon: Link2 };
      default:
        return { label: action, color: 'bg-[#F5F2ED] text-[#434331] border-[#D1CEC7]', icon: History };
    }
  };

  const handleRestoreCommit = async (commit: TreeCommit) => {
    const confirmMsg = `¿Deseas restaurar el árbol al estado de la marca "${commit.message}"? (Generará una nueva traza en el historial conservando la trazabilidad).`;
    if (window.confirm(confirmMsg)) {
      await restoreCommit(commit.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      
      {/* Header with branches & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#FDFBF7] p-6 rounded-3xl border border-[#D1CEC7] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-[#5A5A40]" />
            <h2 className="font-serif text-2xl font-bold text-[#434331]">
              Historial, Marcas & Trazabilidad
            </h2>
          </div>
          <p className="text-xs text-[#7C796F] mt-1 font-serif italic">
            Trazabilidad inmutable de movimientos, identificación de autores, bifurcación en ramas y marcas históricas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setGitModalTab('branches');
              setShowGitModal(true);
            }}
            className="text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] px-3.5 py-2 rounded-full border border-[#D1CEC7] font-sans font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Ramas ({branches.length})</span>
          </button>

          {abandonedBranches.length > 0 && (
            <button
              onClick={() => {
                setGitModalTab('abandoned');
                setShowGitModal(true);
              }}
              className="text-xs bg-[#A65D47]/10 hover:bg-[#A65D47]/20 text-[#A65D47] px-3.5 py-2 rounded-full border border-[#A65D47]/30 font-sans font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer animate-pulse"
              title="Ramas secundarias que pueden ser integradas"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{abandonedBranches.length} Rama(s) a Integrar</span>
            </button>
          )}

          <button
            onClick={() => {
              setGitModalTab('history');
              setShowGitModal(true);
            }}
            className="text-xs bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-full font-sans font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Panel de Marcas & Ramas</span>
          </button>
        </div>
      </div>

      {/* Subtabs: Versiones vs Registro de Actividad */}
      <div className="flex items-center justify-between mb-4 border-b border-[#E5E2D9] pb-2">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('git')}
            className={`text-xs font-sans font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'git'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Marcas de Guardado ({commits.length})</span>
          </button>

          <button
            onClick={() => setViewMode('audit')}
            className={`text-xs font-sans font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'audit'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Registro de Actividad ({changes.length})</span>
          </button>
        </div>

        {/* Filter */}
        {viewMode === 'git' ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#7C796F]">Rama:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-[#D1CEC7] rounded-full px-3 py-1 bg-[#FDFBF7] text-xs text-[#434331] focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las ramas</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} {b.isDefault ? '(Principal)' : ''}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#7C796F]" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border border-[#D1CEC7] rounded-full px-3 py-1 bg-[#FDFBF7] text-xs text-[#434331] focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las acciones</option>
              <option value="create">Creaciones</option>
              <option value="update">Modificaciones</option>
              <option value="delete">Eliminaciones</option>
            </select>
          </div>
        )}
      </div>

      {/* VERSIONS / RESTORE POINTS VIEW */}
      {viewMode === 'git' && (
        <div className="bg-white rounded-3xl border border-[#E5E2D9] p-6 shadow-2xs space-y-4">
          <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D1CEC7]">
            {filteredCommits.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9A968A] font-serif italic">
                No hay marcas ni trazas registradas en esta rama todavía.
              </div>
            ) : (
              filteredCommits.map((commit) => {
                const isHead = commit.id === currentCommitId;
                const isExpanded = expandedCommitId === commit.id;
                const branchOfCommit = branches.find(b => b.id === commit.branchId);

                return (
                  <div 
                    key={commit.id} 
                    className={`relative p-4 rounded-2xl border transition-all ${
                      isHead 
                        ? 'bg-[#FDFBF7] border-[#5A5A40] shadow-xs ring-1 ring-[#5A5A40]/20' 
                        : 'bg-white border-[#E5E2D9] hover:border-[#D1CEC7]'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 transform -translate-x-1/2 ${
                        isHead 
                          ? 'bg-[#5A5A40] border-[#FDFBF7] ring-2 ring-[#5A5A40]' 
                          : 'bg-[#D1CEC7] border-white'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        
                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isHead && (
                            <span className="bg-[#5A5A40] text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Estado Actual
                            </span>
                          )}
                          <span className="bg-[#E5E2D9] text-[#434331] text-[10px] font-sans font-medium px-2 py-0.5 rounded-full">
                            {branchOfCommit?.name || commit.branchName || commit.branchId}
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

                        {/* Commit message */}
                        <p className="font-serif font-bold text-sm sm:text-base text-[#2C2C2C]">
                          {commit.message}
                        </p>

                        {/* Author info (Validar quién fue) */}
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
                              {commit.snapshot.people.length} personas • {commit.snapshot.relationships.length} relaciones
                            </div>
                          )}
                        </div>

                        {/* Diffs */}
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
                                    <span>{isExpanded ? 'Ocultar diffs' : `Ver ${diffsList.length} cambios en campos`}</span>
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

                      {/* Restore action */}
                      {canEdit && (
                        <button
                          onClick={() => handleRestoreCommit(commit)}
                          className="px-3 py-1.5 text-xs bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] rounded-full border border-[#D1CEC7] transition-colors flex items-center space-x-1.5 cursor-pointer font-medium shrink-0 self-end sm:self-start"
                          title="Restaurar el árbol a este estado histórico"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>Volver a este punto</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY LOG VIEW */}
      {viewMode === 'audit' && (
        <div className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-2xs">
          <div className="divide-y divide-[#E5E2D9]">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9A968A] font-serif italic">
                No hay registros de auditoría que coincidan con el filtro seleccionado.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const badge = getActionBadge(log.action);
                const Icon = badge.icon;

                return (
                  <div key={log.id} className="p-4 sm:p-5 hover:bg-[#FDFBF7] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-2xl bg-[#F5F2ED] text-[#5A5A40] border border-[#D1CEC7] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-serif font-bold text-[#434331]">
                            {log.entityType.toUpperCase()}: {log.entityName || log.entityId}
                          </span>
                        </div>
                        <p className="text-xs text-[#2C2C2C] mt-1 font-serif">
                          {log.summary}
                        </p>
                        <div className="flex items-center space-x-3 text-[11px] text-[#7C796F] mt-1.5 font-mono">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-[#9A968A]" />
                            <span>{log.userName}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#9A968A]" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {log.entityType === 'person' && (
                      <button
                        onClick={() => onSelectPersonById(log.entityId)}
                        className="self-end sm:self-center text-xs text-[#5A5A40] hover:text-[#434331] font-sans font-semibold uppercase tracking-wider flex items-center space-x-1 bg-[#F5F2ED] px-3 py-1.5 rounded-full border border-[#D1CEC7] transition-colors cursor-pointer"
                      >
                        <span>Ver Ficha</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showGitModal && (
        <GitVersionModal
          initialTab={gitModalTab}
          onClose={() => setShowGitModal(false)}
        />
      )}
    </div>
  );
};

