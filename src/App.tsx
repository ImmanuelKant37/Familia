/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TreeProvider, useTree } from './context/TreeContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { AuthScreen } from './components/auth/AuthScreen';
import { InteractiveTreeView } from './components/tree/InteractiveTreeView';
import { TimelineView } from './components/timeline/TimelineView';
import { MigrationMapView } from './components/map/MigrationMapView';
import { MediaGalleryView } from './components/media/MediaGalleryView';
import { SourcesListView } from './components/sources/SourcesListView';
import { ChangeHistoryView } from './components/audit/ChangeHistoryView';
import { PersonDetailModal } from './components/person/PersonDetailModal';
import { PersonFormModal } from './components/person/PersonFormModal';
import { RelationshipModal } from './components/relationship/RelationshipModal';
import { CollaborationModal } from './components/collaboration/CollaborationModal';
import { DuplicatesModal } from './components/duplicates/DuplicatesModal';
import { GedcomModal } from './components/gedcom/GedcomModal';
import { TreeSettingsModal } from './components/tree/TreeSettingsModal';
import { SearchModal } from './components/search/SearchModal';
import { GenealogyBookModal } from './components/export/GenealogyBookModal';
import { SurnameStylerModal } from './components/tree/SurnameStylerModal';
import { GitVersionModal } from './components/git/GitVersionModal';
import { GamificationDashboardModal } from './components/gamification/GamificationDashboardModal';
import { AchievementToast } from './components/gamification/AchievementToast';
import { FamilyLobbyProvider, useFamilyLobby } from './context/FamilyLobbyContext';
import { FamilyLobbyModal } from './components/lobby/FamilyLobbyModal';
import { FamilyPublicProfileModal } from './components/lobby/FamilyPublicProfileModal';
import { RequestAccessModal } from './components/lobby/RequestAccessModal';
import { FamilyPermissionsManagerModal } from './components/lobby/FamilyPermissionsManagerModal';
import { MyAccessesModal } from './components/lobby/MyAccessesModal';
import { ConnectFamiliesModal } from './components/lobby/ConnectFamiliesModal';
import { SupabaseSqlModal } from './components/supabase/SupabaseSqlModal';
import { GenealogyChatAssistantModal } from './components/tree/GenealogyChatAssistantModal';
import { Person } from './types';
import { TreePine, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    people, selectedPersonId, setSelectedPersonId, 
    addPerson, updatePerson, deletePerson, canEdit,
    undo, redo
  } = useTree();
  const { currentUser, loading } = useAuth();
  const { openGamificationModal } = useGamification();
  const { 
    isLobbyOpen, 
    isPublicProfileOpen, 
    isRequestAccessModalOpen, 
    isPermissionsManagerOpen, 
    isMyAccessesModalOpen, 
    isConnectFamiliesModalOpen 
  } = useFamilyLobby();

  // Navigation View State
  const [activeTab, setActiveTab] = useState<'tree' | 'timeline' | 'map' | 'media' | 'sources' | 'audit'>('tree');

  // Modal States
  const [detailModalPerson, setDetailModalPerson] = useState<Person | null>(null);
  const [personFormModal, setPersonFormModal] = useState<{ open: boolean; person: Person | null }>({
    open: false,
    person: null
  });
  const [relativeModalPerson, setRelativeModalPerson] = useState<{ person: Person; relType?: any } | null>(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showGedcomModal, setShowGedcomModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSurnameModal, setShowSurnameModal] = useState(false);
  const [gitModalState, setGitModalState] = useState<{ open: boolean; tab?: 'history' | 'branches' | 'merge' | 'abandoned' }>({
    open: false,
    tab: 'history'
  });
  const [settingsModalState, setSettingsModalState] = useState<{ open: boolean; tab?: 'settings' | 'create' | 'list' }>({
    open: false,
    tab: 'settings'
  });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSupabaseSqlModal, setShowSupabaseSqlModal] = useState(false);
  const [showChatAssistantModal, setShowChatAssistantModal] = useState(false);

  // Global Keyboard Shortcuts (⌘K Search, Delete, ⌘Z Undo, ⌘⇧Z / ⌘Y Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select')
      );

      // ⌘K / Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
        return;
      }

      // ⌘Z / Ctrl+Z for Git Undo (when not inside typing input)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !isInput && canEdit) {
        e.preventDefault();
        undo();
        return;
      }

      // ⌘⇧Z / Ctrl+Shift+Z or ⌘Y / Ctrl+Y for Git Redo
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z' && !isInput && canEdit) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y' && !isInput && canEdit)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Suprimir / Delete / Backspace to delete selected person
      if (
        (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Del') && 
        selectedPersonId && 
        canEdit &&
        !isInput
      ) {
        // Prevent if any modal is currently visible
        if (
          detailModalPerson ||
          personFormModal.open ||
          relativeModalPerson ||
          showCollabModal ||
          showDuplicatesModal ||
          showGedcomModal ||
          showBookModal ||
          showSurnameModal ||
          gitModalState.open ||
          settingsModalState.open ||
          showSearchModal
        ) {
          return;
        }

        const personToDelete = people.find(p => p.id === selectedPersonId);
        if (personToDelete) {
          e.preventDefault();
          const confirmed = window.confirm(
            `¿Deseas eliminar a "${personToDelete.firstName} ${personToDelete.lastName}" del árbol familiar?`
          );
          if (confirmed) {
            deletePerson(personToDelete.id);
            setSelectedPersonId(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedPersonId, 
    canEdit, 
    people, 
    deletePerson, 
    setSelectedPersonId,
    undo,
    redo,
    detailModalPerson,
    personFormModal.open,
    relativeModalPerson,
    showCollabModal,
    showDuplicatesModal,
    showGedcomModal,
    showBookModal,
    showSurnameModal,
    gitModalState.open,
    settingsModalState.open,
    showSearchModal
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-md animate-pulse">
          <TreePine className="w-7 h-7" />
        </div>
        <div className="flex items-center space-x-2 text-sm text-[#5A5A40] font-medium font-sans">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Cargando árbol familiar...</span>
        </div>
      </div>
    );
  }

  // Pure Firebase Authentication Gate
  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleSelectPersonCard = (person: Person) => {
    setSelectedPersonId(person.id);
  };

  const handleOpenDetailModal = (person: Person) => {
    setSelectedPersonId(person.id);
    setDetailModalPerson(person);
  };

  const handleOpenAddPerson = () => {
    setPersonFormModal({ open: true, person: null });
  };

  const handleOpenEditPerson = (person: Person) => {
    setPersonFormModal({ open: true, person });
  };

  const handleSavePerson = async (personData: Partial<Person>) => {
    if (personFormModal.person) {
      await updatePerson({ ...personFormModal.person, ...personData } as Person);
    } else {
      await addPerson(personData as any);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] dark:bg-[#0B0F17] text-[#2C2C2C] dark:text-[#F1F5F9] flex flex-col font-sans selection:bg-[#5A5A40] dark:selection:bg-[#38BDF8] selection:text-white transition-colors duration-200">
      
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewPerson={handleOpenAddPerson}
        onOpenCollab={() => setShowCollabModal(true)}
        onOpenDuplicates={() => setShowDuplicatesModal(true)}
        onOpenGedcom={() => setShowGedcomModal(true)}
        onOpenSettings={(tab) => setSettingsModalState({ open: true, tab: tab || 'settings' })}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenBookModal={() => setShowBookModal(true)}
        onOpenSurnameStyles={() => setShowSurnameModal(true)}
        onOpenGitModal={(tab) => setGitModalState({ open: true, tab: tab || 'history' })}
        onOpenGamification={(tab) => openGamificationModal(tab)}
        onOpenSupabaseSql={() => setShowSupabaseSqlModal(true)}
        onOpenChatAssistant={() => setShowChatAssistantModal(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {activeTab === 'tree' && (
          <InteractiveTreeView
            onSelectPersonCard={handleSelectPersonCard}
            onOpenDetailModal={handleOpenDetailModal}
            onOpenNewPerson={handleOpenAddPerson}
            onOpenEditPerson={handleOpenEditPerson}
            onOpenAddRelative={(p, relType) => setRelativeModalPerson({ person: p, relType })}
            onOpenFullHistory={() => setActiveTab('audit')}
            onOpenBookModal={() => setShowBookModal(true)}
            onOpenSurnameStyles={() => setShowSurnameModal(true)}
            onOpenGitModal={(tab) => setGitModalState({ open: true, tab: tab || 'history' })}
            onOpenChatAssistant={() => setShowChatAssistantModal(true)}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            onSelectPersonById={(id) => {
              const p = people.find(item => item.id === id);
              if (p) handleOpenDetailModal(p);
            }}
          />
        )}

        {activeTab === 'map' && (
          <MigrationMapView
            onSelectPersonById={(id) => {
              const p = people.find(item => item.id === id);
              if (p) handleOpenDetailModal(p);
            }}
          />
        )}

        {activeTab === 'media' && (
          <MediaGalleryView
            onSelectPersonById={(id) => {
              const p = people.find(item => item.id === id);
              if (p) handleOpenDetailModal(p);
            }}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesListView
            onSelectPersonById={(id) => {
              const p = people.find(item => item.id === id);
              if (p) handleOpenDetailModal(p);
            }}
          />
        )}

        {activeTab === 'audit' && (
          <ChangeHistoryView
            onSelectPersonById={(id) => {
              const p = people.find(item => item.id === id);
              if (p) handleOpenDetailModal(p);
            }}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Person Detail Modal */}
      {detailModalPerson && (
        <PersonDetailModal
          person={detailModalPerson}
          onClose={() => setDetailModalPerson(null)}
          onEdit={handleOpenEditPerson}
          onOpenAddRelative={(p) => setRelativeModalPerson({ person: p })}
          onSelectRelative={handleOpenDetailModal}
        />
      )}

      {/* 2. Person Form Modal (Create / Edit) */}
      {personFormModal.open && (
        <PersonFormModal
          person={personFormModal.person}
          onClose={() => setPersonFormModal({ open: false, person: null })}
          onSave={handleSavePerson}
          onDelete={canEdit ? deletePerson : undefined}
        />
      )}

      {/* 3. Add Relative Modal */}
      {relativeModalPerson && (
        <RelationshipModal
          person={relativeModalPerson.person}
          initialRelType={relativeModalPerson.relType}
          onClose={() => setRelativeModalPerson(null)}
        />
      )}

      {/* 4. Collaboration & Permissions Modal */}
      {showCollabModal && (
        <CollaborationModal
          onClose={() => setShowCollabModal(false)}
        />
      )}

      {/* 5. Duplicate Scanner & Merge Modal */}
      {showDuplicatesModal && (
        <DuplicatesModal
          onClose={() => setShowDuplicatesModal(false)}
        />
      )}

      {/* 6. GEDCOM & Backup Modal */}
      {showGedcomModal && (
        <GedcomModal
          onClose={() => setShowGedcomModal(false)}
          onOpenBookModal={() => {
            setShowGedcomModal(false);
            setShowBookModal(true);
          }}
        />
      )}

      {/* 7. Tree Settings & Privacy Modal */}
      {settingsModalState.open && (
        <TreeSettingsModal
          initialTab={settingsModalState.tab}
          onClose={() => setSettingsModalState({ open: false, tab: 'settings' })}
        />
      )}

      {/* 8. Global Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectPerson={handleOpenDetailModal}
        />
      )}

      {/* 9. Genealogy Book Decorated Export Modal (PDF, Excel, JSON) */}
      {showBookModal && (
        <GenealogyBookModal
          onClose={() => setShowBookModal(false)}
        />
      )}

      {/* 10. Surname Custom Styling & Palettes Modal */}
      {showSurnameModal && (
        <SurnameStylerModal
          onClose={() => setShowSurnameModal(false)}
        />
      )}

      {/* 11. Git Version Control & Branches Modal */}
      {gitModalState.open && (
        <GitVersionModal
          initialTab={gitModalState.tab}
          onClose={() => setGitModalState({ open: false, tab: 'history' })}
        />
      )}

      {/* 12. Gamification & Lineage Achievements Modal */}
      <GamificationDashboardModal />

      {/* 13. Gamification Real-time Toast Notifications */}
      <AchievementToast />

      {/* 14. Family Lobby & Discovery Modal */}
      {isLobbyOpen && <FamilyLobbyModal />}

      {/* 15. Family Public Profile Detailed Sheet */}
      {isPublicProfileOpen && <FamilyPublicProfileModal />}

      {/* 16. Granular Request Access Modal */}
      {isRequestAccessModalOpen && <RequestAccessModal />}

      {/* 17. Owner Permissions & Collaboration Manager Modal */}
      {isPermissionsManagerOpen && <FamilyPermissionsManagerModal />}

      {/* 18. User Access Dashboard ("Mis Accesos") */}
      {isMyAccessesModalOpen && <MyAccessesModal />}

      {/* 19. Connect Families Proposal Modal */}
      {isConnectFamiliesModalOpen && <ConnectFamiliesModal />}

      {/* 20. Supabase Storage & SQL Setup Modal */}
      {showSupabaseSqlModal && (
        <SupabaseSqlModal onClose={() => setShowSupabaseSqlModal(false)} />
      )}

      {/* 21. NLP Genealogy Chat Assistant Modal */}
      {showChatAssistantModal && (
        <GenealogyChatAssistantModal
          onClose={() => setShowChatAssistantModal(false)}
          onSelectPerson={(personId) => {
            const p = people.find(item => item.id === personId);
            if (p) handleOpenDetailModal(p);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TreeProvider>
          <GamificationProvider>
            <FamilyLobbyProvider>
              <MainAppContent />
            </FamilyLobbyProvider>
          </GamificationProvider>
        </TreeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
