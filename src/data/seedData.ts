import { Tree, Person, Relationship, FamilyEvent, MediaItem, HistoricalSource, ChangeLog, AccessRequest, Proposal, Comment } from '../types';

export const SEED_TREE: Tree = {
  id: 'cantero-family-tree',
  name: 'Familia Cantero & Gómez',
  description: 'Historia y genealogía de la familia Cantero y Gómez desde su llegada desde España e Italia en 1850 hasta la actualidad.',
  ownerId: 'user-default-owner',
  ownerName: 'Juan Carlos Cantero',
  ownerEmail: 'juan.cantero@historiafamiliar.com',
  coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  visibility: 'public',
  slug: 'cantero-gomez',
  settings: {
    hideLivingDetails: true,
    livingAgeThreshold: 100,
    defaultRoleForInvites: 'collaborator',
    allowPublicRequests: true,
    requireProposalApproval: true,
    showCommentsToPublic: true
  },
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-08-21T18:30:00Z'
};

export const SEED_SOURCES: HistoricalSource[] = [
  {
    id: 'src-1',
    treeId: 'cantero-family-tree',
    title: 'Acta de Bautismo Parroquia San Miguel Arcángel',
    type: 'church',
    repository: 'Archivo Histórico de la Diócesis de Concordia, Libro IV, Folio 128',
    citation: 'Partida nº 342, Bautismos de 1888.',
    confidence: 'confirmed',
    notes: 'Documento original firmado por el presbítero Mateo Rossi.',
    createdAt: '2026-01-11T12:00:00Z'
  },
  {
    id: 'src-2',
    treeId: 'cantero-family-tree',
    title: 'Registro de Inmigración Puerto de Buenos Aires',
    type: 'public_archive',
    repository: 'Centro de Estudios Migratorios Latinoamericanos (CEMLA)',
    citation: 'Vapor "Regina Margherita", arribo 14 de Noviembre de 1882.',
    confidence: 'confirmed',
    notes: 'Listado de pasajeros procedentes del puerto de Génova con destino a Entre Ríos.',
    createdAt: '2026-01-11T12:30:00Z'
  },
  {
    id: 'src-3',
    treeId: 'cantero-family-tree',
    title: 'Acta Notarial de Compra de Finca "La Esperanza"',
    type: 'civil_registry',
    repository: 'Registro Notarial de Concordia, Tomo II, Escritura 89',
    citation: 'Escritura de dominio parcelario año 1904.',
    confidence: 'confirmed',
    notes: 'Testimonio notarial de la adquisición de tierras agrícolas.',
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'src-4',
    treeId: 'cantero-family-tree',
    title: 'Testimonio Oral de Doña Elena Gómez de Cantero',
    type: 'oral_testimony',
    repository: 'Grabación de audio en archivo privado familiar',
    citation: 'Entrevista grabada el 15 de Octubre de 1978 en Concordia.',
    confidence: 'probable',
    notes: 'Relata los viajes familiares en carreta hacia la costa del Río Uruguay.',
    createdAt: '2026-01-12T14:20:00Z'
  }
];

export const SEED_PEOPLE: Person[] = [
  // Generación 1 (Bisabuelos)
  {
    id: 'p-1',
    treeId: 'cantero-family-tree',
    firstName: 'Mateo',
    lastName: 'Cantero',
    gender: 'M',
    birthDate: '1852-04-14',
    birthDateApprox: '14 de Abril de 1852',
    birthPlace: 'Oviedo, Asturias, España',
    birthCoordinates: { lat: 43.3619, lng: -5.8494 },
    deathDate: '1928-11-03',
    deathDateApprox: '3 de Noviembre de 1928',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    deathCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: false,
    bio: 'Patriarca de la rama Cantero en el Río de la Plata. Agricultor y herrero asturiano que emigró hacia Argentina en busca de nuevas oportunidades agrícolas.',
    profession: 'Herrero y Productor Rural',
    nationality: 'Española / Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    aliases: ['El Abuelo Asturiano'],
    notes: 'Fundador de los talleres de herrería en el puerto de Concordia.',
    tags: ['#inmigracion', '#asturias', '#fundador', '#concordia'],
    certainty: 'confirmed',
    sourceIds: ['src-2', 'src-3'],
    generation: 1,
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-2',
    treeId: 'cantero-family-tree',
    firstName: 'Rosa',
    middleName: 'Isabel',
    lastName: 'Gómez',
    maidenName: 'Rossi',
    gender: 'F',
    birthDate: '1858-09-22',
    birthDateApprox: '≈ 1858',
    birthPlace: 'Génova, Liguria, Italia',
    birthCoordinates: { lat: 44.4056, lng: 8.9463 },
    deathDate: '1934-06-15',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    deathCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: false,
    bio: 'Nacida en la costa de Liguria, llegó con sus padres en 1882. Maestra comunitaria y tejedora devota.',
    profession: 'Costurera y Educadora',
    nationality: 'Italiana / Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    aliases: ['Rosita'],
    tags: ['#italia', '#liguria', '#boda1885'],
    certainty: 'confirmed',
    sourceIds: ['src-1', 'src-2'],
    generation: 1,
    createdAt: '2026-01-10T11:15:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // Generación 2 (Abuelos)
  {
    id: 'p-3',
    treeId: 'cantero-family-tree',
    firstName: 'Juan',
    middleName: 'Bautista',
    lastName: 'Cantero',
    gender: 'M',
    birthDate: '1888-05-18',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    birthCoordinates: { lat: -31.393, lng: -58.0209 },
    deathDate: '1962-09-04',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    deathCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: false,
    bio: 'Pionero de la citricultura en la región del Río Uruguay. Promotor de la primera cooperativa agraria de Concordia.',
    profession: 'Agrónomo y Dirigente Cooperativo',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    aliases: ['Don Juan'],
    tags: ['#citricultura', '#concordia', '#cooperativa'],
    certainty: 'confirmed',
    sourceIds: ['src-1', 'src-3'],
    generation: 2,
    createdAt: '2026-01-10T11:30:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-4',
    treeId: 'cantero-family-tree',
    firstName: 'María',
    middleName: 'Elena',
    lastName: 'Gómez',
    maidenName: 'Gómez de la Vega',
    gender: 'F',
    birthDate: '1894-11-12',
    birthPlace: 'Paraná, Entre Ríos, Argentina',
    birthCoordinates: { lat: -31.732, lng: -60.5298 },
    deathDate: '1979-01-20',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    deathCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: false,
    bio: 'Pianista y cronista de la vida comunitaria. Escribió numerosas cartas y memorias que permitieron reconstruir el archivo familiar.',
    profession: 'Pianista y Archivista Familiar',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    aliases: ['Doña Elena', 'La Abuela Pianista'],
    tags: ['#musica', '#cronista', '#cartas'],
    certainty: 'confirmed',
    sourceIds: ['src-4'],
    generation: 2,
    createdAt: '2026-01-10T11:45:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-5',
    treeId: 'cantero-family-tree',
    firstName: 'Esteban',
    lastName: 'Cantero',
    gender: 'M',
    birthDate: '1891-08-03',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    deathDate: '1918-10-14',
    deathPlace: 'Buenos Aires, Argentina',
    deathCoordinates: { lat: -34.6037, lng: -58.3816 },
    isLiving: false,
    bio: 'Hermano menor de Juan Bautista. Estudió medicina en la Universidad de Buenos Aires.',
    profession: 'Estudiante de Medicina',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tags: ['#uba', '#medicina'],
    certainty: 'probable',
    generation: 2,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // Generación 3 (Padres / Tíos)
  {
    id: 'p-6',
    treeId: 'cantero-family-tree',
    firstName: 'Carlos',
    middleName: 'Alberto',
    lastName: 'Cantero',
    gender: 'M',
    birthDate: '1924-03-10',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    birthCoordinates: { lat: -31.393, lng: -58.0209 },
    deathDate: '1998-12-01',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    deathCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: false,
    bio: 'Ingeniero civil e historiador aficionado. Coordinó obras de infraestructura hidráulica en Entre Ríos.',
    profession: 'Ingeniero Civil',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    aliases: ['Carlitos'],
    tags: ['#ingenieria', '#concordia', '#1924'],
    certainty: 'confirmed',
    sourceIds: ['src-3'],
    generation: 3,
    createdAt: '2026-01-10T12:15:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-7',
    treeId: 'cantero-family-tree',
    firstName: 'Ana',
    middleName: 'Beatriz',
    lastName: 'Pérez',
    maidenName: 'Pérez Silva',
    gender: 'F',
    birthDate: '1929-07-28',
    birthPlace: 'Montevideo, Uruguay',
    birthCoordinates: { lat: -34.9011, lng: -56.1645 },
    deathDate: '2015-05-19',
    deathPlace: 'Concordia, Entre Ríos, Argentina',
    isLiving: false,
    bio: 'Nacida en Montevideo, conoció a Carlos durante un congreso de arquitectura e historia rioplatense. Profesora de literatura.',
    profession: 'Profesora de Literatura y Letras',
    nationality: 'Uruguaya / Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    aliases: ['Anita'],
    tags: ['#uruguay', '#literatura'],
    certainty: 'confirmed',
    generation: 3,
    createdAt: '2026-01-10T12:30:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-8',
    treeId: 'cantero-family-tree',
    firstName: 'Lucía',
    lastName: 'Cantero',
    gender: 'F',
    birthDate: '1927-10-05',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    deathDate: '2009-03-12',
    deathPlace: 'Rosario, Santa Fe, Argentina',
    deathCoordinates: { lat: -32.9468, lng: -60.6393 },
    isLiving: false,
    bio: 'Bióloga y docente en la Universidad Nacional de Rosario.',
    profession: 'Bióloga e Investigadora',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    tags: ['#rosario', '#biologia'],
    certainty: 'confirmed',
    generation: 3,
    createdAt: '2026-01-10T12:45:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // Generación 4 (Generación Actual / Vivos)
  {
    id: 'p-9',
    treeId: 'cantero-family-tree',
    firstName: 'Juan',
    middleName: 'Carlos',
    lastName: 'Cantero',
    gender: 'M',
    birthDate: '1960-04-12',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    birthCoordinates: { lat: -31.393, lng: -58.0209 },
    isLiving: true,
    bio: 'Administrador del archivo familiar y preservador de las memorias históricas de los Cantero y Gómez.',
    profession: 'Arquitecto y Restaurador Patrimonial',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    aliases: ['Juanca'],
    tags: ['#patrimonio', '#administrador'],
    certainty: 'confirmed',
    generation: 4,
    createdAt: '2026-01-10T13:00:00Z',
    updatedAt: '2026-08-21T18:00:00Z'
  },
  {
    id: 'p-10',
    treeId: 'cantero-family-tree',
    firstName: 'Valeria',
    lastName: 'Cantero',
    gender: 'F',
    birthDate: '1965-08-20',
    birthPlace: 'Concordia, Entre Ríos, Argentina',
    isLiving: true,
    bio: 'Fotógrafa y diseñadora editorial. Ha digitalizado el archivo fotográfico de la familia.',
    profession: 'Fotógrafa Documentalista',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
    aliases: ['Vale'],
    tags: ['#fotografia', '#digitalizacion'],
    certainty: 'confirmed',
    generation: 4,
    createdAt: '2026-01-10T13:15:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'p-11',
    treeId: 'cantero-family-tree',
    firstName: 'Martina',
    lastName: 'Cantero',
    gender: 'F',
    birthDate: '1995-11-03',
    birthPlace: 'Buenos Aires, Argentina',
    isLiving: true,
    bio: 'Desarrolladora de software e investigadora genealógica digital.',
    profession: 'Ingeniera en Software',
    nationality: 'Argentina',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    tags: ['#tech', '#nueva_generacion'],
    certainty: 'confirmed',
    generation: 5,
    createdAt: '2026-01-10T13:30:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  }
];

export const SEED_RELATIONSHIPS: Relationship[] = [
  // Generación 1: Pareja
  {
    id: 'rel-1',
    treeId: 'cantero-family-tree',
    person1Id: 'p-1', // Mateo
    person2Id: 'p-2', // Rosa
    type: 'spouse',
    startDate: '1885-05-10',
    notes: 'Matrimonio celebrado en la Capilla San Antonio de Padua.',
    certainty: 'confirmed',
    sourceIds: ['src-1'],
    createdAt: '2026-01-10T14:00:00Z'
  },
  // Padres Mateo y Rosa -> Hijos
  {
    id: 'rel-2',
    treeId: 'cantero-family-tree',
    person1Id: 'p-1', // Mateo Padre
    person2Id: 'p-3', // Juan Bautista Hijo
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:05:00Z'
  },
  {
    id: 'rel-3',
    treeId: 'cantero-family-tree',
    person1Id: 'p-2', // Rosa Madre
    person2Id: 'p-3', // Juan Bautista Hijo
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:06:00Z'
  },
  {
    id: 'rel-4',
    treeId: 'cantero-family-tree',
    person1Id: 'p-1', // Mateo Padre
    person2Id: 'p-5', // Esteban Hijo
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:07:00Z'
  },
  {
    id: 'rel-5',
    treeId: 'cantero-family-tree',
    person1Id: 'p-2', // Rosa Madre
    person2Id: 'p-5', // Esteban Hijo
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:08:00Z'
  },

  // Generación 2: Pareja Juan Bautista & María Elena
  {
    id: 'rel-6',
    treeId: 'cantero-family-tree',
    person1Id: 'p-3', // Juan
    person2Id: 'p-4', // María Elena
    type: 'spouse',
    startDate: '1920-10-18',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:10:00Z'
  },
  // Hermanos Juan y Esteban
  {
    id: 'rel-7',
    treeId: 'cantero-family-tree',
    person1Id: 'p-3',
    person2Id: 'p-5',
    type: 'sibling',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:11:00Z'
  },
  // Padres Juan y Elena -> Hijos Carlos y Lucía
  {
    id: 'rel-8',
    treeId: 'cantero-family-tree',
    person1Id: 'p-3',
    person2Id: 'p-6', // Carlos
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:12:00Z'
  },
  {
    id: 'rel-9',
    treeId: 'cantero-family-tree',
    person1Id: 'p-4',
    person2Id: 'p-6', // Carlos
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:13:00Z'
  },
  {
    id: 'rel-10',
    treeId: 'cantero-family-tree',
    person1Id: 'p-3',
    person2Id: 'p-8', // Lucía
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:14:00Z'
  },
  {
    id: 'rel-11',
    treeId: 'cantero-family-tree',
    person1Id: 'p-4',
    person2Id: 'p-8', // Lucía
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:15:00Z'
  },

  // Generación 3: Pareja Carlos & Ana Beatriz
  {
    id: 'rel-12',
    treeId: 'cantero-family-tree',
    person1Id: 'p-6',
    person2Id: 'p-7',
    type: 'spouse',
    startDate: '1956-02-14',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:20:00Z'
  },
  // Carlos y Ana -> Juan Carlos y Valeria
  {
    id: 'rel-13',
    treeId: 'cantero-family-tree',
    person1Id: 'p-6',
    person2Id: 'p-9', // Juan Carlos
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:21:00Z'
  },
  {
    id: 'rel-14',
    treeId: 'cantero-family-tree',
    person1Id: 'p-7',
    person2Id: 'p-9', // Juan Carlos
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:22:00Z'
  },
  {
    id: 'rel-15',
    treeId: 'cantero-family-tree',
    person1Id: 'p-6',
    person2Id: 'p-10', // Valeria
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:23:00Z'
  },
  {
    id: 'rel-16',
    treeId: 'cantero-family-tree',
    person1Id: 'p-7',
    person2Id: 'p-10', // Valeria
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:24:00Z'
  },

  // Juan Carlos -> Martina
  {
    id: 'rel-17',
    treeId: 'cantero-family-tree',
    person1Id: 'p-9',
    person2Id: 'p-11',
    type: 'parent',
    certainty: 'confirmed',
    createdAt: '2026-01-10T14:30:00Z'
  }
];

export const SEED_EVENTS: FamilyEvent[] = [
  {
    id: 'ev-1',
    treeId: 'cantero-family-tree',
    type: 'emigration',
    title: 'Partida desde el Puerto de Gijón rumbo a América',
    date: '1880-09-15',
    dateApprox: 'Septiembre de 1880',
    place: 'Gijón, Asturias, España',
    coordinates: { lat: 43.5322, lng: -5.6611 },
    description: 'Mateo Cantero emprende la travesía trasatlántica a bordo del bergantín "Santa María".',
    personIds: ['p-1'],
    sourceIds: ['src-2'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:00:00Z'
  },
  {
    id: 'ev-2',
    treeId: 'cantero-family-tree',
    type: 'immigration',
    title: 'Llegada de la familia Rossi al Puerto de Buenos Aires',
    date: '1882-11-14',
    place: 'Buenos Aires, Argentina',
    coordinates: { lat: -34.6037, lng: -58.3816 },
    description: 'Desembarco de Rosa Isabel Rossi y sus padres procedentes de Génova.',
    personIds: ['p-2'],
    sourceIds: ['src-2'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:10:00Z'
  },
  {
    id: 'ev-3',
    treeId: 'cantero-family-tree',
    type: 'marriage',
    title: 'Matrimonio Mateo Cantero y Rosa Isabel Rossi',
    date: '1885-05-10',
    place: 'Concordia, Entre Ríos, Argentina',
    coordinates: { lat: -31.393, lng: -58.0209 },
    description: 'Ceremonia religiosa y banquete en la finca comunitaria.',
    personIds: ['p-1', 'p-2'],
    sourceIds: ['src-1'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:20:00Z'
  },
  {
    id: 'ev-4',
    treeId: 'cantero-family-tree',
    type: 'property',
    title: 'Adquisición de la Finca y Huerto "La Esperanza"',
    date: '1904-03-22',
    place: 'Colonia Ayuí, Concordia, Entre Ríos',
    coordinates: { lat: -31.258, lng: -57.989 },
    description: 'Firma de la escritura de 40 hectáreas para la producción citrícola familiar.',
    personIds: ['p-1', 'p-3'],
    sourceIds: ['src-3'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:30:00Z'
  },
  {
    id: 'ev-5',
    treeId: 'cantero-family-tree',
    type: 'education',
    title: 'Graduación de Carlos Cantero como Ingeniero Civil',
    date: '1948-12-18',
    place: 'Santa Fe, Argentina',
    coordinates: { lat: -31.6333, lng: -60.7000 },
    description: 'Diploma de honor en la Universidad Nacional del Litoral.',
    personIds: ['p-6'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:40:00Z'
  },
  {
    id: 'ev-6',
    treeId: 'cantero-family-tree',
    type: 'marriage',
    title: 'Enlace matrimonial Carlos Cantero y Ana Beatriz Pérez',
    date: '1956-02-14',
    place: 'Montevideo, Uruguay',
    coordinates: { lat: -34.9011, lng: -56.1645 },
    description: 'Boda en la Iglesia Matriz de Montevideo con familiares de ambas márgenes del Río de la Plata.',
    personIds: ['p-6', 'p-7'],
    certainty: 'confirmed',
    createdAt: '2026-01-11T15:50:00Z'
  }
];

export const SEED_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    treeId: 'cantero-family-tree',
    title: 'Retrato de Mateo Cantero en su taller de herrería',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    fileSize: 1450000,
    mimeType: 'image/jpeg',
    uploadedBy: 'user-default-owner',
    uploadedByName: 'Juan Carlos Cantero',
    createdAt: '2026-01-12T10:00:00Z',
    relatedPersonIds: ['p-1'],
    description: 'Fotografía en placa de plata tomada en 1912 en Concordia.',
    historicalDate: '1912',
    historicalPlace: 'Concordia, Entre Ríos',
    visibility: 'public',
    tags: ['#retrato', '#herrería', '#antiguo', '#1912']
  },
  {
    id: 'med-2',
    treeId: 'cantero-family-tree',
    title: 'Boda de Juan Bautista Cantero y María Elena Gómez',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    fileSize: 2200000,
    mimeType: 'image/jpeg',
    uploadedBy: 'user-default-owner',
    uploadedByName: 'Juan Carlos Cantero',
    createdAt: '2026-01-12T10:30:00Z',
    relatedPersonIds: ['p-3', 'p-4'],
    description: 'Fotografía original coloreada manualmente de la ceremonia en 1920.',
    historicalDate: '1920-10-18',
    historicalPlace: 'Paraná, Entre Ríos',
    visibility: 'public',
    tags: ['#boda', '#1920', '#abuelos', '#familia']
  },
  {
    id: 'med-3',
    treeId: 'cantero-family-tree',
    title: 'Partida Notarial de Tierras Finca La Esperanza',
    type: 'certificate',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    fileSize: 3100000,
    mimeType: 'image/jpeg',
    uploadedBy: 'user-default-owner',
    uploadedByName: 'Juan Carlos Cantero',
    createdAt: '2026-01-12T11:00:00Z',
    relatedPersonIds: ['p-1', 'p-3'],
    sourceId: 'src-3',
    description: 'Copia escaneada en alta definición del acta de propiedad original.',
    historicalDate: '1904-03-22',
    historicalPlace: 'Concordia, Entre Ríos',
    visibility: 'public',
    tags: ['#documento', '#escritura', '#1904', '#tierras']
  },
  {
    id: 'med-4',
    treeId: 'cantero-family-tree',
    title: 'Carta manuscrita de Doña Elena Gómez describiendo la cosecha',
    type: 'letter',
    url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
    fileSize: 1800000,
    mimeType: 'image/jpeg',
    uploadedBy: 'user-default-owner',
    uploadedByName: 'Juan Carlos Cantero',
    createdAt: '2026-01-12T11:30:00Z',
    relatedPersonIds: ['p-4'],
    sourceId: 'src-4',
    description: 'Carta enviada a sus parientes en Montevideo narrando las primaveras en el naranjal.',
    historicalDate: '1938-10-02',
    historicalPlace: 'Concordia, Entre Ríos',
    visibility: 'public',
    tags: ['#carta', '#manuscrito', '#1938', '#recuerdos']
  }
];

export const SEED_REQUESTS: AccessRequest[] = [
  {
    id: 'req-1',
    treeId: 'cantero-family-tree',
    userId: 'user-visitor-ana',
    userName: 'Ana María Cantero Rossi',
    userEmail: 'anamaria.rossi@email.com',
    userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    message: 'Hola Juan, soy nieta de Esteban Cantero (hermano de tu abuelo Juan Bautista). Tengo fotografías y el diario de estudios de mi abuelo que me gustaría aportar al árbol.',
    familyRelation: 'Sobrina nieta de Juan Bautista Cantero',
    contributionIntent: 'Aportar fotos históricas y cartas de Esteban Cantero de su estancia en Buenos Aires.',
    requestedRole: 'editor',
    status: 'pending',
    createdAt: '2026-08-20T14:00:00Z'
  }
];

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    treeId: 'cantero-family-tree',
    targetType: 'person',
    targetId: 'p-2',
    targetName: 'Rosa Isabel Gómez (Rossi)',
    fieldChanged: 'Fecha de nacimiento',
    currentValue: '1858-09-22',
    proposedValue: '1857-09-22',
    proposedBy: 'user-visitor-ana',
    proposedByName: 'Ana María Cantero Rossi',
    sourceNote: 'Acta parroquial de la Diócesis de Génova fechada 22 de Septiembre de 1857.',
    reason: 'En el acta de bautismo de Génova consta el año 1857 y no 1858.',
    status: 'pending',
    createdAt: '2026-08-21T10:15:00Z'
  }
];

export const SEED_CHANGES: ChangeLog[] = [
  {
    id: 'chg-1',
    treeId: 'cantero-family-tree',
    entityType: 'person',
    entityId: 'p-1',
    entityName: 'Mateo Cantero',
    action: 'create',
    summary: 'Registró a Mateo Cantero (1852 - 1928) con fuentes documentales.',
    userId: 'user-default-owner',
    userName: 'Juan Carlos Cantero',
    timestamp: '2026-01-10T11:00:00Z'
  },
  {
    id: 'chg-2',
    treeId: 'cantero-family-tree',
    entityType: 'media',
    entityId: 'med-1',
    entityName: 'Retrato de Mateo Cantero',
    action: 'create',
    summary: 'Subió fotografía histórica del taller de herrería (1912).',
    userId: 'user-default-owner',
    userName: 'Juan Carlos Cantero',
    timestamp: '2026-01-12T10:00:00Z'
  },
  {
    id: 'chg-3',
    treeId: 'cantero-family-tree',
    entityType: 'relationship',
    entityId: 'rel-1',
    entityName: 'Matrimonio Cantero - Rossi',
    action: 'create',
    summary: 'Estableció relación de cónyuge entre Mateo Cantero y Rosa Isabel Rossi.',
    userId: 'user-default-owner',
    userName: 'Juan Carlos Cantero',
    timestamp: '2026-01-10T14:00:00Z'
  }
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    treeId: 'cantero-family-tree',
    targetType: 'media',
    targetId: 'med-2',
    userId: 'user-member-vale',
    userName: 'Valeria Cantero',
    userPhoto: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80',
    content: '¡Qué nitidez! El vestido de encaje de la abuela Elena fue confeccionado por su madre con telas traídas de Italia.',
    createdAt: '2026-01-15T16:20:00Z'
  },
  {
    id: 'com-2',
    treeId: 'cantero-family-tree',
    targetType: 'person',
    targetId: 'p-1',
    userId: 'user-default-owner',
    userName: 'Juan Carlos Cantero',
    userPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    content: 'Conservamos todavía en la casa familiar el yunque de hierro con el sello de Gijón grabado en 1878.',
    createdAt: '2026-01-16T18:40:00Z'
  }
];
