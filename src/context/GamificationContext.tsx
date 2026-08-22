/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTree } from './TreeContext';
import { useAuth } from './AuthContext';
import { GamificationEngine } from '../services/gamificationEngine';
import { GamificationState, Achievement, ResearcherLevel } from '../types/gamification';

interface GamificationContextType {
  state: GamificationState;
  equippedTitle: string;
  equipTitle: (title: string) => void;
  activeToast: Achievement | null;
  dismissToast: () => void;
  openGamificationModal: (tab?: 'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate') => void;
  modalState: {
    isOpen: boolean;
    initialTab: 'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate';
  };
  closeGamificationModal: () => void;
  triggerSound: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'genealogy_gamification_v2_';

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTree, people, relationships, events, media, sources } = useTree();
  const { currentUser } = useAuth();

  const treeId = activeTree?.id || 'default_tree';
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${treeId}`;

  // Persisted state from local storage or defaults
  const [unlockedMap, setUnlockedMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.unlockedAchievements || {};
      }
    } catch (e) {
      // ignore
    }
    return {};
  });

  const [equippedTitle, setEquippedTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.equippedTitle || 'Curioso';
      }
    } catch (e) {
      // ignore
    }
    return 'Curioso';
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.streakDays || 1;
      }
    } catch (e) {
      // ignore
    }
    return 1;
  });

  // Modal open state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialTab: 'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate';
  }>({
    isOpen: false,
    initialTab: 'summary'
  });

  // Toast Queue for unlocks
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  // Compute live gamification state
  const state: GamificationState = useMemo(() => {
    return GamificationEngine.evaluateGamificationState(
      activeTree,
      people,
      relationships,
      events,
      media,
      sources,
      activeTree?.members || [],
      unlockedMap,
      streakDays,
      equippedTitle
    );
  }, [activeTree, people, relationships, events, media, sources, unlockedMap, streakDays, equippedTitle]);

  // Sync unlocked map if new achievements were unlocked
  useEffect(() => {
    if (state.recentUnlocks.length > 0) {
      setUnlockedMap(state.unlockedAchievements);
      // Play sound and add to toast queue
      GamificationEngine.playAchievementSound();
      setToastQueue(prev => [...prev, ...state.recentUnlocks]);
    }
  }, [state.recentUnlocks, state.unlockedAchievements]);

  // Process toast queue one by one
  useEffect(() => {
    if (!activeToast && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setActiveToast(nextToast);
      setToastQueue(prev => prev.slice(1));
    }
  }, [activeToast, toastQueue]);

  // Auto dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Persist state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        unlockedAchievements: state.unlockedAchievements,
        equippedTitle,
        streakDays,
        lastActiveDate: new Date().toISOString()
      }));
    } catch (e) {
      // ignore
    }
  }, [storageKey, state.unlockedAchievements, equippedTitle, streakDays]);

  const equipTitle = useCallback((title: string) => {
    setEquippedTitle(title);
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const openGamificationModal = useCallback((tab: 'summary' | 'achievements' | 'missions' | 'collections' | 'branches' | 'certificate' = 'summary') => {
    setModalState({
      isOpen: true,
      initialTab: tab
    });
  }, []);

  const closeGamificationModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const triggerSound = useCallback(() => {
    GamificationEngine.playAchievementSound();
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        state,
        equippedTitle,
        equipTitle,
        activeToast,
        dismissToast,
        openGamificationModal,
        modalState,
        closeGamificationModal,
        triggerSound
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
