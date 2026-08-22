import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Layers, Eye, Plus, Sparkles, 
  Move, Shield, Share2, Users, FileText, Activity, HelpCircle,
  Trash2, X, BookMarked, Palette, GitBranch, GitCommit, AlertTriangle,
  Bot
} from 'lucide-react';
import { Person, RelationshipType } from '../../types';
import { useTree } from '../../context/TreeContext';
import { useAuth } from '../../context/AuthContext';
import { PersonCard } from './PersonCard';
import { ContextMenu, ContextMenuState } from './ContextMenu';
import { NodeInviteModal } from './NodeInviteModal';
import { LiveActivityTicker } from './LiveActivityTicker';

interface InteractiveTreeViewProps {
  onSelectPersonCard: (person: Person) => void;
  onOpenDetailModal: (person: Person) => void;
  onOpenNewPerson: () => void;
  onOpenEditPerson: (person: Person) => void;
  onOpenAddRelative: (person: Person, relType?: RelationshipType) => void;
  onOpenFullHistory?: () => void;
  onOpenBookModal?: () => void;
  onOpenSurnameStyles?: () => void;
  onOpenGitModal?: (tab?: 'history' | 'branches' | 'merge' | 'abandoned') => void;
  onOpenChatAssistant?: () => void;
}

interface TreeNodePosition {
  person: Person;
  x: number;
  y: number;
  generation: number;
  spouseIds: string[];
  parentIds: string[];
  childIds: string[];
}

export const InteractiveTreeView: React.FC<InteractiveTreeViewProps> = ({
  onSelectPersonCard,
  onOpenDetailModal,
  onOpenNewPerson,
  onOpenEditPerson,
  onOpenAddRelative,
  onOpenFullHistory,
  onOpenBookModal,
  onOpenSurnameStyles,
  onOpenGitModal,
  onOpenChatAssistant
}) => {
  const { 
    people, relationships, selectedPersonId, setSelectedPersonId, 
    canEdit, activeTree, deletePerson, movePersonPosition,
    createEmptyInitialTemplate, resetToDemoTree, logUserMovement,
    undo, redo, branches, activeBranchId, commits
  } = useTree();
  const { activeRole } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 70 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [generationFilter, setGenerationFilter] = useState<number | 'all'>('all');

  // Dragging node state for repositioning
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState<boolean>(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'canvas'
  });

  // Invite Modal state
  const [inviteModalData, setInviteModalData] = useState<{
    open: boolean;
    person: Person | null;
    relationType?: string;
  }>({
    open: false,
    person: null,
    relationType: 'relative'
  });

  // Highlighted / Selected Person data
  const selectedPerson = useMemo(() => {
    return people.find(p => p.id === selectedPersonId) || null;
  }, [people, selectedPersonId]);

  // Surnames found in the lineage
  const currentSurname = useMemo(() => {
    if (selectedPerson) {
      const surname = selectedPerson.lastName?.trim() || selectedPerson.maidenName?.trim();
      if (surname) return surname.toUpperCase();
    }
    // Fallback: Check active tree name or first person
    if (people.length > 0) {
      const p = people[0];
      return (p.lastName || 'CANTERO').toUpperCase();
    }
    return 'ÁRBOL FAMILIAR';
  }, [selectedPerson, people]);

  // Compute family linkages and generational layout coordinates
  const { nodePositions, generationRanks, links } = useMemo(() => {
    if (people.length === 0) {
      return { nodePositions: [], generationRanks: [], links: [] };
    }

    // 1. Map parents, children, spouses
    const parentsMap = new Map<string, string[]>();
    const childrenMap = new Map<string, string[]>();
    const spouseMap = new Map<string, string[]>();

    people.forEach(p => {
      parentsMap.set(p.id, []);
      childrenMap.set(p.id, []);
      spouseMap.set(p.id, []);
    });

    relationships.forEach(r => {
      if (r.type === 'parent') {
        if (parentsMap.has(r.person2Id)) parentsMap.get(r.person2Id)!.push(r.person1Id);
        if (childrenMap.has(r.person1Id)) childrenMap.get(r.person1Id)!.push(r.person2Id);
      } else if (r.type === 'spouse' || r.type === 'partner') {
        if (spouseMap.has(r.person1Id)) spouseMap.get(r.person1Id)!.push(r.person2Id);
        if (spouseMap.has(r.person2Id)) spouseMap.get(r.person2Id)!.push(r.person1Id);
      }
    });

    // 2. Assign generational rank
    const genMap = new Map<string, number>();
    const sortedPeople = [...people].sort((a, b) => {
      const yearA = parseInt(a.birthDate?.slice(0, 4) || '1950', 10);
      const yearB = parseInt(b.birthDate?.slice(0, 4) || '1950', 10);
      return yearA - yearB;
    });

    function getGeneration(pId: string, visited = new Set<string>()): number {
      if (genMap.has(pId)) return genMap.get(pId)!;
      if (visited.has(pId)) return 1;
      visited.add(pId);

      const pParents = parentsMap.get(pId) || [];
      if (pParents.length === 0) {
        const p = people.find(item => item.id === pId);
        const year = parseInt(p?.birthDate?.slice(0, 4) || '1950', 10);
        let baseGen = 1;
        if (year < 1870) baseGen = 1;
        else if (year < 1910) baseGen = 2;
        else if (year < 1945) baseGen = 3;
        else if (year < 1980) baseGen = 4;
        else baseGen = 5;
        genMap.set(pId, baseGen);
        return baseGen;
      }

      let maxParentGen = 0;
      pParents.forEach(pParentId => {
        maxParentGen = Math.max(maxParentGen, getGeneration(pParentId, new Set(visited)));
      });

      const gen = maxParentGen + 1;
      genMap.set(pId, gen);
      return gen;
    }

    sortedPeople.forEach(p => getGeneration(p.id));

    // Align spouses to same generation
    people.forEach(p => {
      const spouses = spouseMap.get(p.id) || [];
      const currentGen = genMap.get(p.id) || 1;
      spouses.forEach(sId => {
        const sGen = genMap.get(sId) || 1;
        const higherGen = Math.max(currentGen, sGen);
        genMap.set(p.id, higherGen);
        genMap.set(sId, higherGen);
      });
    });

    // 3. Group by Generation
    const genGroups = new Map<number, Person[]>();
    people.forEach(p => {
      const g = genMap.get(p.id) || 1;
      if (!genGroups.has(g)) genGroups.set(g, []);
      genGroups.get(g)!.push(p);
    });

    // 4. Calculate coordinates
    const positions: TreeNodePosition[] = [];
    const CARD_WIDTH = 272;
    const CARD_HEIGHT = 175;
    const HORIZONTAL_GAP = 75;
    const VERTICAL_GAP = 120;

    const sortedGens = Array.from(genGroups.keys()).sort((a, b) => a - b);

    sortedGens.forEach((gen, genIdx) => {
      const genPeople = genGroups.get(gen)!;
      const y = genIdx * (CARD_HEIGHT + VERTICAL_GAP) + 80;

      const placedInGen = new Set<string>();
      const orderedGenPeople: Person[] = [];

      genPeople.forEach(p => {
        if (placedInGen.has(p.id)) return;
        orderedGenPeople.push(p);
        placedInGen.add(p.id);

        const spouses = (spouseMap.get(p.id) || []).filter(sId => genPeople.some(gp => gp.id === sId));
        spouses.forEach(sId => {
          if (!placedInGen.has(sId)) {
            const spousePerson = genPeople.find(gp => gp.id === sId);
            if (spousePerson) {
              orderedGenPeople.push(spousePerson);
              placedInGen.add(sId);
            }
          }
        });
      });

      const startX = 80;

      orderedGenPeople.forEach((p, pIdx) => {
        // If person has custom dragged position, use it! Otherwise use auto-layout
        const x = p.position ? p.position.x : (startX + pIdx * (CARD_WIDTH + HORIZONTAL_GAP));
        const finalY = p.position ? p.position.y : y;

        positions.push({
          person: p,
          x,
          y: finalY,
          generation: gen,
          spouseIds: spouseMap.get(p.id) || [],
          parentIds: parentsMap.get(p.id) || [],
          childIds: childrenMap.get(p.id) || []
        });
      });
    });

    // 5. SVG connecting links
    const linksList: Array<{
      id: string;
      type: 'parent-child' | 'spouse';
      path: string;
      color: string;
    }> = [];

    // Spouse horizontal links (Terracotta tone)
    const drawnSpouses = new Set<string>();
    positions.forEach(pos => {
      pos.spouseIds.forEach(sId => {
        const pairKey = [pos.person.id, sId].sort().join('-');
        if (drawnSpouses.has(pairKey)) return;
        drawnSpouses.add(pairKey);

        const spousePos = positions.find(p => p.person.id === sId);
        if (spousePos) {
          const x1 = Math.min(pos.x, spousePos.x) + CARD_WIDTH;
          const x2 = Math.max(pos.x, spousePos.x);
          const y = pos.y + CARD_HEIGHT / 2;

          linksList.push({
            id: `spouse-${pairKey}`,
            type: 'spouse',
            path: `M ${x1} ${y} L ${x2} ${y}`,
            color: '#A65D47'
          });
        }
      });
    });

    // Parent-Child curved links (Olive tone)
    positions.forEach(childPos => {
      childPos.parentIds.forEach(parentId => {
        const parentPos = positions.find(p => p.person.id === parentId);
        if (parentPos) {
          const startX = parentPos.x + CARD_WIDTH / 2;
          const startY = parentPos.y + CARD_HEIGHT;
          const endX = childPos.x + CARD_WIDTH / 2;
          const endY = childPos.y;

          const midY = (startY + endY) / 2;
          const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

          linksList.push({
            id: `pc-${parentId}-${childPos.person.id}`,
            type: 'parent-child',
            path,
            color: '#5A5A40'
          });
        }
      });
    });

    return {
      nodePositions: positions,
      generationRanks: sortedGens,
      links: linksList
    };
  }, [people, relationships]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background, not on card or toolbar
    const target = e.target as HTMLElement;
    if (target.closest('.person-card-wrapper') || target.closest('.toolbar-container')) return;

    if (e.button === 0) { // Left click pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.07 : 0.07;
    setZoom(prev => Math.min(Math.max(prev + zoomDelta, 0.35), 2.2));
  };

  // Center on person
  const handleCenterPerson = (personId: string) => {
    const pos = nodePositions.find(p => p.person.id === personId);
    if (pos && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      setPan({
        x: containerWidth / 2 - (pos.x + 135) * zoom,
        y: containerHeight / 2 - (pos.y + 90) * zoom
      });
    }
  };

  const handleResetView = () => {
    setZoom(0.92);
    setPan({ x: 80, y: 70 });
  };

  // Right-Click Context Menu Handlers
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'canvas',
      person: null
    });
  };

  const handleNodeContextMenu = (e: React.MouseEvent, person: Person) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'node',
      person
    });
  };

  // Drag & Drop of Nodes (Card Repositioning)
  const handleDragStartNode = (e: React.DragEvent, person: Person) => {
    if (!canEdit) return;
    setDraggedNodeId(person.id);
    e.dataTransfer.setData('text/plain', person.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const personId = e.dataTransfer.getData('text/plain') || draggedNodeId;
    if (!personId || !canEdit || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left - pan.x) / zoom;
    const dropY = (e.clientY - rect.top - pan.y) / zoom;

    movePersonPosition(personId, {
      x: Math.max(20, Math.round(dropX - 135)),
      y: Math.max(20, Math.round(dropY - 80))
    });

    setDraggedNodeId(null);
  };

  const handleDropOnNode = (e: React.DragEvent, targetPerson: Person) => {
    e.preventDefault();
    const sourcePersonId = e.dataTransfer.getData('text/plain') || draggedNodeId;
    if (!sourcePersonId || sourcePersonId === targetPerson.id || !canEdit) return;

    const sourcePerson = people.find(p => p.id === sourcePersonId);
    if (!sourcePerson) return;

    // Open connection modal with prefilled persons
    onOpenAddRelative(targetPerson);
    setDraggedNodeId(null);
  };

  // Open invite modal for branch
  const handleOpenInviteForPerson = (person: Person, relType?: string) => {
    setInviteModalData({
      open: true,
      person,
      relationType: relType || 'relative'
    });
  };

  const generationNames: Record<number, string> = {
    1: '1ª Generación — Patriarcas & Pioneros',
    2: '2ª Generación — Abuelos & Primeros Colonos',
    3: '3ª Generación — Padres & Descendientes',
    4: '4ª Generación — Generación Actual',
    5: '5ª Generación — Nuevas Ramas'
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-8.5rem)] bg-[#F5F2ED] overflow-hidden select-none border-b border-[#D1CEC7]"
      onContextMenu={handleCanvasContextMenu}
    >
      {/* 
        ========================================================================
        CANVAS WATERMARK: Dynamic Family Surname Background (Prominent Archival Typography)
        "cuando le dé click a uno el fondo tiene que decir el apellido familiar"
        ========================================================================
      */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-0">
        <div className="text-center px-4 transform -translate-y-4">
          <p className="text-[11px] sm:text-xs font-sans font-semibold tracking-[0.25em] uppercase text-[#7C796F]/40 mb-1">
            {selectedPerson ? 'Rama Genealógica Seleccionada' : 'Linaje Genealógico Activo'}
          </p>
          
          <h1 className="font-serif font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none tracking-tight text-[#434331]/[0.055] transition-all duration-500 uppercase select-none">
            {currentSurname}
          </h1>

          {selectedPerson && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-xs font-serif italic text-[#7C796F]/50">
              <span>{selectedPerson.firstName} {selectedPerson.lastName}</span>
              <span>•</span>
              <span>{selectedPerson.birthPlace || 'Origen Familiar'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toolbar Controls */}
      <div className="toolbar-container absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-[#FDFBF7]/95 backdrop-blur-md p-2 rounded-2xl shadow-md border border-[#D1CEC7]">
        
        {/* Zoom controls */}
        <div className="flex items-center space-x-1 border-r border-[#E5E2D9] pr-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.2))}
            className="p-1.5 text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors cursor-pointer"
            title="Acercar (Zoom +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#7C796F] px-1 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.35))}
            className="p-1.5 text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors cursor-pointer"
            title="Alejar (Zoom -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors cursor-pointer"
            title="Reajustar Vista (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Git Undo / Redo in Tree Canvas */}
        {canEdit && (
          <div className="hidden sm:flex items-center space-x-1 bg-[#FDFBF7] p-1 rounded-full border border-[#D1CEC7] shadow-2xs">
            <button
              onClick={() => undo()}
              className="p-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors cursor-pointer"
              title="Deshacer movimiento (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => redo()}
              className="p-1.5 text-[#7C796F] hover:text-[#434331] hover:bg-[#F5F2ED] rounded-full transition-colors cursor-pointer"
              title="Rehacer movimiento (Ctrl+Shift+Z)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Git Branch Pill in Canvas */}
        {onOpenGitModal && (
          <button
            onClick={() => onOpenGitModal('branches')}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-[#FDFBF7] hover:bg-[#E5E2D9] text-[#434331] text-xs font-serif rounded-full border border-[#D1CEC7] transition-colors cursor-pointer shadow-2xs"
            title="Ver ramas y puntos de restauración Git"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span className="font-semibold">{branches.find(b => b.id === activeBranchId)?.name || 'main'}</span>
          </button>
        )}

        {/* Focus selected */}
        {selectedPersonId && (
          <button
            onClick={() => handleCenterPerson(selectedPersonId)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-sans font-semibold text-[#434331] bg-[#E5E2D9] hover:bg-[#D1CEC7] rounded-full transition-colors border border-[#D1CEC7] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Centrar Ficha</span>
          </button>
        )}

        {/* Generation Filter dropdown */}
        <div className="flex items-center space-x-1.5 pl-1">
          <Layers className="w-3.5 h-3.5 text-[#7C796F]" />
          <select
            value={generationFilter}
            onChange={(e) => setGenerationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-[#F5F2ED] border border-[#D1CEC7] rounded-full px-3 py-1.5 text-[#434331] font-sans focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Generaciones ({people.length})</option>
            {generationRanks.map(g => (
              <option key={g} value={g}>
                Generación {g}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add Person */}
        {canEdit && (
          <button
            onClick={onOpenNewPerson}
            className="flex items-center space-x-1 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-sans font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        )}

        {/* NLP Chat Assistant */}
        {canEdit && onOpenChatAssistant && (
          <button
            onClick={onOpenChatAssistant}
            className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-sans font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-300 transition-colors shadow-2xs cursor-pointer"
            title="Asistente Chat NLP: Escribe 'A es hijo de B' para crear y conectar tarjetas rápidamente"
          >
            <Bot className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Asistente Chat</span>
          </button>
        )}

        {/* Libro Decorado Export */}
        {onOpenBookModal && (
          <button
            onClick={onOpenBookModal}
            className="hidden sm:flex items-center space-x-1 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#5A5A40] text-xs font-sans font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#D1CEC7] transition-colors cursor-pointer shadow-2xs"
            title="Exportar Libro Genealógico Decorado (PDF, Excel, JSON)"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Libro Decorado</span>
          </button>
        )}

        {/* Estilos por Apellido */}
        {onOpenSurnameStyles && canEdit && (
          <button
            onClick={onOpenSurnameStyles}
            className="hidden md:flex items-center space-x-1 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#7C796F] hover:text-[#434331] text-xs font-sans font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#D1CEC7] transition-colors cursor-pointer"
            title="Personalizar Fondos por Apellido"
          >
            <Palette className="w-3.5 h-3.5 text-[#A65D47]" />
            <span>Fondos Apellido</span>
          </button>
        )}

        {/* Empty template quick button */}
        {canEdit && (
          <button
            onClick={async () => {
              if (confirm('¿Iniciar plantilla vacía con una tarjeta inicial limpia para comenzar un linaje desde cero?')) {
                await createEmptyInitialTemplate();
              }
            }}
            className="hidden 2xl:flex items-center space-x-1 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#7C796F] hover:text-[#434331] text-xs font-sans font-medium px-3 py-1.5 rounded-full border border-[#D1CEC7] transition-colors cursor-pointer"
            title="Empezar plantilla vacía con tarjeta inicial y botones (+)"
          >
            <Sparkles className="w-3 h-3 text-[#A65D47]" />
            <span>Plantilla Vacía</span>
          </button>
        )}
      </div>

      {/* Top-Right Invited / Permissions Status Banner */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        {canEdit ? (
          <div className="bg-[#FDFBF7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D1CEC7] text-xs flex items-center space-x-2 text-[#434331] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-semibold">{activeRole === 'owner' ? 'Propietario' : 'Invitado con Permiso de Edición'}</span>
            <span className="text-[10px] text-[#7C796F] border-l border-[#E5E2D9] pl-2 hidden sm:inline">
              Clic derecho en tarjetas para editar
            </span>
          </div>
        ) : (
          <div className="bg-amber-50/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-300 text-xs flex items-center space-x-2 text-amber-900 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-semibold">Modo Solo Lectura</span>
            <span className="text-[10px] text-amber-700 border-l border-amber-200 pl-2 hidden sm:inline">
              Solo los familiares invitados pueden editar
            </span>
          </div>
        )}
      </div>

      {/* Mini Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center space-x-4 bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-2 rounded-full text-xs border border-[#D1CEC7] text-[#7C796F] font-sans shadow-sm">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-0.5 bg-[#A65D47] inline-block"></span>
          <span>Matrimonio / Pareja</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-0.5 bg-[#5A5A40] inline-block"></span>
          <span>Linaje Familiar</span>
        </div>
        <div className="flex items-center space-x-1.5 border-l border-[#E5E2D9] pl-3">
          <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
          <span>{people.length} Integrantes</span>
        </div>
      </div>

      {/* Live Public Movement Ticker */}
      <LiveActivityTicker onOpenFullHistory={onOpenFullHistory} />

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnCanvas}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${isPanning ? 'cursor-grabbing' : ''}`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.08s ease-out'
          }}
          className="relative min-w-[4000px] min-h-[3000px]"
        >
          {/* Generational Row Guides */}
          {generationRanks.map((gen, idx) => {
            const y = idx * (175 + 120) + 80;
            if (generationFilter !== 'all' && generationFilter !== gen) return null;

            return (
              <div key={gen} className="absolute left-0 right-0 pointer-events-none" style={{ top: `${y - 34}px` }}>
                <div className="flex items-center space-x-3 px-8">
                  <span className="text-xs font-serif italic text-[#434331] bg-[#FDFBF7]/90 px-3.5 py-1 rounded-full border border-[#D1CEC7] shadow-2xs">
                    {generationNames[gen] || `Generación ${gen}`}
                  </span>
                  <div className="flex-1 h-px bg-[#D1CEC7]/60 border-t border-dashed border-[#D1CEC7]"></div>
                </div>
              </div>
            );
          })}

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {links.map((link) => (
              <path
                key={link.id}
                d={link.path}
                fill="none"
                stroke={link.color}
                strokeWidth={link.type === 'spouse' ? '2.5' : '2'}
                strokeDasharray={link.type === 'spouse' ? '6 4' : 'none'}
                strokeLinecap="round"
                className="transition-all duration-300 opacity-80"
              />
            ))}
          </svg>

          {/* Person Node Cards */}
          {nodePositions.map((pos) => {
            if (generationFilter !== 'all' && generationFilter !== pos.generation) return null;

            return (
              <div
                key={pos.person.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
                className="z-10 person-card-wrapper"
              >
                <PersonCard
                  person={pos.person}
                  isSelected={selectedPersonId === pos.person.id}
                  onSelect={(p) => {
                    // Single click selects the node and sets the surname watermark, DOES NOT open full modal
                    setSelectedPersonId(p.id);
                    onSelectPersonCard(p);
                  }}
                  onOpenDetailModal={(p) => {
                    // Explicit detail modal open
                    onOpenDetailModal(p);
                  }}
                  onOpenAddRelative={(p, relType) => {
                    onOpenAddRelative(p, relType);
                  }}
                  onOpenInviteModal={(p, relType) => {
                    handleOpenInviteForPerson(p, relType);
                  }}
                  onContextMenu={(e, p) => {
                    handleNodeContextMenu(e, p);
                  }}
                  onDragStartNode={handleDragStartNode}
                  onDropOnNode={handleDropOnNode}
                />
              </div>
            );
          })}

          {/* Empty Template Placeholder Message if no people */}
          {people.length === 0 && (
            <div className="absolute top-1/3 left-1/3 p-8 bg-[#FDFBF7] border border-[#D1CEC7] rounded-3xl shadow-xl max-w-md text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[#5A5A40] mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#434331]">
                Plantilla Genealógica Vacía
              </h3>
              <p className="text-xs text-[#7C796F]">
                Comienza creando tu tarjeta inicial o carga los datos de demostración para explorar.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => createEmptyInitialTemplate()}
                  className="px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-semibold hover:bg-[#434331] shadow-xs"
                >
                  Crear Tarjeta Inicial
                </button>
                <button
                  onClick={() => resetToDemoTree()}
                  className="px-4 py-2 bg-[#F5F2ED] text-[#434331] border border-[#D1CEC7] rounded-xl text-xs font-semibold hover:bg-[#E5E2D9]"
                >
                  Cargar Familia Demo Cantero
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Person Quick Toolbar */}
      {selectedPersonId && (
        (() => {
          const selectedPerson = people.find(p => p.id === selectedPersonId);
          if (!selectedPerson) return null;
          return (
            <div className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#434331] text-[#FDFBF7] px-4 py-2 rounded-2xl shadow-xl border border-[#5A5A40] flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-serif font-bold">{selectedPerson.firstName} {selectedPerson.lastName}</span>
              </div>

              <div className="h-4 w-px bg-white/20"></div>

              <button
                onClick={() => onOpenDetailModal(selectedPerson)}
                className="hover:text-white underline font-sans cursor-pointer text-white/90"
              >
                Ver Ficha
              </button>

              <button
                onClick={() => onOpenEditPerson(selectedPerson)}
                className="hover:text-white font-sans cursor-pointer text-white/90"
              >
                Editar
              </button>

              {canEdit && (
                <>
                  <div className="h-4 w-px bg-white/20"></div>
                  <button
                    onClick={async () => {
                      if (confirm(`¿Eliminar a "${selectedPerson.firstName} ${selectedPerson.lastName}" del árbol? (Tecla Suprimir)`)) {
                        await deletePerson(selectedPerson.id);
                        setSelectedPersonId(null);
                      }
                    }}
                    className="text-rose-300 hover:text-rose-100 flex items-center space-x-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    title="Eliminar con la tecla Suprimir o este botón"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar (Supr)</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedPersonId(null)}
                className="text-white/60 hover:text-white ml-1 p-0.5 rounded hover:bg-white/10 cursor-pointer"
                title="Deseleccionar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()
      )}

      {/* Right-Click Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        canEdit={canEdit}
        onEditPerson={(p) => onOpenEditPerson(p)}
        onViewDetails={(p) => onOpenDetailModal(p)}
        onAddRelative={(p, relType) => onOpenAddRelative(p, relType)}
        onCopyInviteLink={(p, rel) => handleOpenInviteForPerson(p, rel)}
        onCenterPerson={handleCenterPerson}
        onDeletePerson={(pId) => deletePerson(pId)}
        onAddNewRootPerson={onOpenNewPerson}
        onResetView={handleResetView}
        onCreateEmptyTemplate={createEmptyInitialTemplate}
        onResetToDemoTree={resetToDemoTree}
      />

      {/* Direct Node Invite Modal */}
      {inviteModalData.open && inviteModalData.person && (
        <NodeInviteModal
          person={inviteModalData.person}
          relationType={inviteModalData.relationType}
          onClose={() => setInviteModalData({ open: false, person: null })}
        />
      )}
    </div>
  );
};
