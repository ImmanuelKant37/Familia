/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TreeProvider, useTree } from './context/TreeContext';
import { Header } from './components/common/Header';
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
import { Person } from './types';
import { Shield, Sparkles, UserPlus, Info, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    people, selectedPersonId, setSelectedPersonId, 
    addPerson, updatePerson, deletePerson, canEdit 
  } = useTree();
  const { currentUser, isPublicMode, signInWithGoogle } = useAuth();

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
  const [settingsModalState, setSettingsModalState] = useState<{ open: boolean; tab?: 'settings' | 'create' | 'list' }>({
    open: false,
    tab: 'settings'
  });
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global Keyboard Shortcuts (⌘K for Search, Suprimir / Delete for removing selected person)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
        return;
      }

      // Suprimir / Delete / Backspace to delete selected person
      if (
        (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Del') && 
        selectedPersonId && 
        canEdit
      ) {
        // Prevent deleting if user is typing in an input, textarea or contenteditable element
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
           target.tagName === 'TEXTAREA' ||
           target.tagName === 'SELECT' ||
           target.isContentEditable ||
           target.closest('input') ||
           target.closest('textarea') ||
           target.closest('select'))
        ) {
          return;
        }

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
          settingsModalState.open ||
          showSearchModal
        ) {
          return;
        }

        const personToDelete = people.find(p => p.id === selectedPersonId);
        if (personToDelete) {
          e.preventDefault();
          const confirmed = window.confirm(
            `¿Deseas eliminar a "${personToDelete.firstName} ${personToDelete.lastName}" del árbol familiar (Tecla Suprimir)?`
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
    detailModalPerson,
    personFormModal.open,
    relativeModalPerson,
    showCollabModal,
    showDuplicatesModal,
    showGedcomModal,
    showBookModal,
    showSurnameModal,
    settingsModalState.open,
    showSearchModal
  ]);

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
    <div className="min-h-screen bg-[#F5F2ED] text-[#2C2C2C] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-white">
      
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
      />

      {/* Public Visitor Banner (if unauthenticated or in public mode) */}
      {(isPublicMode || !currentUser) && (
        <div className="bg-[#5A5A40] text-[#F5F2ED] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#434331]">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#E5E2D9] shrink-0" />
            <span>
              <strong className="font-semibold">Vista Pública Protegida:</strong> Los datos privados de personas vivas se encuentran protegidos y anonimizados.
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCollabModal(true)}
              className="text-[#E5E2D9] underline hover:text-white font-medium cursor-pointer"
            >
              Solicitar Acceso como Familiar
            </button>
            <button
              onClick={signInWithGoogle}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-xs font-sans font-semibold transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TreeProvider>
        <MainAppContent />
      </TreeProvider>
    </AuthProvider>
  );
}
