import React, { useState } from 'react';
import { 
  History, Clock, User, Filter, ArrowRight, 
  FileEdit, PlusCircle, Trash2, Link2
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';

interface ChangeHistoryViewProps {
  onSelectPersonById: (personId: string) => void;
}

export const ChangeHistoryView: React.FC<ChangeHistoryViewProps> = ({
  onSelectPersonById
}) => {
  const { changes } = useTree();
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = changes.filter(log => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#FDFBF7] p-6 rounded-3xl border border-[#D1CEC7] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-[#5A5A40]" />
            <h2 className="font-serif text-2xl font-bold text-[#434331]">
              Historial de Cambios & Auditoría
            </h2>
          </div>
          <p className="text-xs text-[#7C796F] mt-1 font-serif italic">
            Trazabilidad completa de modificaciones, adiciones y revisiones realizadas en el árbol genealógico.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#7C796F]" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-[#D1CEC7] rounded-full px-3 py-1.5 bg-[#F5F2ED] text-xs text-[#434331] focus:outline-none"
          >
            <option value="all">Todas las acciones</option>
            <option value="create">Creaciones</option>
            <option value="update">Modificaciones</option>
            <option value="delete">Eliminaciones</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
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
                      className="self-end sm:self-center text-xs text-[#5A5A40] hover:text-[#434331] font-sans font-semibold uppercase tracking-wider flex items-center space-x-1 bg-[#F5F2ED] px-3 py-1.5 rounded-full border border-[#D1CEC7] transition-colors"
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
    </div>
  );
};
