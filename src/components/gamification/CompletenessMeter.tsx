/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person, Relationship, MediaItem, HistoricalSource } from '../../types';
import { GamificationEngine } from '../../services/gamificationEngine';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface CompletenessMeterProps {
  person: Person;
  relationships?: Relationship[];
  media?: MediaItem[];
  sources?: HistoricalSource[];
  compact?: boolean;
}

export const CompletenessMeter: React.FC<CompletenessMeterProps> = ({
  person,
  relationships = [],
  media = [],
  sources = [],
  compact = false
}) => {
  const breakdown = GamificationEngine.calculatePersonCompleteness(person, relationships, media, sources);
  const { score, completedFields, missingFields } = breakdown;

  const getColor = (val: number) => {
    if (val >= 90) return 'text-[#3F6B38] bg-[#3F6B38]';
    if (val >= 60) return 'text-[#B57C1E] bg-[#B57C1E]';
    return 'text-[#9E4A2B] bg-[#9E4A2B]';
  };

  const getBorderColor = (val: number) => {
    if (val >= 90) return 'border-[#3F6B38]/30 bg-[#F4F8F3]';
    if (val >= 60) return 'border-[#B57C1E]/30 bg-[#FCF8EC]';
    return 'border-[#9E4A2B]/30 bg-[#FDF4F0]';
  };

  if (compact) {
    return (
      <div 
        className="flex items-center space-x-1.5 text-[11px] font-sans"
        title={`Completitud del perfil: ${score}%\nCampos pendientes: ${missingFields.join(', ')}`}
      >
        <div className="w-12 h-1.5 bg-[#D1CEC7] rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(score).split(' ')[1]} transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`font-mono font-bold ${getColor(score).split(' ')[0]}`}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${getBorderColor(score)} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-4 h-4 ${getColor(score).split(' ')[0]}`} />
          <span className="text-xs font-serif font-bold text-[#434331]">
            Nivel de Completitud del Perfil
          </span>
        </div>
        <span className={`text-xs font-mono font-bold ${getColor(score).split(' ')[0]}`}>
          {score}% Completo
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#D1CEC7]/60 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full ${getColor(score).split(' ')[1]} transition-all duration-500 rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown Checklist */}
      <div className="mt-2.5 pt-2 border-t border-[#D1CEC7]/40 grid grid-cols-2 gap-1.5 text-[11px]">
        {completedFields.slice(0, 4).map((f, i) => (
          <div key={`comp_${i}`} className="flex items-center space-x-1 text-[#3F6B38]">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{f}</span>
          </div>
        ))}
        {missingFields.slice(0, 2).map((f, i) => (
          <div key={`miss_${i}`} className="flex items-center space-x-1 text-[#9E4A2B]">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate font-medium">Falta: {f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
