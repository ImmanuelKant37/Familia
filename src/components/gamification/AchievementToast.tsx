/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Trophy, Sparkles, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AchievementToast: React.FC = () => {
  const { activeToast, dismissToast, openGamificationModal, triggerSound } = useGamification();

  if (!activeToast) return null;

  const rarityColors: Record<string, string> = {
    common: 'border-[#A39E93] bg-[#FAF8F5]',
    uncommon: 'border-[#5A5A40] bg-[#F4F3ED]',
    rare: 'border-[#3B5878] bg-[#F0F4F8]',
    epic: 'border-[#6B3860] bg-[#F7F0F5]',
    legendary: 'border-[#B57C1E] bg-[#FCF8EC]',
    unique: 'border-[#9E2A2B] bg-[#FDF0F0]'
  };

  const rarityLabels: Record<string, string> = {
    common: 'Común',
    uncommon: 'Poco Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
    unique: 'Único'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-18 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md w-full pointer-events-auto"
      >
        <div 
          className={`relative rounded-xl border-2 shadow-xl p-4 overflow-hidden backdrop-blur-md ${
            rarityColors[activeToast.rarity] || 'border-[#5A5A40] bg-[#FDFBF7]'
          }`}
        >
          {/* Subtle Decorative Golden Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B57C1E] via-[#E8C547] to-[#B57C1E]" />

          <div className="flex items-start space-x-3.5">
            {/* Trophy / Icon container */}
            <div className="w-12 h-12 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-md relative group">
              <Trophy className="w-6 h-6 text-[#E8C547] animate-bounce" />
              <Sparkles className="w-3.5 h-3.5 text-white absolute -top-1 -right-1" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B57C1E]">
                  ¡Logro Desbloqueado!
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5E2D9] text-[#5A5A40] font-medium">
                  {rarityLabels[activeToast.rarity]}
                </span>
              </div>

              <h4 className="font-serif font-bold text-sm text-[#2C2C2C] mt-0.5 truncate">
                {activeToast.title}
              </h4>

              <p className="text-xs text-[#55524A] font-sans mt-0.5 line-clamp-2">
                {activeToast.description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#D1CEC7]/50 text-xs">
                <span className="font-bold text-[#3F6B38] font-mono">
                  +{activeToast.xpReward} XP
                </span>
                <button
                  onClick={() => {
                    dismissToast();
                    openGamificationModal('achievements');
                  }}
                  className="text-[11px] text-[#5A5A40] hover:text-[#2C2C2C] font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Ver en el Álbum
                </button>
              </div>
            </div>

            {/* Actions: Sound & Dismiss */}
            <div className="flex flex-col space-y-1 items-center">
              <button
                onClick={dismissToast}
                className="text-[#9A968A] hover:text-[#2C2C2C] p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={triggerSound}
                className="text-[#9A968A] hover:text-[#5A5A40] p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                title="Reproducir campana"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
