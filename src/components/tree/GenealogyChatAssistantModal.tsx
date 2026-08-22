import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, Send, Sparkles, BookOpen, X, CheckCircle2, 
  ArrowRight, Users, Network, HelpCircle, CornerDownLeft, 
  Trash2, ExternalLink, Lightbulb, ChevronDown, ChevronUp,
  AtSign, Search, Plus, UserCheck, Heart, GitFork, User
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { Person, Relationship } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionsPerformed?: {
    createdPeople: { id: string; name: string }[];
    existingPeople: { id: string; name: string }[];
    createdRelationships: { id: string; description: string }[];
    bridgeNodes: { id: string; name: string }[];
    errors: string[];
  };
}

interface GenealogyChatAssistantModalProps {
  onClose: () => void;
  onSelectPerson?: (personId: string) => void;
}

export const GenealogyChatAssistantModal: React.FC<GenealogyChatAssistantModalProps> = ({
  onClose,
  onSelectPerson
}) => {
  const { 
    activeTree, 
    people, 
    relationships, 
    addPerson, 
    addRelationship,
    setSelectedPersonId,
    canEdit 
  } = useTree();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [selectedPersonForActions, setSelectedPersonForActions] = useState<Person | null>(null);

  // Mention (@) autocomplete state
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [highlightedMentionIdx, setHighlightedMentionIdx] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to format person's name with comma for last name (or as single name)
  const formatPersonCitation = (p: Person): string => {
    const fn = (p.firstName || '').trim();
    const ln = (p.lastName || '').trim();
    if (ln) {
      return `${fn}, ${ln}`;
    }
    return fn;
  };

  // Filtered members for mention autocomplete
  const mentionFilteredPeople = useMemo(() => {
    if (!mentionActive) return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return people.slice(0, 10);
    return people.filter(p => {
      const full = `${p.firstName} ${p.lastName || ''}`.toLowerCase();
      const fn = p.firstName.toLowerCase();
      const ln = (p.lastName || '').toLowerCase();
      return full.includes(q) || fn.includes(q) || ln.includes(q);
    }).slice(0, 10);
  }, [people, mentionActive, mentionQuery]);

  // Filtered members for the toolbar shortcuts
  const toolbarFilteredPeople = useMemo(() => {
    if (!memberSearchQuery.trim()) return people;
    const q = memberSearchQuery.toLowerCase().trim();
    return people.filter(p => {
      const full = `${p.firstName} ${p.lastName || ''}`.toLowerCase();
      return full.includes(q);
    });
  }, [people, memberSearchQuery]);

  const initialWelcomeMessage: Message = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `¡Hola! Soy tu **Asistente de Árbol Genealógico**. 

Escribe frases en lenguaje natural y crearé automáticamente las **tarjetas conectadas** en tu árbol.
Por ejemplo: \`Juan, Perez es hijo de Maria, Gomez\` o \`c es tio de f\`.

⚡ **Novedad - Atajo de Familiares (@):** 
Usa el botón de familiares arriba del texto o escribe **@** para autocompletar y citar nombres ya existentes al instante con el formato correcto (\`Nombre, Apellido\`).`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showManual]);

  // Reset highlight index when mention options change
  useEffect(() => {
    setHighlightedMentionIdx(0);
  }, [mentionFilteredPeople.length, mentionQuery]);

  // Insert citation at current cursor position in textarea
  const insertAtCursor = (textToInsert: string, replaceStart?: number, replaceEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInput(prev => (prev ? `${prev} ${textToInsert}` : textToInsert));
      return;
    }

    const start = replaceStart !== undefined ? replaceStart : textarea.selectionStart;
    const end = replaceEnd !== undefined ? replaceEnd : textarea.selectionEnd;

    const currentVal = input;
    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);

    const newVal = `${before}${textToInsert}${after}`;
    setInput(newVal);

    // Set cursor position after the inserted text
    const newCursorPos = start + textToInsert.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  // Handle selecting a person from the @ mention dropdown
  const handleSelectMentionPerson = (p: Person) => {
    const citation = formatPersonCitation(p) + ' ';
    const textarea = textareaRef.current;
    const cursor = textarea ? textarea.selectionStart : input.length;
    
    if (mentionStartIndex >= 0 && mentionStartIndex <= cursor) {
      insertAtCursor(citation, mentionStartIndex, cursor);
    } else {
      insertAtCursor(citation);
    }

    setMentionActive(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  // Inspect textarea changes to trigger @ mention popup
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setInput(val);

    // Check if cursor is right after an '@' or word started with '@'
    const textBeforeCursor = val.substring(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      // Check there are no spaces or newlines between @ and cursor (or max 20 chars query)
      const queryCandidate = textBeforeCursor.substring(lastAtIndex + 1);
      if (!queryCandidate.includes('\n') && queryCandidate.length <= 25) {
        setMentionActive(true);
        setMentionQuery(queryCandidate);
        setMentionStartIndex(lastAtIndex);
        return;
      }
    }

    if (mentionActive) {
      setMentionActive(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  };

  // Handle quick relationship template insertions
  const handleInsertTemplate = (template: string) => {
    const current = input.trim();
    let textToInsert = ` ${template} `;
    if (!current) {
      textToInsert = `${template} `;
    } else if (current.endsWith(' ') || current.endsWith(',')) {
      textToInsert = `${template} `;
    }
    insertAtCursor(textToInsert);
  };

  // Handle quick action for a specific person
  const handlePersonQuickAction = (p: Person, action: 'insert' | 'child' | 'parent' | 'spouse' | 'sibling') => {
    const citation = formatPersonCitation(p);
    setSelectedPersonForActions(null);
    setShowMemberSelector(false);

    if (action === 'insert') {
      insertAtCursor(citation + ' ');
      return;
    }

    if (action === 'child') {
      // "[Nombre, Apellido] es hijo de "
      insertAtCursor(`[Nuevo Hijo] es hijo de ${citation}\n`);
    } else if (action === 'parent') {
      // "[Nombre, Apellido] es padre de "
      insertAtCursor(`${citation} es hijo de [Nuevo Padre]\n`);
    } else if (action === 'spouse') {
      // "[Nombre, Apellido] es esposo/pareja de "
      insertAtCursor(`[Nueva Pareja] es pareja de ${citation}\n`);
    } else if (action === 'sibling') {
      // "[Nuevo Hermano] es hermano de [Nombre, Apellido]"
      insertAtCursor(`[Nuevo Hermano] es hermano de ${citation}\n`);
    }
  };

  // Helper to parse person string "Nombre, Apellido" or "Nombre Apellido" or "a"
  const parsePersonName = (raw: string, inferredGender?: 'M' | 'F' | 'unknown'): { firstName: string; lastName: string; gender: 'M' | 'F' | 'unknown' } => {
    let clean = raw.trim().replace(/^['"«»]+|['"«»]+$/g, '');
    let gender: 'M' | 'F' | 'unknown' = inferredGender || 'unknown';

    if (clean.includes(',')) {
      const parts = clean.split(',').map(s => s.trim());
      const firstName = parts[0] || 'Persona';
      const lastName = parts.slice(1).join(' ') || '';
      return { firstName, lastName, gender };
    }

    // No comma provided:
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return { firstName: words[0], lastName: '', gender };
    } else if (words.length >= 2) {
      const firstName = words[0];
      const lastName = words.slice(1).join(' ');
      return { firstName, lastName, gender };
    }

    return { firstName: 'Persona', lastName: '', gender };
  };

  // Find or create person in tree
  const getOrCreatePerson = async (
    nameInfo: { firstName: string; lastName: string; gender: 'M' | 'F' | 'unknown' },
    createdList: { id: string; name: string }[],
    existingList: { id: string; name: string }[],
    currentTreePeople: Person[]
  ): Promise<Person> => {
    const fLower = nameInfo.firstName.toLowerCase().trim();
    const lLower = nameInfo.lastName.toLowerCase().trim();

    // Check existing
    const found = currentTreePeople.find(p => {
      const pf = p.firstName.toLowerCase().trim();
      const pl = (p.lastName || '').toLowerCase().trim();
      if (lLower) {
        return pf === fLower && pl === lLower;
      }
      return pf === fLower;
    });

    if (found) {
      if (!existingList.some(e => e.id === found.id)) {
        existingList.push({ id: found.id, name: `${found.firstName} ${found.lastName}`.trim() });
      }
      return found;
    }

    // Create new person
    const newP = await addPerson({
      firstName: nameInfo.firstName,
      lastName: nameInfo.lastName,
      gender: nameInfo.gender !== 'unknown' ? nameInfo.gender : undefined,
      isLiving: true,
      certainty: 'confirmed'
    });

    createdList.push({ id: newP.id, name: `${newP.firstName} ${newP.lastName}`.trim() });
    currentTreePeople.push(newP);
    return newP;
  };

  // Process a single natural language line
  const processSentence = async (
    sentence: string,
    createdPeople: { id: string; name: string }[],
    existingPeople: { id: string; name: string }[],
    createdRelationships: { id: string; description: string }[],
    bridgeNodes: { id: string; name: string }[],
    currentTreePeople: Person[],
    currentTreeRels: Relationship[]
  ) => {
    const s = sentence.trim();
    if (!s) return;

    // Pattern definitions in Spanish:
    // 1. "A es hijo/hija de B"
    // 2. "A es padre/madre/papa/mama de B"
    // 3. "A es esposo/esposa/conyuge/pareja de B" / "A esta casado/casada con B"
    // 4. "A es hermano/hermana de B"
    // 5. "A es abuelo/abuela de B"
    // 6. "A es nieto/nieta de B"
    // 7. "A es tio/tia de B"
    // 8. "A es sobrino/sobrina de B"
    // 9. "A es primo/prima de B"
    // 10. "A es tio segundo/tia segunda de B" / "A es tio 2do de B"

    // Normalization regexes:
    const regexHijo = /^(.+?)\s+(?:es|son)\s+hij[oa]s?\s+de\s+(.+)$/i;
    const regexPadre = /^(.+?)\s+(?:es|son)\s+(?:padre|madre|pap[aá]|mam[aá]|progenitor(?:a)?)\s+de\s+(.+)$/i;
    const regexEsposo = /^(.+?)\s+(?:es\s+(?:espos[oa]|c[oó]nyuge|marido|mujer|pareja)\s+de|est[aá]\s+casad[oa]\s+con)\s+(.+)$/i;
    const regexHermano = /^(.+?)\s+(?:es|son)\s+herman[oa]s?\s+de\s+(.+)$/i;
    const regexAbuelo = /^(.+?)\s+(?:es|son)\s+abuel[oa]s?\s+de\s+(.+)$/i;
    const regexNieto = /^(.+?)\s+(?:es|son)\s+niet[oa]s?\s+de\s+(.+)$/i;
    const regexTioSegundo = /^(.+?)\s+(?:es|son)\s+t[ií][oa]s?\s+(?:segund[oa]|2d[oa])\s+de\s+(.+)$/i;
    const regexTio = /^(.+?)\s+(?:es|son)\s+t[ií][oa]s?\s+de\s+(.+)$/i;
    const regexSobrino = /^(.+?)\s+(?:es|son)\s+sobrin[oa]s?\s+de\s+(.+)$/i;
    const regexPrimo = /^(.+?)\s+(?:es|son)\s+prim[oa]s?\s+de\s+(.+)$/i;

    // 1. Tío Segundo (check before regular tío)
    if (regexTioSegundo.test(s)) {
      const match = s.match(regexTioSegundo)!;
      const rawUncle = match[1];
      const rawNephew = match[2];
      const isFemale = /t[ií]a\s+segunda/i.test(s);

      const uncle = await getOrCreatePerson(parsePersonName(rawUncle, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const nephew = await getOrCreatePerson(parsePersonName(rawNephew), createdPeople, existingPeople, currentTreePeople);

      // Find or create parent of nephew
      let parentRel = currentTreeRels.find(r => r.person2Id === nephew.id && r.type === 'parent');
      let parentNode: Person;
      if (parentRel) {
        parentNode = currentTreePeople.find(p => p.id === parentRel!.person1Id)!;
      } else {
        parentNode = await addPerson({
          firstName: `[Padre/Madre de ${nephew.firstName}]`,
          lastName: nephew.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parentNode);
        bridgeNodes.push({ id: parentNode.id, name: parentNode.firstName });
        const r = await addRelationship({ person1Id: parentNode.id, person2Id: nephew.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Find or create grandparent of nephew (parent of parentNode)
      let grandParentRel = currentTreeRels.find(r => r.person2Id === parentNode.id && r.type === 'parent');
      let grandParentNode: Person;
      if (grandParentRel) {
        grandParentNode = currentTreePeople.find(p => p.id === grandParentRel!.person1Id)!;
      } else {
        grandParentNode = await addPerson({
          firstName: `[Abuelo/a de ${nephew.firstName}]`,
          lastName: nephew.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(grandParentNode);
        bridgeNodes.push({ id: grandParentNode.id, name: grandParentNode.firstName });
        const r = await addRelationship({ person1Id: grandParentNode.id, person2Id: parentNode.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Tío segundo is cousin of parentNode -> child of sibling of grandParentNode (or sibling of grandParentNode in older usage)
      // Connect uncle as sibling to grandParentNode (sibling of grandparent = tío abuelo / tío segundo)
      let greatGrandParentRel = currentTreeRels.find(r => r.person2Id === grandParentNode.id && r.type === 'parent');
      let greatGrandParentNode: Person;
      if (greatGrandParentRel) {
        greatGrandParentNode = currentTreePeople.find(p => p.id === greatGrandParentRel!.person1Id)!;
      } else {
        greatGrandParentNode = await addPerson({
          firstName: `[Bisabuelo/a de ${nephew.firstName}]`,
          lastName: nephew.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(greatGrandParentNode);
        bridgeNodes.push({ id: greatGrandParentNode.id, name: greatGrandParentNode.firstName });
        const r1 = await addRelationship({ person1Id: greatGrandParentNode.id, person2Id: grandParentNode.id, type: 'parent' });
        currentTreeRels.push(r1);
      }

      const rUncle = await addRelationship({ person1Id: greatGrandParentNode.id, person2Id: uncle.id, type: 'parent' });
      currentTreeRels.push(rUncle);
      createdRelationships.push({
        id: rUncle.id,
        description: `${uncle.firstName} conectado/a como tío segundo de ${nephew.firstName} (mediante ancestros puente)`
      });
      return;
    }

    // 2. A es hijo de B
    if (regexHijo.test(s)) {
      const match = s.match(regexHijo)!;
      const rawChild = match[1];
      const rawParent = match[2];
      const isFemale = /hija/i.test(s);

      const child = await getOrCreatePerson(parsePersonName(rawChild, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const parent = await getOrCreatePerson(parsePersonName(rawParent), createdPeople, existingPeople, currentTreePeople);

      // Check if relationship already exists
      const exists = currentTreeRels.some(r => r.person1Id === parent.id && r.person2Id === child.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: parent.id, person2Id: child.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${parent.firstName} ${parent.lastName} es Padre/Madre de ${child.firstName} ${child.lastName}`
        });
      }
      return;
    }

    // 3. A es padre/madre de B
    if (regexPadre.test(s)) {
      const match = s.match(regexPadre)!;
      const rawParent = match[1];
      const rawChild = match[2];
      const isMother = /madre|mam[aá]/i.test(s);

      const parent = await getOrCreatePerson(parsePersonName(rawParent, isMother ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const child = await getOrCreatePerson(parsePersonName(rawChild), createdPeople, existingPeople, currentTreePeople);

      const exists = currentTreeRels.some(r => r.person1Id === parent.id && r.person2Id === child.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: parent.id, person2Id: child.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${parent.firstName} ${parent.lastName} es Padre/Madre de ${child.firstName} ${child.lastName}`
        });
      }
      return;
    }

    // 4. A es esposo/a de B / casado con
    if (regexEsposo.test(s)) {
      const match = s.match(regexEsposo)!;
      const rawP1 = match[1];
      const rawP2 = match[2];
      const isFemale = /esposa|mujer|casada/i.test(s);

      const p1 = await getOrCreatePerson(parsePersonName(rawP1, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const p2 = await getOrCreatePerson(parsePersonName(rawP2, isFemale ? 'M' : 'unknown'), createdPeople, existingPeople, currentTreePeople);

      const exists = currentTreeRels.some(r => 
        (r.person1Id === p1.id && r.person2Id === p2.id && r.type === 'spouse') ||
        (r.person1Id === p2.id && r.person2Id === p1.id && r.type === 'spouse')
      );
      if (!exists) {
        const rel = await addRelationship({ person1Id: p1.id, person2Id: p2.id, type: 'spouse' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${p1.firstName} ${p1.lastName} y ${p2.firstName} ${p2.lastName} están conectados como Cónyuges`
        });
      }
      return;
    }

    // 5. A es hermano/a de B
    if (regexHermano.test(s)) {
      const match = s.match(regexHermano)!;
      const rawP1 = match[1];
      const rawP2 = match[2];
      const isFemale = /hermana/i.test(s);

      const p1 = await getOrCreatePerson(parsePersonName(rawP1, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const p2 = await getOrCreatePerson(parsePersonName(rawP2), createdPeople, existingPeople, currentTreePeople);

      // Check if p2 has parents
      const p2Parents = currentTreeRels.filter(r => r.person2Id === p2.id && r.type === 'parent');
      if (p2Parents.length > 0) {
        for (const pr of p2Parents) {
          const parent = currentTreePeople.find(p => p.id === pr.person1Id);
          const alreadyLinked = currentTreeRels.some(r => r.person1Id === pr.person1Id && r.person2Id === p1.id && r.type === 'parent');
          if (!alreadyLinked && parent) {
            const rel = await addRelationship({ person1Id: parent.id, person2Id: p1.id, type: 'parent' });
            currentTreeRels.push(rel);
            createdRelationships.push({
              id: rel.id,
              description: `${p1.firstName} vinculado/a a los mismos padres de ${p2.firstName} (${parent.firstName})`
            });
          }
        }
      } else {
        // Create a bridge parent
        const bridgeParent = await addPerson({
          firstName: `[Padres de ${p1.firstName} y ${p2.firstName}]`,
          lastName: p1.lastName || p2.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(bridgeParent);
        bridgeNodes.push({ id: bridgeParent.id, name: bridgeParent.firstName });

        const r1 = await addRelationship({ person1Id: bridgeParent.id, person2Id: p1.id, type: 'parent' });
        const r2 = await addRelationship({ person1Id: bridgeParent.id, person2Id: p2.id, type: 'parent' });
        currentTreeRels.push(r1, r2);
        createdRelationships.push({
          id: r1.id,
          description: `${p1.firstName} y ${p2.firstName} conectados como hermanos mediante nodo parental común`
        });
      }
      return;
    }

    // 6. A es abuelo/abuela de B
    if (regexAbuelo.test(s)) {
      const match = s.match(regexAbuelo)!;
      const rawGrandparent = match[1];
      const rawGrandchild = match[2];
      const isFemale = /abuela/i.test(s);

      const grandparent = await getOrCreatePerson(parsePersonName(rawGrandparent, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const grandchild = await getOrCreatePerson(parsePersonName(rawGrandchild), createdPeople, existingPeople, currentTreePeople);

      // Check if grandchild has a parent
      const parentRel = currentTreeRels.find(r => r.person2Id === grandchild.id && r.type === 'parent');
      let parentNode: Person;
      if (parentRel) {
        parentNode = currentTreePeople.find(p => p.id === parentRel.person1Id)!;
      } else {
        parentNode = await addPerson({
          firstName: `[Padre/Madre de ${grandchild.firstName}]`,
          lastName: grandchild.lastName || grandparent.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parentNode);
        bridgeNodes.push({ id: parentNode.id, name: parentNode.firstName });
        const r = await addRelationship({ person1Id: parentNode.id, person2Id: grandchild.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Link grandparent to parentNode
      const exists = currentTreeRels.some(r => r.person1Id === grandparent.id && r.person2Id === parentNode.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: grandparent.id, person2Id: parentNode.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${grandparent.firstName} conectado/a como Abuelo/a de ${grandchild.firstName}`
        });
      }
      return;
    }

    // 7. A es nieto/nieta de B
    if (regexNieto.test(s)) {
      const match = s.match(regexNieto)!;
      const rawGrandchild = match[1];
      const rawGrandparent = match[2];
      const isFemale = /nieta/i.test(s);

      const grandchild = await getOrCreatePerson(parsePersonName(rawGrandchild, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const grandparent = await getOrCreatePerson(parsePersonName(rawGrandparent), createdPeople, existingPeople, currentTreePeople);

      const parentRel = currentTreeRels.find(r => r.person2Id === grandchild.id && r.type === 'parent');
      let parentNode: Person;
      if (parentRel) {
        parentNode = currentTreePeople.find(p => p.id === parentRel.person1Id)!;
      } else {
        parentNode = await addPerson({
          firstName: `[Padre/Madre de ${grandchild.firstName}]`,
          lastName: grandchild.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parentNode);
        bridgeNodes.push({ id: parentNode.id, name: parentNode.firstName });
        const r = await addRelationship({ person1Id: parentNode.id, person2Id: grandchild.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      const exists = currentTreeRels.some(r => r.person1Id === grandparent.id && r.person2Id === parentNode.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: grandparent.id, person2Id: parentNode.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${grandchild.firstName} conectado/a como Nieto/a de ${grandparent.firstName}`
        });
      }
      return;
    }

    // 8. A es tío/tía de B
    if (regexTio.test(s)) {
      const match = s.match(regexTio)!;
      const rawUncle = match[1];
      const rawNephew = match[2];
      const isFemale = /t[ií]a/i.test(s);

      const uncle = await getOrCreatePerson(parsePersonName(rawUncle, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const nephew = await getOrCreatePerson(parsePersonName(rawNephew), createdPeople, existingPeople, currentTreePeople);

      // Check if nephew has parents
      let parentRel = currentTreeRels.find(r => r.person2Id === nephew.id && r.type === 'parent');
      let parentNode: Person;
      if (parentRel) {
        parentNode = currentTreePeople.find(p => p.id === parentRel.person1Id)!;
      } else {
        parentNode = await addPerson({
          firstName: `[Padre/Madre de ${nephew.firstName}]`,
          lastName: nephew.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parentNode);
        bridgeNodes.push({ id: parentNode.id, name: parentNode.firstName });
        const r = await addRelationship({ person1Id: parentNode.id, person2Id: nephew.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Check if parentNode has parents (grandparent)
      let grandParentRel = currentTreeRels.find(r => r.person2Id === parentNode.id && r.type === 'parent');
      let grandParentNode: Person;
      if (grandParentRel) {
        grandParentNode = currentTreePeople.find(p => p.id === grandParentRel.person1Id)!;
      } else {
        grandParentNode = await addPerson({
          firstName: `[Abuelo/a de ${nephew.firstName}]`,
          lastName: uncle.lastName || parentNode.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(grandParentNode);
        bridgeNodes.push({ id: grandParentNode.id, name: grandParentNode.firstName });
        const r = await addRelationship({ person1Id: grandParentNode.id, person2Id: parentNode.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Link uncle as child of grandParentNode
      const exists = currentTreeRels.some(r => r.person1Id === grandParentNode.id && r.person2Id === uncle.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: grandParentNode.id, person2Id: uncle.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${uncle.firstName} conectado/a como Tío/a de ${nephew.firstName} (hermano de ${parentNode.firstName})`
        });
      }
      return;
    }

    // 9. A es sobrino/sobrina de B
    if (regexSobrino.test(s)) {
      const match = s.match(regexSobrino)!;
      const rawNephew = match[1];
      const rawUncle = match[2];
      const isFemale = /sobrina/i.test(s);

      const nephew = await getOrCreatePerson(parsePersonName(rawNephew, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const uncle = await getOrCreatePerson(parsePersonName(rawUncle), createdPeople, existingPeople, currentTreePeople);

      let parentRel = currentTreeRels.find(r => r.person2Id === nephew.id && r.type === 'parent');
      let parentNode: Person;
      if (parentRel) {
        parentNode = currentTreePeople.find(p => p.id === parentRel.person1Id)!;
      } else {
        parentNode = await addPerson({
          firstName: `[Padre/Madre de ${nephew.firstName}]`,
          lastName: nephew.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parentNode);
        bridgeNodes.push({ id: parentNode.id, name: parentNode.firstName });
        const r = await addRelationship({ person1Id: parentNode.id, person2Id: nephew.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      let grandParentRel = currentTreeRels.find(r => r.person2Id === parentNode.id && r.type === 'parent');
      let grandParentNode: Person;
      if (grandParentRel) {
        grandParentNode = currentTreePeople.find(p => p.id === grandParentRel.person1Id)!;
      } else {
        grandParentNode = await addPerson({
          firstName: `[Abuelo/a de ${nephew.firstName}]`,
          lastName: uncle.lastName || parentNode.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(grandParentNode);
        bridgeNodes.push({ id: grandParentNode.id, name: grandParentNode.firstName });
        const r = await addRelationship({ person1Id: grandParentNode.id, person2Id: parentNode.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      const exists = currentTreeRels.some(r => r.person1Id === grandParentNode.id && r.person2Id === uncle.id && r.type === 'parent');
      if (!exists) {
        const rel = await addRelationship({ person1Id: grandParentNode.id, person2Id: uncle.id, type: 'parent' });
        currentTreeRels.push(rel);
        createdRelationships.push({
          id: rel.id,
          description: `${nephew.firstName} conectado/a como Sobrino/a de ${uncle.firstName}`
        });
      }
      return;
    }

    // 10. A es primo/prima de B
    if (regexPrimo.test(s)) {
      const match = s.match(regexPrimo)!;
      const rawCousin1 = match[1];
      const rawCousin2 = match[2];
      const isFemale = /prima/i.test(s);

      const c1 = await getOrCreatePerson(parsePersonName(rawCousin1, isFemale ? 'F' : 'M'), createdPeople, existingPeople, currentTreePeople);
      const c2 = await getOrCreatePerson(parsePersonName(rawCousin2), createdPeople, existingPeople, currentTreePeople);

      // Create or get parents for both
      let parent1Rel = currentTreeRels.find(r => r.person2Id === c1.id && r.type === 'parent');
      let parent1Node: Person;
      if (parent1Rel) {
        parent1Node = currentTreePeople.find(p => p.id === parent1Rel.person1Id)!;
      } else {
        parent1Node = await addPerson({
          firstName: `[Progenitor de ${c1.firstName}]`,
          lastName: c1.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parent1Node);
        bridgeNodes.push({ id: parent1Node.id, name: parent1Node.firstName });
        const r = await addRelationship({ person1Id: parent1Node.id, person2Id: c1.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      let parent2Rel = currentTreeRels.find(r => r.person2Id === c2.id && r.type === 'parent');
      let parent2Node: Person;
      if (parent2Rel) {
        parent2Node = currentTreePeople.find(p => p.id === parent2Rel.person1Id)!;
      } else {
        parent2Node = await addPerson({
          firstName: `[Progenitor de ${c2.firstName}]`,
          lastName: c2.lastName || '',
          isPlaceholder: true,
          isLiving: true
        });
        currentTreePeople.push(parent2Node);
        bridgeNodes.push({ id: parent2Node.id, name: parent2Node.firstName });
        const r = await addRelationship({ person1Id: parent2Node.id, person2Id: c2.id, type: 'parent' });
        currentTreeRels.push(r);
      }

      // Link parent1Node and parent2Node as siblings under a shared grandparent
      let commonGrandParent = await addPerson({
        firstName: `[Abuelos de ${c1.firstName} y ${c2.firstName}]`,
        lastName: c1.lastName || c2.lastName || '',
        isPlaceholder: true,
        isLiving: true
      });
      currentTreePeople.push(commonGrandParent);
      bridgeNodes.push({ id: commonGrandParent.id, name: commonGrandParent.firstName });

      const r1 = await addRelationship({ person1Id: commonGrandParent.id, person2Id: parent1Node.id, type: 'parent' });
      const r2 = await addRelationship({ person1Id: commonGrandParent.id, person2Id: parent2Node.id, type: 'parent' });
      currentTreeRels.push(r1, r2);

      createdRelationships.push({
        id: r1.id,
        description: `${c1.firstName} y ${c2.firstName} conectados como Primos (hijos de hermanos)`
      });
      return;
    }

    throw new Error(`No pude interpretar la relación en: "${s}". Revisa el formato (ej: "Juan, Perez es hijo de Maria, Gomez").`);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || input).trim();
    if (!rawText || isProcessing) return;

    if (!canEdit) {
      alert('Modo de solo lectura: Inicia sesión o solicita permisos para editar el árbol.');
      return;
    }

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // Split multiple lines
    const lines = rawText.split(/[\n;]+/).map(l => l.trim()).filter(Boolean);
    const createdPeople: { id: string; name: string }[] = [];
    const existingPeople: { id: string; name: string }[] = [];
    const createdRelationships: { id: string; description: string }[] = [];
    const bridgeNodes: { id: string; name: string }[] = [];
    const errors: string[] = [];

    // Local in-memory working lists to chain multi-line commands
    const currentTreePeople = [...people];
    const currentTreeRels = [...relationships];

    try {
      for (const line of lines) {
        try {
          await processSentence(
            line,
            createdPeople,
            existingPeople,
            createdRelationships,
            bridgeNodes,
            currentTreePeople,
            currentTreeRels
          );
        } catch (err: any) {
          errors.push(err.message || `Error procesando: "${line}"`);
        }
      }

      let responseText = '';
      if (createdRelationships.length > 0) {
        responseText = `¡Listo! He procesado **${lines.length}** instrucción(es) con éxito y conectado las tarjetas en tu árbol genealógico.`;
      } else if (errors.length > 0) {
        responseText = `Hubo un inconveniente interpretando una o más frases. Revisa la sintaxis recomendada.`;
      } else {
        responseText = `Instrucción completada.`;
      }

      const botMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionsPerformed: {
          createdPeople,
          existingPeople,
          createdRelationships,
          bridgeNodes,
          errors
        }
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: `ast-err-${Date.now()}`,
        sender: 'assistant',
        text: `Ocurrió un error inesperado al procesar: ${e.message || 'Error desconocido'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If mention popover is active and has results
    if (mentionActive && mentionFilteredPeople.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedMentionIdx(prev => (prev + 1) % mentionFilteredPeople.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedMentionIdx(prev => (prev - 1 + mentionFilteredPeople.length) % mentionFilteredPeople.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = mentionFilteredPeople[highlightedMentionIdx] || mentionFilteredPeople[0];
        if (selected) {
          handleSelectMentionPerson(selected);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionActive(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (exampleText: string) => {
    handleSendMessage(exampleText);
  };

  const handleSelectCreatedPerson = (personId: string) => {
    setSelectedPersonId(personId);
    if (onSelectPerson) onSelectPerson(personId);
    onClose();
  };

  const quickExamples = [
    { label: 'Hijo / Padre', text: 'Carlos, Perez es hijo de Roberto, Perez' },
    { label: 'Cónyuges', text: 'Ana, Gomez es esposa de Roberto, Perez' },
    { label: 'Hermanos', text: 'Lucia, Perez es hermana de Carlos, Perez' },
    { label: 'Abuelo / Nieto', text: 'Alberto, Perez es abuelo de Carlos, Perez' },
    { label: 'Tío', text: 'Esteban, Gomez es tio de Carlos, Perez' },
    { label: 'Tío Segundo', text: 'Fernando, Castro es tio segundo de Carlos, Perez' },
    { label: 'Primos', text: 'Mateo, Lopez es primo de Carlos, Perez' },
    { 
      label: '⚡ Lote Completo (5 Frases)', 
      text: `a es hijo de b\nc es tio de f\nz es hijo de j\nz es abuelo de h\nl es tio segundo de p` 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden flex flex-col h-[90vh] max-h-[850px] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-2xl">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-base leading-tight">
                  Asistente de Parentescos y Árbol Rápido
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 uppercase font-sans font-semibold">
                  NLP Chat
                </span>
              </div>
              <p className="text-[11px] text-[#F5F2ED]/80 font-sans mt-0.5">
                Crea personas y relaciones automáticas escribiendo en lenguaje natural
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowManual(!showManual)}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 text-xs font-semibold flex items-center space-x-1 px-2.5 transition-colors"
              title="Mostrar / Ocultar Manual Rápido"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showManual ? 'Ocultar Manual' : 'Ver Manual'}</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Manual Accordion / Drawer */}
        {showManual && (
          <div className="bg-[#F5F2ED] dark:bg-[#1E293B]/80 border-b border-[#D1CEC7] dark:border-[#334155] p-3.5 sm:p-4 text-xs shrink-0 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-[#5A5A40] dark:text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Manual Rápido de Sintaxis y Apellidos</span>
              </div>
              <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                💡 Haz clic en los botones para probar al instante
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#434331] dark:text-[#CBD5E1] mb-3">
              <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E5E2D9] dark:border-[#334155]">
                <strong className="text-[#A65D47] dark:text-amber-400 block mb-0.5">📌 Regla de la Coma para Apellidos:</strong>
                <span>Usa la coma para delimitar: <code>Nombre, Apellido</code>.</span>
                <span className="block text-[10px] text-[#7C796F] dark:text-[#94A3B8] mt-0.5">
                  Ej: <em>Juan, Perez</em> &bull; <em>Maria de los Angeles, Gonzalez</em>
                </span>
              </div>

              <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E5E2D9] dark:border-[#334155]">
                <strong className="text-[#5A5A40] dark:text-sky-400 block mb-0.5">🔗 Relaciones Soportadas:</strong>
                <span className="truncate block">
                  <code>es hijo de</code> &bull; <code>es padre/madre de</code> &bull; <code>es abuelo de</code> &bull; <code>es tio de</code> &bull; <code>es tio segundo de</code> &bull; <code>es primo de</code> &bull; <code>es hermano de</code>
                </span>
              </div>
            </div>

            {/* Clickable Quick Examples */}
            <div className="flex flex-wrap gap-1.5">
              {quickExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(ex.text)}
                  disabled={isProcessing}
                  className="bg-white dark:bg-[#0F172A] hover:bg-[#E5E2D9] dark:hover:bg-[#334155] text-[#434331] dark:text-[#E2E8F0] border border-[#D1CEC7] dark:border-[#334155] px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>{ex.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Stream Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FDFBF7] dark:bg-[#0B0F17]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-200`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-[#7C796F] dark:text-[#64748B] px-1">
                  <span>{isUser ? 'Tú' : 'Asistente Genealógico'}</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] sm:max-w-[80%] text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#5A5A40] text-white rounded-tr-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#2C2C2C] dark:text-[#F1F5F9] border border-[#E5E2D9] dark:border-[#334155] shadow-xs rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                  {/* Actions summary cards if assistant performed actions */}
                  {msg.actionsPerformed && (
                    <div className="mt-3 pt-3 border-t border-[#E5E2D9] dark:border-[#334155] space-y-2 text-[11px]">
                      
                      {/* Created Relationships */}
                      {msg.actionsPerformed.createdRelationships.length > 0 && (
                        <div>
                          <span className="font-bold text-[#5A5A40] dark:text-emerald-400 block mb-1">
                            🔗 Vínculos Establecidos ({msg.actionsPerformed.createdRelationships.length}):
                          </span>
                          <ul className="space-y-1 pl-1">
                            {msg.actionsPerformed.createdRelationships.map((r, i) => (
                              <li key={i} className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>{r.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Created People Badges */}
                      {msg.actionsPerformed.createdPeople.length > 0 && (
                        <div className="mt-2">
                          <span className="font-bold text-[#A65D47] dark:text-amber-400 block mb-1">
                            👤 Nuevas Tarjetas Creadas ({msg.actionsPerformed.createdPeople.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.actionsPerformed.createdPeople.map(p => (
                              <button
                                key={p.id}
                                onClick={() => handleSelectCreatedPerson(p.id)}
                                className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 px-2 py-0.5 rounded-lg text-[10px] font-semibold hover:bg-amber-100 flex items-center space-x-1 transition-colors cursor-pointer"
                                title="Ver en el árbol"
                              >
                                <span>{p.name}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bridge Nodes */}
                      {msg.actionsPerformed.bridgeNodes.length > 0 && (
                        <div className="mt-1">
                          <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] italic">
                            ⚡ Nodos puente auxiliares generados: {msg.actionsPerformed.bridgeNodes.map(b => b.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Errors if any */}
                      {msg.actionsPerformed.errors.length > 0 && (
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 text-[10px] space-y-0.5">
                          <strong>Advertencias:</strong>
                          {msg.actionsPerformed.errors.map((err, i) => (
                            <p key={i}>&bull; {err}</p>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center space-x-2 text-xs text-[#7C796F] dark:text-[#94A3B8] italic p-2 animate-pulse">
              <Bot className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Analizando parentescos y conectando tarjetas en el árbol...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Family Shortcuts & Autocomplete Popover */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#1E293B] border-t border-[#D1CEC7] dark:border-[#334155] shrink-0 space-y-2.5">
          
          {/* Family Citation Shortcuts Header & Carousel */}
          <div className="bg-[#F5F2ED] dark:bg-[#0F172A] rounded-2xl p-2 sm:p-2.5 border border-[#E5E2D9] dark:border-[#334155] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#5A5A40] dark:text-amber-400">
                <AtSign className="w-3.5 h-3.5" />
                <span className="font-serif">Familiares del Árbol ({people.length}):</span>
                <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] font-sans font-normal hidden sm:inline">
                  (Haz clic o escribe @ para citar)
                </span>
              </div>

              {people.length > 5 && (
                <div className="relative max-w-[130px] sm:max-w-[170px]">
                  <Search className="w-3 h-3 text-[#9A968A] absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Filtrar familiar..."
                    className="w-full pl-6 pr-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] rounded-full text-[10px] text-[#2C2C2C] dark:text-[#F1F5F9] placeholder-[#9A968A] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                  />
                  {memberSearchQuery && (
                    <button
                      onClick={() => setMemberSearchQuery('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#9A968A] hover:text-[#434331]"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* People Pills Carousel */}
            {people.length === 0 ? (
              <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8] italic py-1 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Árbol vacío. Escribe tu primera frase abajo para crear y conectar las primeras tarjetas.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {toolbarFilteredPeople.map(p => {
                  const citation = formatPersonCitation(p);
                  const isMale = p.gender === 'M';
                  const isFemale = p.gender === 'F';
                  return (
                    <div key={p.id} className="relative group shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePersonQuickAction(p, 'insert')}
                        className="flex items-center space-x-1.5 bg-white dark:bg-[#1E293B] hover:bg-[#E5E2D9] dark:hover:bg-[#334155] text-[#2C2C2C] dark:text-[#E2E8F0] border border-[#D1CEC7] dark:border-[#334155] pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                        title={`Haz clic para insertar "${citation}" en el mensaje`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                          isMale ? 'bg-sky-600' : isFemale ? 'bg-rose-500' : 'bg-[#5A5A40]'
                        }`}>
                          {p.firstName.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-serif truncate max-w-[130px]">{p.firstName} {p.lastName || ''}</span>
                        <span className="text-[9px] text-[#7C796F] dark:text-[#94A3B8] font-mono opacity-70">
                          {citation}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Relationship Snippet Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pt-0.5 border-t border-[#E5E2D9] dark:border-[#334155]">
              <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] font-semibold shrink-0 mr-1 uppercase">
                Conectores:
              </span>
              {[
                { label: 'es hijo de', text: 'es hijo de' },
                { label: 'es padre de', text: 'es padre de' },
                { label: 'es pareja de', text: 'es pareja de' },
                { label: 'es hermano de', text: 'es hermano de' },
                { label: 'es abuelo de', text: 'es abuelo de' },
                { label: 'es tio de', text: 'es tio de' },
                { label: 'es primo de', text: 'es primo de' }
              ].map(snip => (
                <button
                  key={snip.label}
                  type="button"
                  onClick={() => handleInsertTemplate(snip.text)}
                  className="bg-white/80 dark:bg-[#1E293B]/70 hover:bg-[#E5E2D9] dark:hover:bg-[#334155] text-[#5A5A40] dark:text-amber-300 border border-[#D1CEC7]/70 dark:border-[#334155] px-2 py-0.5 rounded-md text-[10px] font-sans font-medium shrink-0 transition-colors cursor-pointer"
                >
                  +{snip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form & Textarea Container with Floating Mention Autocomplete */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end space-x-2 relative"
          >
            <div className="flex-1 relative">

              {/* Floating @ Mention Autocomplete Popover */}
              {mentionActive && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-56 flex flex-col">
                  <div className="bg-[#F5F2ED] dark:bg-[#1E293B] px-3 py-1.5 border-b border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between text-[11px] font-semibold text-[#5A5A40] dark:text-amber-400">
                    <div className="flex items-center space-x-1">
                      <AtSign className="w-3.5 h-3.5" />
                      <span>Citar Familiar Existente {mentionQuery ? `("${mentionQuery}")` : ''}</span>
                    </div>
                    <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] font-normal">
                      Usa ↑↓ y Enter o haz clic
                    </span>
                  </div>

                  <div className="overflow-y-auto max-h-44 p-1">
                    {mentionFilteredPeople.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#7C796F] dark:text-[#94A3B8]">
                        No se encontró ningún familiar con <code className="text-[#A65D47] dark:text-amber-400 font-bold">@{mentionQuery}</code>.
                        <span className="block text-[10px] mt-0.5">Se creará automáticamente como nueva persona si envías el mensaje.</span>
                      </div>
                    ) : (
                      mentionFilteredPeople.map((p, idx) => {
                        const isSelected = idx === highlightedMentionIdx;
                        const isMale = p.gender === 'M';
                        const isFemale = p.gender === 'F';
                        const citation = formatPersonCitation(p);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectMentionPerson(p)}
                            onMouseEnter={() => setHighlightedMentionIdx(idx)}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#5A5A40] text-white dark:bg-amber-600'
                                : 'hover:bg-[#F5F2ED] dark:hover:bg-[#1E293B] text-[#2C2C2C] dark:text-[#E2E8F0]'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected 
                                  ? 'bg-white text-[#5A5A40]' 
                                  : isMale ? 'bg-sky-600 text-white' : isFemale ? 'bg-rose-500 text-white' : 'bg-[#5A5A40] text-white'
                              }`}>
                                {p.firstName.charAt(0).toUpperCase()}
                              </span>
                              <div className="truncate">
                                <span className="font-serif font-semibold">{p.firstName} {p.lastName || ''}</span>
                                {p.birthDate && (
                                  <span className={`text-[10px] ml-1.5 ${isSelected ? 'text-white/80' : 'text-[#7C796F] dark:text-[#94A3B8]'}`}>
                                    (*{p.birthDate})
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                              isSelected
                                ? 'bg-white/20 border-white/30 text-white'
                                : 'bg-[#F5F2ED] dark:bg-[#1E293B] border-[#D1CEC7] dark:border-[#334155] text-[#5A5A40] dark:text-amber-400'
                            }`}>
                              {citation}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe o cita con @: Juan, Perez es hijo de Maria, Gomez (Enter para enviar)..."
                rows={input.includes('\n') ? 3 : 1}
                className="w-full bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] rounded-2xl py-2.5 pl-3.5 pr-10 text-xs text-[#2C2C2C] dark:text-[#F1F5F9] placeholder-[#9A968A] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] dark:hover:bg-amber-500 text-white p-2.5 rounded-2xl shadow-xs transition-transform transform active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer shrink-0 flex items-center justify-center"
              title="Crear y Conectar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-[#7C796F] dark:text-[#94A3B8] px-1">
            <span>Tip: Escribe <strong>@</strong> para autocompletar familiares o haz clic en los botones de arriba.</span>
            <button
              onClick={() => setMessages([initialWelcomeMessage])}
              className="text-[#9A968A] hover:text-[#5A5A40] dark:hover:text-amber-400 flex items-center space-x-0.5 cursor-pointer"
              title="Limpiar historial de chat"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpiar chat</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
