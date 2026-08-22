import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Tree, Person, Relationship, FamilyEvent, HistoricalSource, MediaItem, SurnameStyle } from '../types';

export interface BookExportOptions {
  includeLivingDetails?: boolean;
  coverTitle?: string;
  coverSubtitle?: string;
  dedication?: string;
  fontTheme?: 'classic' | 'vintage' | 'modern';
}

/**
 * Generates an elegant, decorated PDF genealogy book
 */
export const generateGenealogyBookPDF = (
  tree: Tree,
  people: Person[],
  relationships: Relationship[],
  events: FamilyEvent[],
  sources: HistoricalSource[],
  surnameStyles?: Record<string, SurnameStyle>,
  options?: BookExportOptions
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw vintage decorative corner ornaments
  const drawPageBorder = (pageNum: number, totalPages?: number) => {
    // Outer border
    doc.setDrawColor(90, 90, 64); // Olive / Sepia tone #5A5A40
    doc.setLineWidth(0.8);
    doc.rect(margin - 8, margin - 8, contentWidth + 16, pageHeight - (margin - 8) * 2);

    // Inner thin border
    doc.setDrawColor(166, 93, 71); // Terracotta accent #A65D47
    doc.setLineWidth(0.3);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin - 5) * 2);

    // Header & Footer on internal pages (not cover)
    if (pageNum > 1) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(124, 121, 111);
      doc.text(`Crónica Familiar — ${tree.name}`, margin, margin - 10);
      doc.text(`Capítulo General`, pageWidth - margin, margin - 10, { align: 'right' });

      // Bottom footer
      doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - margin + 12, { align: 'center' });
      doc.setDrawColor(209, 206, 199);
      doc.line(margin, pageHeight - margin + 8, pageWidth - margin, pageHeight - margin + 8);
    }
  };

  // ================= PAGE 1: COVER (PORTADA DECORADA) =================
  drawPageBorder(1);

  // Decorative frame on cover
  doc.setFillColor(245, 242, 237); // #F5F2ED
  doc.roundedRect(margin + 5, margin + 25, contentWidth - 10, pageHeight - margin * 2 - 50, 4, 4, 'F');

  // Heraldic seal / Top ornament
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(67, 67, 49); // #434331
  doc.text('✦ ✦ ✦', pageWidth / 2, margin + 45, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('times', 'italic');
  doc.setTextColor(166, 93, 71); // #A65D47
  doc.text('MEMORIAS Y ÁRBOL GENEALÓGICO DE LA DINASTÍA', pageWidth / 2, margin + 60, { align: 'center' });

  // Main Tree Title
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.setTextColor(67, 67, 49);
  const titleLines = doc.splitTextToSize(options?.coverTitle || tree.name.toUpperCase(), contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, margin + 75, { align: 'center' });

  // Thin line ornament
  doc.setDrawColor(166, 93, 71);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 40, margin + 90, pageWidth / 2 + 40, margin + 90);

  // Subtitle / Dedication
  doc.setFontSize(11);
  doc.setFont('times', 'italic');
  doc.setTextColor(90, 90, 64);
  const subtitle = options?.coverSubtitle || tree.description || 'Compilación histórica, linajes familiares y archivo documental';
  const subLines = doc.splitTextToSize(subtitle, contentWidth - 30);
  doc.text(subLines, pageWidth / 2, margin + 105, { align: 'center' });

  // Summary Metrics Banner
  const surnamesList = Array.from(new Set(people.map(p => p.lastName).filter(Boolean)));
  const livingCount = people.filter(p => p.isLiving).length;
  const ancestorCount = people.length - livingCount;

  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(124, 121, 111);
  doc.text(`Total de Miembros Registrados: ${people.length}  •  Antepasados: ${ancestorCount}  •  Generaciones Vivas: ${livingCount}`, pageWidth / 2, margin + 145, { align: 'center' });
  doc.text(`Apellidos Principales: ${surnamesList.slice(0, 6).join(' • ')}`, pageWidth / 2, margin + 152, { align: 'center' });

  if (options?.dedication) {
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 64);
    const dedLines = doc.splitTextToSize(`«${options.dedication}»`, contentWidth - 40);
    doc.text(dedLines, pageWidth / 2, margin + 175, { align: 'center' });
  }

  // Cover footer info
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(124, 121, 111);
  const nowStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Edición Conmemorativa Impresa el ${nowStr}`, pageWidth / 2, pageHeight - margin - 15, { align: 'center' });
  doc.text(`Custodiado por: ${tree.ownerName || 'Familia'}`, pageWidth / 2, pageHeight - margin - 8, { align: 'center' });

  // ================= PAGE 2: ÍNDICE Y RAMAS =================
  doc.addPage();
  drawPageBorder(2);

  let y = margin + 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(67, 67, 49);
  doc.text('I. ÍNDICE DE LINAJES Y APELLIDOS', margin, y);
  y += 10;

  doc.setDrawColor(90, 90, 64);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 64);
  doc.text('Este libro reúne la totalidad de los registros genealógicos documentados:', margin, y);
  y += 8;

  // Surnames table / grid
  const surnameGroups: Record<string, Person[]> = {};
  people.forEach(p => {
    const key = p.lastName?.trim() || 'Sin Apellido';
    if (!surnameGroups[key]) surnameGroups[key] = [];
    surnameGroups[key].push(p);
  });

  Object.entries(surnameGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([surname, members]) => {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        drawPageBorder(doc.getNumberOfPages());
        y = margin + 10;
      }

      // Check surname style
      const sStyle = surnameStyles?.[surname.toLowerCase()];
      doc.setFillColor(245, 242, 237);
      doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(67, 67, 49);
      doc.text(`Rama ${surname.toUpperCase()}`, margin + 3, y + 5.5);

      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(166, 93, 71);
      doc.text(`${members.length} parientes registrados`, pageWidth - margin - 3, y + 5.5, { align: 'right' });
      y += 11;

      // Sample members in this branch
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(124, 121, 111);
      const names = members.map(m => `${m.firstName} (${m.birthDate?.slice(0, 4) || m.birthDateApprox || '?'})`).join(', ');
      const wrappedNames = doc.splitTextToSize(names, contentWidth - 6);
      doc.text(wrappedNames, margin + 4, y);
      y += wrappedNames.length * 4.5 + 4;
    });

  // ================= EXPEDIENTES BIOGRÁFICOS =================
  doc.addPage();
  drawPageBorder(doc.getNumberOfPages());
  y = margin + 5;

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(67, 67, 49);
  doc.text('II. EXPEDIENTES BIOGRÁFICOS DE MIEMBROS', margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  people.forEach((person, idx) => {
    // Check if we need a new page
    if (y > pageHeight - margin - 35) {
      doc.addPage();
      drawPageBorder(doc.getNumberOfPages());
      y = margin + 10;
    }

    const isPlaceholder = person.isPlaceholder || person.firstName.startsWith('[');
    const birthStr = person.birthDate ? person.birthDate : (person.birthDateApprox || 'Fecha no registrada');
    const birthPlaceStr = person.birthPlace ? `en ${person.birthPlace}` : '';
    const deathStr = person.isLiving ? 'Actualmente en vida' : (person.deathDate || person.deathDateApprox || 'Fallecido/a (fecha desc.)');
    const deathPlaceStr = (!person.isLiving && person.deathPlace) ? `en ${person.deathPlace}` : '';

    // Card background
    doc.setFillColor(isPlaceholder ? 250 : 255, 250, 245);
    doc.setDrawColor(209, 206, 199);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

    // Name and header
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(67, 67, 49);
    doc.text(`${idx + 1}. ${person.firstName} ${person.lastName} ${person.maidenName ? `(n. ${person.maidenName})` : ''}`, margin + 4, y + 6);

    // Certainty / Living tag
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(166, 93, 71);
    const tag = isPlaceholder ? 'Nodo Puente' : person.isLiving ? '• Persona Viva' : `• Certeza: ${person.certainty}`;
    doc.text(tag, pageWidth - margin - 4, y + 6, { align: 'right' });

    // Dates line
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 64);
    doc.text(`Nacimiento: ${birthStr} ${birthPlaceStr}`, margin + 4, y + 12);
    doc.text(`Defunción / Estado: ${deathStr} ${deathPlaceStr}`, margin + 4, y + 17);

    // Profession / Bio snippet
    if (person.profession || person.bio) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(124, 121, 111);
      const bioText = person.profession ? `Profesión: ${person.profession}. ${person.bio || ''}` : person.bio || '';
      const wrapped = doc.splitTextToSize(bioText, contentWidth - 8);
      doc.text(wrapped.slice(0, 1), margin + 4, y + 22);
    }

    y += 30;
  });

  // ================= CRÓNICA Y EVENTOS =================
  if (events.length > 0) {
    doc.addPage();
    drawPageBorder(doc.getNumberOfPages());
    y = margin + 5;

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(67, 67, 49);
    doc.text('III. CRÓNICA Y LÍNEA DE TIEMPO HISTÓRICA', margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const sortedEvents = [...events].sort((a, b) => (a.date || a.dateApprox || '').localeCompare(b.date || b.dateApprox || ''));

    sortedEvents.forEach(ev => {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        drawPageBorder(doc.getNumberOfPages());
        y = margin + 10;
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(166, 93, 71);
      doc.text(`✦ ${ev.date || ev.dateApprox || 'S/F'}: ${ev.title}`, margin + 2, y);

      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 64);
      if (ev.place) {
        doc.text(`Lugar: ${ev.place}`, margin + 8, y + 4.5);
      }
      if (ev.description) {
        const descLines = doc.splitTextToSize(ev.description, contentWidth - 12);
        doc.text(descLines, margin + 8, y + (ev.place ? 9 : 5));
        y += descLines.length * 4;
      }
      y += 10;
    });
  }

  // ================= FUENTES DOCUMENTALES =================
  if (sources.length > 0) {
    doc.addPage();
    drawPageBorder(doc.getNumberOfPages());
    y = margin + 5;

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(67, 67, 49);
    doc.text('IV. ARCHIVO DOCUMENTAL Y FUENTES', margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    sources.forEach((src, sIdx) => {
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        drawPageBorder(doc.getNumberOfPages());
        y = margin + 10;
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(67, 67, 49);
      doc.text(`[${sIdx + 1}] ${src.title} (${src.type})`, margin + 2, y);

      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(124, 121, 111);
      if (src.repository || src.citation) {
        doc.text(`Repositorio / Cita: ${src.repository || ''} ${src.citation || ''}`, margin + 6, y + 4.5);
      }
      y += 10;
    });
  }

  return doc;
};

/**
 * Generates a richly styled multi-sheet Excel (.xlsx) workbook
 */
export const generateGenealogyExcelBook = (
  tree: Tree,
  people: Person[],
  relationships: Relationship[],
  events: FamilyEvent[],
  sources: HistoricalSource[]
) => {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Resumen del Libro
  const summaryData = [
    ['LIBRO GENEALÓGICO FAMILIAR — RESUMEN Y METADATOS'],
    ['Título del Árbol:', tree.name],
    ['Descripción:', tree.description || ''],
    ['Custodio / Autor:', tree.ownerName || 'Familia'],
    ['Fecha de Generación:', new Date().toLocaleString('es-ES')],
    ['Total de Personas:', people.length],
    ['Total de Vínculos Familiares:', relationships.length],
    ['Total de Acontecimientos Históricos:', events.length],
    ['Total de Fuentes Documentales:', sources.length],
    [],
    ['DISTRIBUCIÓN POR APELLIDOS'],
    ['Apellido', 'Cantidad de Miembros']
  ];

  const surnameCounts: Record<string, number> = {};
  people.forEach(p => {
    const s = p.lastName?.trim() || 'Sin Apellido';
    surnameCounts[s] = (surnameCounts[s] || 0) + 1;
  });

  Object.entries(surnameCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([surname, count]) => {
      summaryData.push([surname, count]);
    });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, '📖 Libro Genealógico');

  // SHEET 2: Registro de Personas
  const peopleHeaders = [
    'ID', 'Nombre', 'Segundo Nombre', 'Apellido', 'Apellido de Soltera',
    'Sexo', 'Fecha Nacimiento', 'Nacimiento Aprox', 'Lugar Nacimiento',
    'Fecha Defunción', 'Defunción Aprox', 'Lugar Defunción', '¿En Vida?',
    'Profesión', 'Nacionalidad', 'Certeza', 'Es Tarjeta Puente', 'Biografía', 'Notas'
  ];

  const peopleRows = people.map(p => [
    p.id,
    p.firstName,
    p.middleName || '',
    p.lastName,
    p.maidenName || '',
    p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : 'Desconocido',
    p.birthDate || '',
    p.birthDateApprox || '',
    p.birthPlace || '',
    p.deathDate || '',
    p.deathDateApprox || '',
    p.deathPlace || '',
    p.isLiving ? 'SÍ' : 'NO',
    p.profession || '',
    p.nationality || '',
    p.certainty,
    p.isPlaceholder ? 'SÍ (Tarjeta Vacía Puente)' : 'NO',
    p.bio || '',
    p.notes || ''
  ]);

  const wsPeople = XLSX.utils.aoa_to_sheet([peopleHeaders, ...peopleRows]);
  XLSX.utils.book_append_sheet(wb, wsPeople, '👥 Personas y Biografías');

  // SHEET 3: Parentescos
  const relHeaders = [
    'ID Relación', 'Persona 1 (Origen)', 'Vínculo / Tipo', 'Persona 2 (Destino)',
    'Fecha Inicio', 'Certeza', 'Notas'
  ];

  const relRows = relationships.map(r => {
    const p1 = people.find(p => p.id === r.person1Id);
    const p2 = people.find(p => p.id === r.person2Id);
    return [
      r.id,
      p1 ? `${p1.firstName} ${p1.lastName}` : r.person1Id,
      r.type === 'parent' ? 'Padre/Madre de' : r.type === 'spouse' ? 'Cónyuge de' : r.type === 'child' ? 'Hijo/a de' : r.type,
      p2 ? `${p2.firstName} ${p2.lastName}` : r.person2Id,
      r.startDate || '',
      r.certainty || 'confirmed',
      r.notes || ''
    ];
  });

  const wsRels = XLSX.utils.aoa_to_sheet([relHeaders, ...relRows]);
  XLSX.utils.book_append_sheet(wb, wsRels, '🔗 Vínculos y Parentescos');

  // SHEET 4: Cronología y Eventos
  if (events.length > 0) {
    const eventHeaders = ['ID Evento', 'Fecha', 'Acontecimiento', 'Tipo', 'Lugar', 'Personas Involucradas', 'Descripción'];
    const eventRows = events.map(e => {
      const involved = e.personIds.map(pid => {
        const p = people.find(item => item.id === pid);
        return p ? `${p.firstName} ${p.lastName}` : pid;
      }).join(', ');

      return [
        e.id,
        e.date || e.dateApprox || '',
        e.title,
        e.type,
        e.place || '',
        involved,
        e.description || ''
      ];
    });

    const wsEvents = XLSX.utils.aoa_to_sheet([eventHeaders, ...eventRows]);
    XLSX.utils.book_append_sheet(wb, wsEvents, '📅 Línea de Tiempo');
  }

  // SHEET 5: Fuentes
  if (sources.length > 0) {
    const sourceHeaders = ['ID Fuente', 'Título / Documento', 'Tipo', 'Repositorio', 'Cita Bibliográfica', 'Confianza', 'Notas'];
    const sourceRows = sources.map(s => [
      s.id,
      s.title,
      s.type,
      s.repository || '',
      s.citation || '',
      s.confidence,
      s.notes || ''
    ]);

    const wsSources = XLSX.utils.aoa_to_sheet([sourceHeaders, ...sourceRows]);
    XLSX.utils.book_append_sheet(wb, wsSources, '📜 Fuentes y Archivos');
  }

  return wb;
};

/**
 * Formats a fully decorated JSON book export
 */
export const generateDecoratedJsonBook = (
  tree: Tree,
  people: Person[],
  relationships: Relationship[],
  events: FamilyEvent[],
  media: MediaItem[],
  sources: HistoricalSource[],
  surnameStyles?: Record<string, SurnameStyle>
): string => {
  const decoratedDocument = {
    _format: 'GenealogyBook_v2',
    _generatedAt: new Date().toISOString(),
    bookMetadata: {
      title: tree.name,
      subtitle: tree.description || 'Crónica Dinástica y Árbol Genealógico Familiar',
      custodian: tree.ownerName || 'Familia',
      stats: {
        totalPeople: people.length,
        totalRelationships: relationships.length,
        totalEvents: events.length,
        totalSources: sources.length,
        totalMedia: media.length
      }
    },
    settings: {
      ...tree.settings,
      surnameStyles: surnameStyles || tree.settings.surnameStyles || {}
    },
    chapters: {
      chapter1_PeopleAndAncestors: people,
      chapter2_RelationshipsAndKinship: relationships,
      chapter3_ChronologicalTimeline: events,
      chapter4_MediaArchive: media,
      chapter5_HistoricalSources: sources
    }
  };

  return JSON.stringify(decoratedDocument, null, 2);
};
