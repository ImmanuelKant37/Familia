/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Trophy, Flame, Sparkles } from 'lucide-react';

interface HeaderGamificationBadgeProps {
  onClick?: () => void;
}

export const HeaderGamificationBadge: React.FC<HeaderGamificationBadgeProps> = ({ onClick }) => {
  const { state, openGamificationModal } = useGamification();
  const { level, currentXp, nextLevel, progressToNextLevel, streakDays, equippedTitle } = state;

  const handleClick = () => {
    if (onClick) onClick();
    else openGamificationModal('summary');
  };

  return (
    <>
      {/* Desktop & Tablet Badge */}
      <div 
        onClick={handleClick}
        className="hidden md:flex items-center space-x-2.5 bg-gradient-to-r from-[#FDFBF7] to-[#F5F2ED] dark:from-[#1E293B] dark:to-[#0F172A] hover:border-amber-500/60 dark:hover:border-amber-400/60 border border-[#D1CEC7] dark:border-[#334155] px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md hover:scale-[1.02] group shrink-0"
        title={`Nivel ${level.level}: ${level.title} (${currentXp} XP) — Clic para abrir el panel de logros`}
      >
        {/* Level Icon & Number */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xs shadow-xs font-bold ring-1 ring-amber-300 dark:ring-amber-500/50 group-hover:rotate-12 transition-transform">
            <span>{level.icon}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-[#434331] dark:text-[#F8FAFC] font-sans tracking-tight">
                Nv. {level.level}
              </span>
              <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] font-serif italic truncate max-w-[90px] lg:max-w-[125px]">
                {equippedTitle || level.title}
              </span>
            </div>
            {/* XP Progress gradient bar */}
            <div className="w-16 lg:w-22 h-1.5 bg-[#D1CEC7]/70 dark:bg-[#334155] rounded-full overflow-hidden mt-0.5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center space-x-1 pl-2 border-l border-[#D1CEC7]/80 dark:border-[#334155] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">{streakDays}d</span>
        </div>

        {/* Trophy Golden Icon */}
        <div className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform pl-0.5">
          <Trophy className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Mobile Compact Badge */}
      <button
        onClick={handleClick}
        className="md:hidden flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-amber-100/80 to-amber-50/80 dark:from-amber-950/40 dark:to-[#1E293B] border border-amber-300 dark:border-amber-500/40 rounded-full text-xs font-bold text-amber-900 dark:text-amber-300 shadow-2xs hover:scale-105 active:scale-95 transition-transform"
        title="Ver Logros y Nivel"
      >
        <span className="text-xs">{level.icon}</span>
        <span className="text-[10px] font-mono">Nv.{level.level}</span>
        <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      </button>
    </>
  );
};

