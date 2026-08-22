/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilySummary, PermissionGrant, PermissionRequest, FamilyConnection, LobbyAuditLog, FamilyInvitation } from '../types/familyLobby';

export const INITIAL_DISCOVERABLE_FAMILIES: FamilySummary[] = [
  {
    id: 'fam-cantero-er',
    name: 'Familia Cantero — Entre Ríos',
    description: 'Reconstrucción genealógica de la rama Cantero establecida en Concepción del Uruguay, Gualeguaychú y Colón desde mediados del siglo XIX.',
    ownerId: 'usr-francisco-c',
    ownerName: 'Francisco Cantero',
    ownerEmail: 'francisco.cantero@genealogia.org',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    visibility: 'public',
    createdAt: '2023-03-15T10:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['Cantero', 'Pérez', 'González', 'Martínez', 'Benítez', 'Alarcón'],
    country: 'Argentina',
    region: 'Entre Ríos',
    approximateOrigin: 'Concepción del Uruguay & Gualeguaychú, Entre Ríos (c. 1845)',
    generationsCount: 7,
    peopleCount: 124,
    photosCount: 86,
    documentsCount: 24,
    branchesCount: 3,
    allowPublicRequests: true,
    isVerifiedOrigin: true,
    branches: [
      {
        id: 'branch-cantero-main',
        name: 'Rama Cantero (Principal - Costa del Uruguay)',
        rootPersonName: 'Bartolomé Cantero y Alarcón (1820-1894)',
        generationsCount: 7,
        membersCount: 78,
        surnames: ['Cantero', 'Alarcón', 'Benítez'],
        description: 'Línea directa de artesanos fluviales y comerciantes asentados en Entre Ríos.'
      },
      {
        id: 'branch-perez-er',
        name: 'Rama Pérez (Materna - Gualeguaychú)',
        rootPersonName: 'Lorenzo Pérez y Domínguez (1838-1912)',
        generationsCount: 5,
        membersCount: 32,
        surnames: ['Pérez', 'Domínguez', 'Martínez'],
        description: 'Descendientes de agricultores e inmigrantes de la zona rural del Gualeguaychú.'
      },
      {
        id: 'branch-gonzalez-er',
        name: 'Rama González (Entre Ríos Sur)',
        rootPersonName: 'Esteban González (1852-1928)',
        generationsCount: 4,
        membersCount: 14,
        surnames: ['González', 'Cantero'],
        description: 'Rama conectada por el matrimonio de 1888 en Colón.'
      }
    ]
  },
  {
    id: 'fam-cantero-sf',
    name: 'Familia Cantero — Santa Fe',
    description: 'Registro histórico y familiar de los Cantero radicados en Rosario, Esperanza y Rafaela con nexos con la industria ferroviaria y agrícola.',
    ownerId: 'usr-mateo-c',
    ownerName: 'Mateo Cantero',
    ownerEmail: 'mateo.cantero@santafe.gov.ar',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    visibility: 'discoverable',
    createdAt: '2024-01-10T12:00:00.000Z',
    updatedAt: '2026-08-18T09:15:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['Cantero', 'Rossi', 'Ferreyra', 'Bianchi', 'Sosa'],
    country: 'Argentina',
    region: 'Santa Fe',
    approximateOrigin: 'Rosario y Rafaela, Santa Fe (c. 1872)',
    generationsCount: 5,
    peopleCount: 43,
    photosCount: 28,
    documentsCount: 9,
    branchesCount: 2,
    allowPublicRequests: true,
    isVerifiedOrigin: false,
    branches: [
      {
        id: 'branch-cantero-rossi',
        name: 'Rama Cantero-Rossi (Rosario)',
        rootPersonName: 'Ignacio Cantero (1868-1941)',
        generationsCount: 5,
        membersCount: 28,
        surnames: ['Cantero', 'Rossi', 'Bianchi'],
        description: 'Línea de maquinistas y fundidores de los talleres de Rosario.'
      },
      {
        id: 'branch-ferreyra-sf',
        name: 'Rama Ferreyra (Rafaela)',
        rootPersonName: 'Carlos Ferreyra (1875-1950)',
        generationsCount: 4,
        membersCount: 15,
        surnames: ['Ferreyra', 'Cantero'],
        description: 'Línea rural de colonias agrícolas santafesinas.'
      }
    ]
  },
  {
    id: 'fam-perez-cba',
    name: 'Familia Pérez — Córdoba & Salta',
    description: 'Árbol histórico que documenta a la familia Pérez desde las sierras de Córdoba hasta los Valles Calchaquíes en Salta.',
    ownerId: 'usr-maria-p',
    ownerName: 'María Elena Pérez',
    ownerEmail: 'maria.perez@historia.edu.ar',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    visibility: 'public_restricted',
    createdAt: '2023-07-22T08:00:00.000Z',
    updatedAt: '2026-08-21T18:45:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['Pérez', 'Cantero', 'Morales', 'Figueroa', 'Cabrera', 'Oliva'],
    country: 'Argentina',
    region: 'Córdoba',
    approximateOrigin: 'Villa María & Córdoba Capital (c. 1830)',
    generationsCount: 8,
    peopleCount: 156,
    photosCount: 110,
    documentsCount: 42,
    branchesCount: 4,
    allowPublicRequests: true,
    isVerifiedOrigin: true,
    branches: [
      {
        id: 'branch-perez-cba-main',
        name: 'Rama Pérez Central (Córdoba)',
        rootPersonName: 'Silvestre Pérez y Cabrera (1812-1888)',
        generationsCount: 8,
        membersCount: 95,
        surnames: ['Pérez', 'Cabrera', 'Oliva'],
        description: 'Escribanos y educadores de la Universidad Nacional de Córdoba.'
      },
      {
        id: 'branch-morales-salta',
        name: 'Rama Morales-Figueroa (Salta)',
        rootPersonName: 'Trinidad Morales (1840-1919)',
        generationsCount: 6,
        membersCount: 41,
        surnames: ['Morales', 'Figueroa', 'Cantero'],
        description: 'Vínculos con haciendas vallistas y comercio norteño.'
      },
      {
        id: 'branch-cantero-cba',
        name: 'Línea Cantero-Pérez',
        rootPersonName: 'Clara Cantero (1885-1960)',
        generationsCount: 4,
        membersCount: 20,
        surnames: ['Cantero', 'Pérez'],
        description: 'Cruce matrimonial de 1908 con la rama entrerriana.'
      }
    ]
  },
  {
    id: 'fam-gonzalez-bsas',
    name: 'Familia González de la Vega — Buenos Aires & Uruguay',
    description: 'Linaje patricio rioplatense documentado con fuentes notariales y parroquiales en San Isidro, Montserrat y Colonia del Sacramento.',
    ownerId: 'usr-santiago-g',
    ownerName: 'Dr. Santiago González',
    ownerEmail: 'santiago.gonzalez@archivo.org.ar',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    visibility: 'public',
    createdAt: '2022-11-04T16:00:00.000Z',
    updatedAt: '2026-08-19T20:10:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['González', 'Vega', 'Lavalle', 'Mitre', 'Cantero', 'Ocampo'],
    country: 'Argentina',
    region: 'Buenos Aires',
    approximateOrigin: 'San Isidro & Buenos Aires Colonial (c. 1790)',
    generationsCount: 10,
    peopleCount: 210,
    photosCount: 145,
    documentsCount: 68,
    branchesCount: 4,
    allowPublicRequests: true,
    isVerifiedOrigin: true,
    branches: [
      {
        id: 'branch-gonzalez-vega',
        name: 'Rama González de la Vega (San Isidro)',
        rootPersonName: 'Manuel González de la Vega (1775-1848)',
        generationsCount: 10,
        membersCount: 120,
        surnames: ['González', 'Vega', 'Ocampo'],
        description: 'Linaje fundacional de la zona norte bonaerense.'
      },
      {
        id: 'branch-lavalle-uruguay',
        name: 'Rama Lavalle (Banda Oriental)',
        rootPersonName: 'Felipe Lavalle y Cantero (1815-1890)',
        generationsCount: 6,
        membersCount: 55,
        surnames: ['Lavalle', 'Cantero'],
        description: 'Vínculo oriental con hacendados de Colonia.'
      }
    ]
  },
  {
    id: 'fam-martinez-mza',
    name: 'Familia Martínez Albarracín — Cuyo & Chile',
    description: 'Historia de los pioneros vitivinícolas de Luján de Cuyo y el cruce cordillerano entre Mendoza y Santiago de Chile.',
    ownerId: 'usr-lucia-m',
    ownerName: 'Lucía Martínez',
    ownerEmail: 'lucia.martinez@mendoza.edu.ar',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    visibility: 'discoverable',
    createdAt: '2024-03-01T11:00:00.000Z',
    updatedAt: '2026-08-15T15:20:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['Martínez', 'Albarracín', 'Godoy', 'Lucero', 'Cantero', 'Vargas'],
    country: 'Argentina',
    region: 'Mendoza',
    approximateOrigin: 'Luján de Cuyo y Maipú, Mendoza (c. 1860)',
    generationsCount: 6,
    peopleCount: 88,
    photosCount: 52,
    documentsCount: 18,
    branchesCount: 2,
    allowPublicRequests: true,
    isVerifiedOrigin: false,
    branches: [
      {
        id: 'branch-martinez-viti',
        name: 'Rama Martínez (Bodegueros Luján)',
        rootPersonName: 'Joaquín Martínez Lucero (1855-1932)',
        generationsCount: 6,
        membersCount: 58,
        surnames: ['Martínez', 'Lucero', 'Godoy'],
        description: 'Productores de viñedos y bodegas de Maipú.'
      },
      {
        id: 'branch-albarracin-cordillera',
        name: 'Rama Albarracín (Paso Andino)',
        rootPersonName: 'Rosa Albarracín (1870-1945)',
        generationsCount: 4,
        membersCount: 30,
        surnames: ['Albarracín', 'Cantero'],
        description: 'Vínculos familiares con comerciantes trasandinos.'
      }
    ]
  },
  {
    id: 'fam-cantero-esp',
    name: 'Familia Cantero & De la Fuente — España (Andalucía)',
    description: 'Tronco peninsular documentado en los archivos parroquiales de Santa María de Carmona y Triana (Sevilla) desde 1750.',
    ownerId: 'usr-javier-c',
    ownerName: 'Javier Cantero',
    ownerEmail: 'javier.cantero@sevilla.es',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    visibility: 'public',
    createdAt: '2023-05-18T14:00:00.000Z',
    updatedAt: '2026-08-20T11:00:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=1200&auto=format&fit=crop&q=80',
    surnameTags: ['Cantero', 'De la Fuente', 'Romero', 'Delgado', 'Cabrera'],
    country: 'España',
    region: 'Andalucía',
    approximateOrigin: 'Carmona y Triana, Sevilla (c. 1750)',
    generationsCount: 12,
    peopleCount: 285,
    photosCount: 190,
    documentsCount: 105,
    branchesCount: 4,
    allowPublicRequests: true,
    isVerifiedOrigin: true,
    branches: [
      {
        id: 'branch-cantero-sevilla',
        name: 'Rama Cantero (Carmona & Triana)',
        rootPersonName: 'Alonso Cantero de la Fuente (1732-1805)',
        generationsCount: 12,
        membersCount: 190,
        surnames: ['Cantero', 'De la Fuente', 'Romero'],
        description: 'Antiguos maestros canteros y ceramistas de Triana.'
      },
      {
        id: 'branch-delgado-andalucia',
        name: 'Rama Delgado (Aljarafe)',
        rootPersonName: 'Francisca Delgado (1780-1854)',
        generationsCount: 8,
        membersCount: 95,
        surnames: ['Delgado', 'Cabrera'],
        description: 'Línea andaluza vinculada con los olivares del Aljarafe.'
      }
    ]
  }
];

export const INITIAL_PERMISSION_GRANTS: PermissionGrant[] = [
  {
    id: 'grant-maria-perez-1',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-maria-p',
    userName: 'María Pérez',
    userEmail: 'maria.perez@historia.edu.ar',
    userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW', 'CREATE', 'EDIT'],
    scope: 'BRANCH',
    targetBranchId: 'branch-perez-er',
    targetBranchName: 'Rama Pérez (Materna - Gualeguaychú)',
    grantedBy: 'usr-francisco-c',
    grantedByName: 'Francisco Cantero',
    grantedAt: '2026-08-10T14:00:00.000Z',
    status: 'active',
    notes: 'Aprobado para aportar ramas y fotos de Gualeguaychú.'
  },
  {
    id: 'grant-carlos-admin-2',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-carlos-g',
    userName: 'Carlos González',
    userEmail: 'carlos.gonzalez@archivo.org',
    userPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MANAGE'],
    scope: 'FAMILY',
    grantedBy: 'usr-francisco-c',
    grantedByName: 'Francisco Cantero',
    grantedAt: '2026-08-01T10:30:00.000Z',
    status: 'active',
    notes: 'Co-administrador del árbol e investigador parroquial.'
  },
  {
    id: 'grant-juan-viewer-3',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-juan-m',
    userName: 'Juan Martínez',
    userEmail: 'juan.martinez@correo.com',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW'],
    scope: 'FAMILY',
    grantedBy: 'usr-francisco-c',
    grantedByName: 'Francisco Cantero',
    grantedAt: '2026-08-12T16:20:00.000Z',
    expiresAt: '2026-11-12T16:20:00.000Z',
    status: 'active',
    notes: 'Acceso de lectura temporal por 90 días.'
  }
];

export const INITIAL_PERMISSION_REQUESTS: PermissionRequest[] = [
  {
    id: 'req-juan-cantero-101',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    requesterId: 'usr-juan-c',
    requesterName: 'Juan Ignacio Cantero',
    requesterEmail: 'juan.cantero@gmail.com',
    requesterPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    requestedPermissions: ['VIEW', 'CREATE', 'EDIT'],
    scope: 'SURNAME',
    targetSurname: 'Cantero',
    message: 'Hola Francisco, soy tataranieto de Bartolomé Cantero. Tengo en mi poder la libreta de enrolamiento y actas de bautismo originales de 1890 con fotos inéditas.',
    familyRelation: 'Tataranieto de Bartolomé Cantero y Alarcón',
    contributionIntent: 'Aportar fotos históricas y documentos escaneados en alta resolución',
    status: 'pending',
    createdAt: '2026-08-21T18:10:00.000Z'
  },
  {
    id: 'req-ana-morales-102',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    requesterId: 'usr-ana-m',
    requesterName: 'Ana Morales Cantero',
    requesterEmail: 'ana.morales@genealogia.ar',
    requesterPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    requestedPermissions: ['VIEW'],
    scope: 'FAMILY',
    message: 'Investigo los lazos entre las familias de Entre Ríos y Santa Fe para una tesis universitaria. Quisiera consultar las fuentes registradas.',
    familyRelation: 'Investigadora y pariente lejana colateral',
    contributionIntent: 'Revisión y transcripción de fuentes documentales',
    status: 'pending',
    createdAt: '2026-08-22T00:30:00.000Z'
  }
];

export const INITIAL_FAMILY_CONNECTIONS: FamilyConnection[] = [
  {
    id: 'conn-cantero-er-sf',
    familyAId: 'fam-cantero-er',
    familyAName: 'Familia Cantero — Entre Ríos',
    familyAOwnerName: 'Francisco Cantero',
    familyBId: 'fam-cantero-sf',
    familyBName: 'Familia Cantero — Santa Fe',
    familyBOwnerName: 'Mateo Cantero',
    commonSurnames: ['Cantero', 'Rossi', 'Alarcón'],
    commonLocations: ['Litoral Argentino', 'Rosario / Gualeguaychú'],
    potentialLinkNote: 'Posible tronco común a través de hermanos migrantes de 1860 entre el puerto de Concepción del Uruguay y Rosario.',
    requestedBy: 'usr-mateo-c',
    requestedByName: 'Mateo Cantero',
    status: 'pending',
    createdAt: '2026-08-19T11:45:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: LobbyAuditLog[] = [
  {
    id: 'audit-1',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-francisco-c',
    userName: 'Francisco Cantero',
    action: 'PERMISSION_GRANTED',
    entityType: 'GRANT',
    entityId: 'grant-maria-perez-1',
    details: 'Otorgó permisos [VIEW, CREATE, EDIT] a María Pérez con alcance Rama Pérez.',
    timestamp: '2026-08-10T14:00:00.000Z'
  },
  {
    id: 'audit-2',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-francisco-c',
    userName: 'Francisco Cantero',
    action: 'PERMISSION_GRANTED',
    entityType: 'GRANT',
    entityId: 'grant-carlos-admin-2',
    details: 'Asignó rol de Administrador Completo a Carlos González.',
    timestamp: '2026-08-01T10:30:00.000Z'
  },
  {
    id: 'audit-3',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    userId: 'usr-juan-c',
    userName: 'Juan Ignacio Cantero',
    action: 'REQUEST_SUBMITTED',
    entityType: 'REQUEST',
    entityId: 'req-juan-cantero-101',
    details: 'Envió solicitud de colaboración para apellido Cantero.',
    timestamp: '2026-08-21T18:10:00.000Z'
  }
];

export const INITIAL_INVITATIONS: FamilyInvitation[] = [
  {
    id: 'inv-cantero-7d',
    code: 'CANTERO-2026-ER',
    familyId: 'fam-cantero-er',
    familyName: 'Familia Cantero — Entre Ríos',
    permissions: ['VIEW', 'CREATE', 'EDIT'],
    scope: 'BRANCH',
    targetBranchId: 'branch-cantero-main',
    targetBranchName: 'Rama Cantero (Principal)',
    createdBy: 'usr-francisco-c',
    createdByName: 'Francisco Cantero',
    createdAt: '2026-08-15T09:00:00.000Z',
    expiresAt: '2026-08-29T23:59:59.000Z',
    maxUses: 10,
    usedCount: 3,
    status: 'active'
  }
];
