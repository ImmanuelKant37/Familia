import { Tree, Person, Relationship } from '../types';

export function exportToGedcom(tree: Tree, people: Person[], relationships: Relationship[]): string {
  const lines: string[] = [
    '0 HEAD',
    '1 SOUR ARBOL_GENEALOGICO_DIGITAL',
    '2 VERS 1.0',
    '2 NAME Árbol Genealógico Digital',
    '1 DATE ' + new Date().toISOString().split('T')[0].replace(/-/g, ' '),
    '1 GEDC',
    '2 VERS 5.5.1',
    '2 FORM LINEAGE-LINKED',
    '1 CHAR UTF-8',
    `1 NOTE ${tree.name} - ${tree.description || ''}`,
  ];

  // Map people to GEDCOM INDI records
  people.forEach((p) => {
    lines.push(`0 @I${p.id}@ INDI`);
    const nameLine = `1 NAME ${p.firstName} /${p.lastName}/`;
    lines.push(nameLine);
    if (p.maidenName) {
      lines.push(`2 _MARNM ${p.maidenName}`);
    }
    if (p.gender) {
      lines.push(`1 SEX ${p.gender === 'M' ? 'M' : p.gender === 'F' ? 'F' : 'U'}`);
    }
    if (p.birthDate || p.birthDateApprox || p.birthPlace) {
      lines.push('1 BIRT');
      if (p.birthDate || p.birthDateApprox) {
        lines.push(`2 DATE ${p.birthDate || p.birthDateApprox}`);
      }
      if (p.birthPlace) {
        lines.push(`2 PLAC ${p.birthPlace}`);
      }
    }
    if (!p.isLiving && (p.deathDate || p.deathDateApprox || p.deathPlace)) {
      lines.push('1 DEAT');
      if (p.deathDate || p.deathDateApprox) {
        lines.push(`2 DATE ${p.deathDate || p.deathDateApprox}`);
      }
      if (p.deathPlace) {
        lines.push(`2 PLAC ${p.deathPlace}`);
      }
    }
    if (p.profession) {
      lines.push(`1 OCCU ${p.profession}`);
    }
    if (p.nationality) {
      lines.push(`1 NATI ${p.nationality}`);
    }
    if (p.bio) {
      lines.push(`1 NOTE ${p.bio.replace(/\n/g, ' ')}`);
    }
  });

  // Build families for spouses and children
  // Group spouses and parents
  const familyMap = new Map<string, { id: string; husb?: string; wife?: string; children: string[] }>();
  let famCounter = 1;

  // Handle spouses
  relationships.filter(r => r.type === 'spouse' || r.type === 'partner').forEach((r) => {
    const famId = `F${famCounter++}`;
    const p1 = people.find(p => p.id === r.person1Id);
    const p2 = people.find(p => p.id === r.person2Id);
    
    let husb = undefined;
    let wife = undefined;
    if (p1?.gender === 'M' || p2?.gender === 'F') {
      husb = p1?.id;
      wife = p2?.id;
    } else {
      husb = p2?.id;
      wife = p1?.id;
    }

    familyMap.set(famId, { id: famId, husb, wife, children: [] });
  });

  // Handle parent-child relationships
  const parentChild = relationships.filter(r => r.type === 'parent');
  parentChild.forEach(r => {
    const parentId = r.person1Id;
    const childId = r.person2Id;

    // Find if parent already has a family
    let foundFam = Array.from(familyMap.values()).find(f => f.husb === parentId || f.wife === parentId);
    if (!foundFam) {
      const famId = `F${famCounter++}`;
      const parent = people.find(p => p.id === parentId);
      const isFather = parent?.gender === 'M';
      foundFam = {
        id: famId,
        husb: isFather ? parentId : undefined,
        wife: !isFather ? parentId : undefined,
        children: []
      };
      familyMap.set(famId, foundFam);
    }
    if (!foundFam.children.includes(childId)) {
      foundFam.children.push(childId);
    }
  });

  // Write FAM records
  familyMap.forEach((fam) => {
    lines.push(`0 @${fam.id}@ FAM`);
    if (fam.husb) lines.push(`1 HUSB @I${fam.husb}@`);
    if (fam.wife) lines.push(`1 WIFE @I${fam.wife}@`);
    fam.children.forEach(c => lines.push(`1 CHIL @I${c}@`));
  });

  lines.push('0 TRLR');
  return lines.join('\n');
}

export function parseGedcom(content: string, treeId: string): { people: Person[]; relationships: Relationship[] } {
  const lines = content.split(/\r?\n/);
  const people: Person[] = [];
  const relationships: Relationship[] = [];

  let currentIndi: Partial<Person> | null = null;
  let currentFam: { id: string; husb?: string; wife?: string; children: string[] } | null = null;
  let lastTag = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(' ');
    const level = parts[0];
    const tagOrId = parts[1];
    const value = parts.slice(2).join(' ');

    if (level === '0') {
      if (currentIndi && currentIndi.id) {
        people.push({
          id: currentIndi.id,
          treeId,
          firstName: currentIndi.firstName || 'Sin Nombre',
          lastName: currentIndi.lastName || 'Sin Apellido',
          gender: currentIndi.gender || 'unknown',
          birthDate: currentIndi.birthDate || '',
          birthPlace: currentIndi.birthPlace || '',
          deathDate: currentIndi.deathDate || '',
          deathPlace: currentIndi.deathPlace || '',
          isLiving: currentIndi.isLiving !== undefined ? currentIndi.isLiving : (!currentIndi.deathDate),
          bio: currentIndi.bio || '',
          profession: currentIndi.profession || '',
          nationality: currentIndi.nationality || '',
          certainty: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        currentIndi = null;
      }

      if (currentFam && (currentFam.husb || currentFam.wife || currentFam.children.length > 0)) {
        // Build relationships from current family
        if (currentFam.husb && currentFam.wife) {
          relationships.push({
            id: `rel-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            treeId,
            person1Id: currentFam.husb,
            person2Id: currentFam.wife,
            type: 'spouse',
            certainty: 'confirmed',
            createdAt: new Date().toISOString()
          });
        }
        currentFam.children.forEach(childId => {
          if (currentFam!.husb) {
            relationships.push({
              id: `rel-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              treeId,
              person1Id: currentFam!.husb,
              person2Id: childId,
              type: 'parent',
              certainty: 'confirmed',
              createdAt: new Date().toISOString()
            });
          }
          if (currentFam!.wife) {
            relationships.push({
              id: `rel-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              treeId,
              person1Id: currentFam!.wife,
              person2Id: childId,
              type: 'parent',
              certainty: 'confirmed',
              createdAt: new Date().toISOString()
            });
          }
        });
        currentFam = null;
      }

      if (value === 'INDI' || parts[2] === 'INDI') {
        const id = tagOrId.replace(/[@I]/g, '');
        currentIndi = { id: id || `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` };
      } else if (value === 'FAM' || parts[2] === 'FAM') {
        currentFam = { id: tagOrId.replace(/[@]/g, ''), children: [] };
      }
    } else if (currentIndi) {
      if (tagOrId === 'NAME') {
        const nameMatches = value.match(/(.*?)\/(.*?)\//);
        if (nameMatches) {
          currentIndi.firstName = nameMatches[1].trim();
          currentIndi.lastName = nameMatches[2].trim();
        } else {
          const names = value.split(' ');
          currentIndi.firstName = names[0] || '';
          currentIndi.lastName = names.slice(1).join(' ') || '';
        }
      } else if (tagOrId === 'SEX') {
        currentIndi.gender = value === 'M' ? 'M' : value === 'F' ? 'F' : 'other';
      } else if (tagOrId === 'BIRT') {
        lastTag = 'BIRT';
      } else if (tagOrId === 'DEAT') {
        lastTag = 'DEAT';
        currentIndi.isLiving = false;
      } else if (tagOrId === 'DATE') {
        if (lastTag === 'BIRT') currentIndi.birthDate = value;
        if (lastTag === 'DEAT') currentIndi.deathDate = value;
      } else if (tagOrId === 'PLAC') {
        if (lastTag === 'BIRT') currentIndi.birthPlace = value;
        if (lastTag === 'DEAT') currentIndi.deathPlace = value;
      } else if (tagOrId === 'OCCU') {
        currentIndi.profession = value;
      } else if (tagOrId === 'NATI') {
        currentIndi.nationality = value;
      } else if (tagOrId === 'NOTE') {
        currentIndi.bio = value;
      }
    } else if (currentFam) {
      if (tagOrId === 'HUSB') currentFam.husb = value.replace(/[@I]/g, '');
      if (tagOrId === 'WIFE') currentFam.wife = value.replace(/[@I]/g, '');
      if (tagOrId === 'CHIL') currentFam.children.push(value.replace(/[@I]/g, ''));
    }
  }

  // Push last indi if any
  if (currentIndi && currentIndi.id) {
    people.push({
      id: currentIndi.id,
      treeId,
      firstName: currentIndi.firstName || 'Sin Nombre',
      lastName: currentIndi.lastName || 'Sin Apellido',
      gender: currentIndi.gender || 'unknown',
      birthDate: currentIndi.birthDate || '',
      birthPlace: currentIndi.birthPlace || '',
      deathDate: currentIndi.deathDate || '',
      deathPlace: currentIndi.deathPlace || '',
      isLiving: currentIndi.isLiving !== undefined ? currentIndi.isLiving : (!currentIndi.deathDate),
      bio: currentIndi.bio || '',
      certainty: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return { people, relationships };
}
