import React, { useState } from 'react';
import { History, ChevronUp, ChevronDown, Activity, Clock, User, ShieldCheck } from 'lucide-react';
import { useTree } from '../../context/TreeContext';

interface LiveActivityTickerProps {
  onOpenFullHistory?: () => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  onOpenFullHistory
}) => {
  const { changes } = useTree();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const recentChanges = changes.slice(0, 8);
  const latest = changes[0];

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 10) return 'Ahora mismo';
      if (diff < 60) return `Hace ${diff}s`;
      if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
      return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end max-w-sm w-full font-sans select-none pointer-events-auto">
      {/* Expanded Change Stream */}
      {isExpanded && (
        <div className="w-full bg-[#FDFBF7]/95 backdrop-blur-md border border-[#D1CEC7] rounded-3xl p-4 shadow-xl mb-2 text-xs space-y-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-semibold text-[#434331] uppercase tracking-wider text-[10px]">
                Log de Movimientos en Vivo
              </span>
            </div>
            {onOpenFullHistory && (
              <button
                onClick={onOpenFullHistory}
                className="text-[10px] text-[#5A5A40] hover:text-[#434331] font-semibold underline underline-offset-2"
              >
                Ver Auditoría Completa
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
            {recentChanges.length === 0 ? (
              <p className="text-[#9A968A] text-center py-3 italic">Sin movimientos registrados aún</p>
            ) : (
              recentChanges.map((chg) => (
                <div
                  key={chg.id}
                  className="bg-[#F5F2ED] border border-[#E5E2D9] p-2.5 rounded-2xl flex items-start space-x-2 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-[#7C796F] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#434331] font-medium leading-tight">{chg.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#7C796F] mt-1">
                      <span className="flex items-center space-x-1">
                        <User className="w-2.5 h-2.5 text-[#9A968A]" />
                        <span className="truncate max-w-[120px]">{chg.userName}</span>
                      </span>
                      <span className="font-mono text-[#9A968A]">{formatRelativeTime(chg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-1 text-[10px] text-[#7C796F] flex items-center justify-center space-x-1.5 border-t border-[#E5E2D9]">
            <ShieldCheck className="w-3 h-3 text-[#5A5A40]" />
            <span>Todos los cambios son públicos y trazables en tiempo real</span>
          </div>
        </div>
      )}

      {/* Ticker Capsule Pill Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2.5 bg-[#FDFBF7]/95 hover:bg-white text-[#434331] px-4 py-2 rounded-full border border-[#D1CEC7] shadow-md backdrop-blur-md transition-all text-xs font-medium cursor-pointer"
        title="Historial de Movimientos Públicos"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        <Activity className="w-3.5 h-3.5 text-[#5A5A40]" />
        
        <span className="truncate max-w-[200px] text-left text-[11px]">
          {latest ? latest.summary : 'Log de Movimientos Públicos'}
        </span>

        <span className="text-[10px] font-mono text-[#7C796F] border-l border-[#E5E2D9] pl-2 shrink-0">
          {latest ? formatRelativeTime(latest.timestamp) : 'Activo'}
        </span>

        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#7C796F]" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-[#7C796F]" />
        )}
      </button>
    </div>
  );
};
