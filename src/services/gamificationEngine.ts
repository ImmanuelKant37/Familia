/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Person, Relationship, FamilyEvent, MediaItem, HistoricalSource, 
  TreeMember, TreeCommit, Tree
} from '../types';
import { 
  Achievement, AchievementCategory, AchievementRarity, 
  ResearcherLevel, Mission, FamilyCollection, FamilyTreeStats, 
  SmartRecommendation, BranchProgress, GamificationState,
  PersonCompletenessBreakdown
} from '../types/gamification';

export class GamificationEngine {
  // =========================================================================
  // RESEARCHER LEVELS DEFINITION (1 to 10 from Specification)
  // =========================================================================
  static readonly LEVELS: ResearcherLevel[] = [
    {
      level: 1,
      title: 'Curioso',
      minXp: 0,
      maxXp: 99,
      icon: '🌱',
      color: '#8A8578',
      badge: 'Brote Genealógico',
      description: 'Dando los primeros pasos en el descubrimiento de tus raíces familiares.',
      perks: ['Acceso al árbol interactivo básico', 'Registro de familiares inmediatos']
    },
    {
      level: 2,
      title: 'Explorador',
      minXp: 100,
      maxXp: 249,
      icon: '🧭',
      color: '#5A5A40',
      badge: 'Brújula del Linaje',
      description: 'Recorriendo los primeros senderos y conectando las primeras generaciones.',
      perks: ['Desbloqueo de cronología y mapa', 'Insignia de Explorador en perfil']
    },
    {
      level: 3,
      title: 'Investigador',
      minXp: 250,
      maxXp: 499,
      icon: '🔍',
      color: '#4B6B58',
      badge: 'Lente de Archivo',
      description: 'Buscando datos precisos, fechas históricas y vínculos confirmados.',
      perks: ['Filtros avanzados de búsqueda', 'Estadísticas de parentesco']
    },
    {
      level: 4,
      title: 'Historiador familiar',
      minXp: 500,
      maxXp: 999,
      icon: '📜',
      color: '#7D5A38',
      badge: 'Pergamino de Historia',
      description: 'Documentando anécdotas, recuerdos orales y biografías de antepasados.',
      perks: ['Exportación de Libro Familiar Decorado', 'Marco dorado para biografía']
    },
    {
      level: 5,
      title: 'Genealogista',
      minXp: 1000,
      maxXp: 1999,
      icon: '🌳',
      color: '#3F6B38',
      badge: 'Roble Centenario',
      description: 'Dominio de la metodología genealógica con ramas profundas y fundamentadas.',
      perks: ['Control de Marcas de Versión & Ramas', 'Estilos heráldicos personalizados']
    },
    {
      level: 6,
      title: 'Archivista',
      minXp: 2000,
      maxXp: 4999,
      icon: '🏛️',
      color: '#3B5878',
      badge: 'Custodia Documental',
      description: 'Digitalización exhaustiva de actas, certificados y documentos antiguos.',
      perks: ['Galería de documentos clasificados', 'Comprobador de coherencia de fuentes']
    },
    {
      level: 7,
      title: 'Guardián de la memoria',
      minXp: 5000,
      maxXp: 9999,
      icon: '🛡️',
      color: '#6B3860',
      badge: 'Escudo del Recuerdo',
      description: 'Preservando el patrimonio oral y gráfico para las generaciones futuras.',
      perks: ['Certificado de Linaje Familiar Oficial', 'Acceso a misiones legendarias']
    },
    {
      level: 8,
      title: 'Cronista familiar',
      minXp: 10000,
      maxXp: 24999,
      icon: '📖',
      color: '#8C482A',
      badge: 'Tomo de Oro',
      description: 'Narrador incansable de épocas, migraciones y momentos trascendentales.',
      perks: ['Visualizaciones multi-siglo', 'Título noble en árbol exportable']
    },
    {
      level: 9,
      title: 'Maestro genealogista',
      minXp: 25000,
      maxXp: 49999,
      icon: '👑',
      color: '#B57C1E',
      badge: 'Corona de Sabiduría',
      description: 'Autoridad en la reconstrucción genealógica con cientos de ramas validadas.',
      perks: ['Insignia Épica Maestra', 'Herramientas de análisis predictivo']
    },
    {
      level: 10,
      title: 'Guardián del linaje',
      minXp: 50000,
      maxXp: 999999,
      icon: '⚡',
      color: '#9E2A2B',
      badge: 'Sello Inmortal',
      description: 'El grado supremo de preservación y consagración de la historia familiar.',
      perks: ['Título supremo permanente', 'Certificado Maestro del Linaje Familiar']
    }
  ];

  // =========================================================================
  // MASTER ACHIEVEMENTS CATALOG (From Full Specification)
  // =========================================================================
  static readonly MASTER_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress' | 'percent'>[] = [
    // 1. CONSTRUCCIÓN DEL ÁRBOL
    {
      id: 'const_first_step',
      title: 'Primer paso',
      description: 'Crear la primera persona en el árbol familiar.',
      category: 'construction',
      rarity: 'common',
      xpReward: 25,
      iconName: 'UserPlus',
      target: 1,
      chainName: 'Constructor',
      tier: 1,
      rewardDetails: 'Título desbloqueado: Principiante'
    },
    {
      id: 'const_family_moving',
      title: 'Familia en marcha',
      description: 'Agregar al menos 5 personas al árbol.',
      category: 'construction',
      rarity: 'common',
      xpReward: 50,
      iconName: 'Users',
      target: 5,
      chainName: 'Constructor',
      tier: 2
    },
    {
      id: 'const_small_family',
      title: 'Pequeña familia',
      description: 'Agregar al menos 10 personas al árbol.',
      category: 'construction',
      rarity: 'common',
      xpReward: 100,
      iconName: 'Users',
      target: 10,
      chainName: 'Constructor',
      tier: 3
    },
    {
      id: 'const_large_family',
      title: 'Familia numerosa',
      description: 'Agregar al menos 25 personas al árbol.',
      category: 'construction',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'Network',
      target: 25,
      chainName: 'Constructor',
      tier: 4
    },
    {
      id: 'const_great_family',
      title: 'Gran familia',
      description: 'Agregar al menos 50 personas al árbol.',
      category: 'construction',
      rarity: 'rare',
      xpReward: 400,
      iconName: 'Sparkles',
      target: 50,
      chainName: 'Constructor',
      tier: 5
    },
    {
      id: 'const_clan',
      title: 'Clan familiar',
      description: 'Alcanzar 100 personas registradas en el árbol.',
      category: 'construction',
      rarity: 'rare',
      xpReward: 750,
      iconName: 'Shield',
      target: 100,
      chainName: 'Constructor',
      tier: 6
    },
    {
      id: 'const_dynasty',
      title: 'Dinastía',
      description: 'Alcanzar 250 personas registradas en el árbol.',
      category: 'construction',
      rarity: 'epic',
      xpReward: 1500,
      iconName: 'Crown',
      target: 250,
      chainName: 'Constructor',
      tier: 7
    },
    {
      id: 'const_great_lineage',
      title: 'Gran linaje',
      description: 'Superar 500 personas en la base genealógica.',
      category: 'construction',
      rarity: 'legendary',
      xpReward: 3000,
      iconName: 'Flame',
      target: 500,
      chainName: 'Constructor',
      tier: 8
    },
    {
      id: 'const_encyclopedia',
      title: 'Enciclopedia familiar',
      description: 'Superar 1.000 familiares registrados con precisión.',
      category: 'construction',
      rarity: 'unique',
      xpReward: 6000,
      iconName: 'BookMarked',
      target: 1000,
      chainName: 'Constructor',
      tier: 9
    },

    // 2. GENERACIONES
    {
      id: 'gen_second',
      title: 'Segunda generación',
      description: 'Registrar la generación de padres conectada.',
      category: 'generations',
      rarity: 'common',
      xpReward: 50,
      iconName: 'GitCommit',
      target: 2,
      chainName: 'Generaciones',
      tier: 1
    },
    {
      id: 'gen_third',
      title: 'Tercera generación',
      description: 'Registrar abuelos en el linaje familiar (3 generaciones).',
      category: 'generations',
      rarity: 'common',
      xpReward: 100,
      iconName: 'GitCommit',
      target: 3,
      chainName: 'Generaciones',
      tier: 2
    },
    {
      id: 'gen_fourth',
      title: 'Cuarta generación',
      description: 'Registrar bisabuelos en el linaje familiar (4 generaciones).',
      category: 'generations',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'GitCommit',
      target: 4,
      chainName: 'Generaciones',
      tier: 3
    },
    {
      id: 'gen_fifth',
      title: 'Quinta generación',
      description: 'Alcanzar una profundidad de 5 generaciones conectadas.',
      category: 'generations',
      rarity: 'uncommon',
      xpReward: 350,
      iconName: 'GitCommit',
      target: 5,
      chainName: 'Generaciones',
      tier: 4
    },
    {
      id: 'gen_sixth',
      title: 'Sexta generación',
      description: 'Alcanzar 6 generaciones documentadas.',
      category: 'generations',
      rarity: 'rare',
      xpReward: 600,
      iconName: 'GitCommit',
      target: 6,
      chainName: 'Generaciones',
      tier: 5
    },
    {
      id: 'gen_seventh',
      title: 'Séptima generación',
      description: 'Alcanzar 7 generaciones en el árbol familiar.',
      category: 'generations',
      rarity: 'rare',
      xpReward: 1000,
      iconName: 'GitCommit',
      target: 7,
      chainName: 'Generaciones',
      tier: 6
    },
    {
      id: 'gen_eighth',
      title: 'Ocho generaciones',
      description: 'Reconstruir 8 generaciones consecutivas.',
      category: 'generations',
      rarity: 'epic',
      xpReward: 1800,
      iconName: 'GitCommit',
      target: 8,
      chainName: 'Generaciones',
      tier: 7
    },
    {
      id: 'gen_ninth',
      title: 'Nueve generaciones',
      description: 'Reconstruir 9 generaciones de historia.',
      category: 'generations',
      rarity: 'epic',
      xpReward: 2500,
      iconName: 'GitCommit',
      target: 9,
      chainName: 'Generaciones',
      tier: 8
    },
    {
      id: 'gen_tenth',
      title: 'Diez generaciones',
      description: 'Llegar a 10 generaciones históricas continuas.',
      category: 'generations',
      rarity: 'legendary',
      xpReward: 4000,
      iconName: 'GitCommit',
      target: 10,
      chainName: 'Generaciones',
      tier: 9
    },
    {
      id: 'gen_beyond',
      title: 'Hasta donde alcance la memoria',
      description: 'Superar más de 10 generaciones documentadas.',
      category: 'generations',
      rarity: 'unique',
      xpReward: 7500,
      iconName: 'Compass',
      target: 11,
      chainName: 'Generaciones',
      tier: 10
    },

    // 3. FOTOGRAFÍAS
    {
      id: 'photo_first',
      title: 'Primera fotografía',
      description: 'Subir la primera foto histórica o retrato familiar.',
      category: 'photos',
      rarity: 'common',
      xpReward: 25,
      iconName: 'Camera',
      target: 1
    },
    {
      id: 'photo_album',
      title: 'Álbum familiar',
      description: 'Subir 10 fotografías al archivo multimedia.',
      category: 'photos',
      rarity: 'common',
      xpReward: 100,
      iconName: 'Image',
      target: 10
    },
    {
      id: 'photo_gallery',
      title: 'Fototeca',
      description: 'Subir 50 fotografías familiares.',
      category: 'photos',
      rarity: 'uncommon',
      xpReward: 350,
      iconName: 'Layers',
      target: 50
    },
    {
      id: 'photo_archive',
      title: 'Archivo fotográfico',
      description: 'Reunir más de 100 fotografías digitalizadas.',
      category: 'photos',
      rarity: 'rare',
      xpReward: 750,
      iconName: 'Archive',
      target: 100
    },
    {
      id: 'photo_visual_memory',
      title: 'Memoria visual',
      description: 'Asociar retratos fotográficos a 25 personas diferentes.',
      category: 'photos',
      rarity: 'rare',
      xpReward: 500,
      iconName: 'UserCheck',
      target: 25
    },
    {
      id: 'photo_faces_past',
      title: 'Rostros del pasado',
      description: 'Asociar fotografías a 50 personas del árbol.',
      category: 'photos',
      rarity: 'epic',
      xpReward: 1200,
      iconName: 'Eye',
      target: 50
    },
    {
      id: 'photo_three_gen',
      title: 'Tres generaciones en imágenes',
      description: 'Tener fotografías asociadas en al menos 3 generaciones.',
      category: 'photos',
      rarity: 'uncommon',
      xpReward: 250,
      iconName: 'Maximize2',
      target: 3
    },
    {
      id: 'photo_visual_testimony',
      title: 'Testimonio visual',
      description: 'Subir fotografías con fecha histórica y lugar geolocalizado.',
      category: 'photos',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'MapPin',
      target: 5
    },

    // 4. DOCUMENTOS
    {
      id: 'doc_first',
      title: 'Primer documento',
      description: 'Subir el primer documento histórico (acta, certificado, carta).',
      category: 'documents',
      rarity: 'common',
      xpReward: 30,
      iconName: 'FileText',
      target: 1
    },
    {
      id: 'doc_apprentice',
      title: 'Archivista principiante',
      description: 'Subir 10 documentos históricos digitalizados.',
      category: 'documents',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'Folder',
      target: 10
    },
    {
      id: 'doc_family_archive',
      title: 'Archivo familiar',
      description: 'Subir 50 documentos históricos clasificados.',
      category: 'documents',
      rarity: 'rare',
      xpReward: 600,
      iconName: 'HardDrive',
      target: 50
    },
    {
      id: 'doc_historic_50',
      title: 'Documento histórico',
      description: 'Registrar un documento o acta con más de 50 años de antigüedad.',
      category: 'documents',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'Clock',
      target: 1
    },
    {
      id: 'doc_centennial',
      title: 'Documento centenario',
      description: 'Registrar un documento con más de 100 años de antigüedad.',
      category: 'documents',
      rarity: 'epic',
      xpReward: 600,
      iconName: 'Award',
      target: 1
    },
    {
      id: 'doc_organized',
      title: 'Archivo organizado',
      description: 'Clasificar correctamente al menos 25 documentos por tipo y fecha.',
      category: 'documents',
      rarity: 'rare',
      xpReward: 400,
      iconName: 'CheckSquare',
      target: 25
    },

    // 5. HISTORIAS Y NARRATIVAS
    {
      id: 'story_first',
      title: 'Primera historia',
      description: 'Registrar la primera biografía o historia familiar detallada.',
      category: 'stories',
      rarity: 'common',
      xpReward: 30,
      iconName: 'BookOpen',
      target: 1
    },
    {
      id: 'story_chronicler',
      title: 'Cronista',
      description: 'Agregar historias o biografías a 10 personas.',
      category: 'stories',
      rarity: 'uncommon',
      xpReward: 250,
      iconName: 'Feather',
      target: 10
    },
    {
      id: 'story_narrator',
      title: 'Narrador familiar',
      description: 'Registrar 25 relatos, memorias o anécdotas en el árbol.',
      category: 'stories',
      rarity: 'rare',
      xpReward: 600,
      iconName: 'BookMarked',
      target: 25
    },
    {
      id: 'story_immigration',
      title: 'Historias de inmigración',
      description: 'Registrar relatos o acontecimientos sobre viajes y migraciones.',
      category: 'stories',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'Globe',
      target: 2
    },
    {
      id: 'story_oral_memory',
      title: 'Memoria viva',
      description: 'Documentar historias y recuerdos de personas mayores de la familia.',
      category: 'stories',
      rarity: 'rare',
      xpReward: 350,
      iconName: 'Heart',
      target: 5
    },

    // 6. FECHAS Y CRONOLOGÍA
    {
      id: 'date_first',
      title: 'Primera fecha',
      description: 'Registrar la fecha completa de un acontecimiento familiar.',
      category: 'dates',
      rarity: 'common',
      xpReward: 20,
      iconName: 'Calendar',
      target: 1
    },
    {
      id: 'date_calendar',
      title: 'Calendario familiar',
      description: 'Registrar 25 fechas de nacimientos o matrimonios.',
      category: 'dates',
      rarity: 'common',
      xpReward: 120,
      iconName: 'Calendar',
      target: 25
    },
    {
      id: 'date_timeline_100',
      title: 'Cronología',
      description: 'Registrar 100 fechas en la línea de tiempo.',
      category: 'dates',
      rarity: 'rare',
      xpReward: 500,
      iconName: 'Clock',
      target: 100
    },
    {
      id: 'date_century_19',
      title: 'Siglo XIX',
      description: 'Registrar un familiar nacido entre 1800 y 1899.',
      category: 'dates',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'Compass',
      target: 1
    },
    {
      id: 'date_century_18',
      title: 'Siglo XVIII',
      description: 'Registrar un antepasado nacido entre 1700 y 1799.',
      category: 'dates',
      rarity: 'rare',
      xpReward: 450,
      iconName: 'Anchor',
      target: 1
    },
    {
      id: 'date_before_1800',
      title: 'Más atrás',
      description: 'Registrar un antepasado nacido antes del año 1800.',
      category: 'dates',
      rarity: 'epic',
      xpReward: 1000,
      iconName: 'Sparkles',
      target: 1
    },

    // 7. LUGARES Y MIGRACIÓN
    {
      id: 'place_first',
      title: 'Primer lugar',
      description: 'Registrar el primer lugar geográfico con coordenadas o ciudad.',
      category: 'places',
      rarity: 'common',
      xpReward: 20,
      iconName: 'MapPin',
      target: 1
    },
    {
      id: 'place_map_10',
      title: 'Mapa familiar',
      description: 'Registrar familiares en 10 lugares geográficos distintos.',
      category: 'places',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'Map',
      target: 10
    },
    {
      id: 'place_international_3',
      title: 'Familia internacional',
      description: 'Registrar familiares nacidos en al menos 3 países diferentes.',
      category: 'places',
      rarity: 'uncommon',
      xpReward: 250,
      iconName: 'Globe',
      target: 3
    },
    {
      id: 'place_global_5',
      title: 'Familia global',
      description: 'Registrar familiares vinculados a 5 o más países.',
      category: 'places',
      rarity: 'rare',
      xpReward: 600,
      iconName: 'Navigation',
      target: 5
    },
    {
      id: 'place_migration_route',
      title: 'Ruta migratoria',
      description: 'Registrar acontecimientos migratorios trazando origen y destino.',
      category: 'places',
      rarity: 'rare',
      xpReward: 350,
      iconName: 'Compass',
      target: 2
    },

    // 8. APELLIDOS Y RAMAS
    {
      id: 'surname_first',
      title: 'Primer apellido',
      description: 'Registrar y estilizar los primeros apellidos de la familia.',
      category: 'surnames',
      rarity: 'common',
      xpReward: 20,
      iconName: 'Tag',
      target: 1
    },
    {
      id: 'surname_five',
      title: 'Cinco apellidos',
      description: 'Registrar 5 linajes de apellidos diferentes en el árbol.',
      category: 'surnames',
      rarity: 'common',
      xpReward: 80,
      iconName: 'Layers',
      target: 5
    },
    {
      id: 'surname_ten',
      title: 'Diez apellidos',
      description: 'Registrar 10 apellidos distintos con sus respectivas ramas.',
      category: 'surnames',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'Palette',
      target: 10
    },
    {
      id: 'surname_historic_style',
      title: 'Apellido histórico',
      description: 'Configurar un fondo o escudo heráldico a un apellido familiar.',
      category: 'surnames',
      rarity: 'uncommon',
      xpReward: 100,
      iconName: 'Shield',
      target: 1
    },

    // 9. COLABORACIÓN
    {
      id: 'collab_first_invite',
      title: 'Primera invitación',
      description: 'Invitar a un familiar a participar en el árbol genealógico.',
      category: 'collaboration',
      rarity: 'common',
      xpReward: 50,
      iconName: 'UserPlus',
      target: 1
    },
    {
      id: 'collab_first_partner',
      title: 'Primer colaborador',
      description: 'Tener al menos 1 familiar colaborando activamente.',
      category: 'collaboration',
      rarity: 'uncommon',
      xpReward: 100,
      iconName: 'Users',
      target: 1
    },
    {
      id: 'collab_team_3',
      title: 'Equipo familiar',
      description: 'Contar con 3 colaboradores en el proyecto genealógico.',
      category: 'collaboration',
      rarity: 'rare',
      xpReward: 300,
      iconName: 'Users',
      target: 3
    },
    {
      id: 'collab_together_5',
      title: 'Familia trabajando junta',
      description: 'Conseguir 5 colaboradores en la reconstrucción del árbol.',
      category: 'collaboration',
      rarity: 'epic',
      xpReward: 800,
      iconName: 'Sparkles',
      target: 5
    },

    // 10. VERIFICACIÓN Y FUENTES
    {
      id: 'verif_first',
      title: 'Primer verificador',
      description: 'Marcar información con grado de certeza confirmada.',
      category: 'verification',
      rarity: 'common',
      xpReward: 25,
      iconName: 'CheckCircle',
      target: 1
    },
    {
      id: 'verif_inspector_10',
      title: 'Inspector',
      description: 'Confirmar con certeza al menos 10 registros del árbol.',
      category: 'verification',
      rarity: 'uncommon',
      xpReward: 150,
      iconName: 'CheckSquare',
      target: 10
    },
    {
      id: 'verif_careful_50',
      title: 'Investigador cuidadoso',
      description: 'Verificar y confirmar 50 personas o relaciones.',
      category: 'verification',
      rarity: 'rare',
      xpReward: 500,
      iconName: 'ShieldCheck',
      target: 50
    },
    {
      id: 'source_first',
      title: 'Primera fuente',
      description: 'Vincular una fuente documental o testimonio al árbol.',
      category: 'sources',
      rarity: 'common',
      xpReward: 30,
      iconName: 'BookOpen',
      target: 1
    },
    {
      id: 'source_ten',
      title: 'Investigador',
      description: 'Agregar 10 fuentes documentales diferentes.',
      category: 'sources',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'Book',
      target: 10
    },
    {
      id: 'source_fifty',
      title: 'Documentalista',
      description: 'Respaldar el árbol con 50 fuentes registradas.',
      category: 'sources',
      rarity: 'rare',
      xpReward: 700,
      iconName: 'Library',
      target: 50
    },

    // 11. PRESERVACIÓN Y RESPALDOS
    {
      id: 'preserv_first_backup',
      title: 'Primer respaldo',
      description: 'Exportar un respaldo del árbol en formato GEDCOM o JSON.',
      category: 'preservation',
      rarity: 'common',
      xpReward: 50,
      iconName: 'Download',
      target: 1
    },
    {
      id: 'preserv_digital_legacy',
      title: 'Legado digital',
      description: 'Completar un árbol con más del 70% de perfiles detallados.',
      category: 'preservation',
      rarity: 'epic',
      xpReward: 1000,
      iconName: 'Award',
      target: 1
    },

    // 12. COMPLETITUD DE PERFILES
    {
      id: 'complete_first_100',
      title: 'Primer perfil completo',
      description: 'Completar una persona al 100% (nombre, fechas, foto, fuentes y bio).',
      category: 'research',
      rarity: 'common',
      xpReward: 50,
      iconName: 'Award',
      target: 1
    },
    {
      id: 'complete_five_100',
      title: 'Cinco perfiles completos',
      description: 'Completar 5 familiares al 100% de detalle.',
      category: 'research',
      rarity: 'uncommon',
      xpReward: 200,
      iconName: 'CheckCircle',
      target: 5
    },
    {
      id: 'complete_ten_100',
      title: 'Diez perfiles completos',
      description: 'Completar 10 familiares al 100% de detalle.',
      category: 'research',
      rarity: 'rare',
      xpReward: 500,
      iconName: 'Star',
      target: 10
    },

    // 13. LOGROS SECRETOS (🔒 con pistas misteriosas)
    {
      id: 'secret_traveler',
      title: 'El viajero transoceánico',
      description: 'Identificar una migración transcontinental entre dos continentes.',
      secretDescription: 'Hay algo escondido sobre los viajes de tus antepasados...',
      category: 'secret',
      rarity: 'epic',
      xpReward: 750,
      iconName: 'Compass',
      isSecret: true,
      target: 1
    },
    {
      id: 'secret_lost_link',
      title: 'El vínculo perdido',
      description: 'Encontrar y conectar una relación entre dos ramas independientes.',
      secretDescription: 'Una rama solitaria espera ser conectada con el tronco principal...',
      category: 'secret',
      rarity: 'legendary',
      xpReward: 1500,
      iconName: 'Key',
      isSecret: true,
      target: 1
    },
    {
      id: 'secret_three_centuries',
      title: 'Tres siglos de raíces',
      description: 'Abarcar familiares documentados a lo largo de 3 siglos diferentes.',
      secretDescription: '¿Podrá la memoria familiar cruzar tres centurias en el tiempo?...',
      category: 'secret',
      rarity: 'legendary',
      xpReward: 2500,
      iconName: 'Hourglass',
      isSecret: true,
      target: 3
    }
  ];

  // =========================================================================
  // COLLECTIONS DEFINITION
  // =========================================================================
  static readonly MASTER_COLLECTIONS: Omit<FamilyCollection, 'completedCount' | 'totalCount' | 'completed'>[] = [
    {
      id: 'col_building_family',
      title: 'Construyendo la familia',
      description: 'Reconstruir el núcleo y las primeras ramas fundamentales.',
      iconName: 'Home',
      achievementIds: ['const_first_step', 'const_family_moving', 'const_small_family', 'const_large_family', 'gen_second', 'gen_third'],
      rewardTitle: 'Arquitecto Familiar',
      rewardBadge: 'Cimiento de Roble'
    },
    {
      id: 'col_visual_memory',
      title: 'Memoria y Rostros',
      description: 'Conservar los rostros y retratos de nuestros ancestros.',
      iconName: 'Image',
      achievementIds: ['photo_first', 'photo_album', 'photo_gallery', 'photo_visual_memory', 'photo_three_gen'],
      rewardTitle: 'Custodio Visual',
      rewardBadge: 'Retrato Eterno'
    },
    {
      id: 'col_historic_archive',
      title: 'Archivo histórico',
      description: 'Digitalizar y clasificar documentos, actas y certificados centenarios.',
      iconName: 'Archive',
      achievementIds: ['doc_first', 'doc_apprentice', 'doc_family_archive', 'doc_historic_50', 'doc_centennial', 'source_first', 'source_ten'],
      rewardTitle: 'Maestro Archivista',
      rewardBadge: 'Sello Notarial'
    },
    {
      id: 'col_deep_roots',
      title: 'Grandes generaciones',
      description: 'Explorar hacia atrás hasta bisabuelos, tatarabuelos y más allá.',
      iconName: 'GitBranch',
      achievementIds: ['gen_fourth', 'gen_fifth', 'gen_sixth', 'gen_seventh', 'date_century_19', 'date_century_18'],
      rewardTitle: 'Guardián del Linaje',
      rewardBadge: 'Raíz Ancestral'
    },
    {
      id: 'col_family_narratives',
      title: 'Historias y voces',
      description: 'Registrar la historia viva, biografías y anécdotas familiares.',
      iconName: 'BookOpen',
      achievementIds: ['story_first', 'story_chronicler', 'story_narrator', 'story_immigration', 'story_oral_memory'],
      rewardTitle: 'Cronista Mayor',
      rewardBadge: 'Pluma de Oro'
    }
  ];

  // =========================================================================
  // CALCULATION & TREE ANALYSIS
  // =========================================================================

  /**
   * Calculates overall family tree statistics
   */
  static calculateTreeStats(
    people: Person[],
    relationships: Relationship[],
    events: FamilyEvent[] = [],
    media: MediaItem[] = [],
    sources: HistoricalSource[] = [],
    members: TreeMember[] = []
  ): FamilyTreeStats {
    const personsCount = people.length;
    const livingCount = people.filter(p => p.isLiving).length;
    const deceasedCount = personsCount - livingCount;

    // Photos & Docs count
    const photosCount = media.filter(m => m.type === 'photo').length;
    const documentsCount = media.filter(m => m.type !== 'photo').length;
    const storiesCount = people.filter(p => (p.bio && p.bio.trim().length > 20) || (p.notes && p.notes.trim().length > 20)).length;
    const sourcesCount = sources.length;

    // Verified data count
    const verifiedDataCount = people.filter(p => p.certainty === 'confirmed').length + 
      relationships.filter(r => r.certainty === 'confirmed').length;

    // Collaborators
    const collaboratorsCount = members.filter(m => m.status === 'active').length || 1;

    // Surnames
    const surnamesSet = new Set<string>();
    people.forEach(p => {
      if (p.lastName && p.lastName.trim()) surnamesSet.add(p.lastName.trim().toLowerCase());
      if (p.maidenName && p.maidenName.trim()) surnamesSet.add(p.maidenName.trim().toLowerCase());
    });
    const surnamesCount = surnamesSet.size;

    // Places and countries
    const placesSet = new Set<string>();
    const countriesSet = new Set<string>();
    people.forEach(p => {
      if (p.birthPlace && p.birthPlace.trim()) {
        placesSet.add(p.birthPlace.trim());
        const parts = p.birthPlace.split(',');
        if (parts.length > 1) countriesSet.add(parts[parts.length - 1].trim());
      }
      if (p.deathPlace && p.deathPlace.trim()) {
        placesSet.add(p.deathPlace.trim());
        const parts = p.deathPlace.split(',');
        if (parts.length > 1) countriesSet.add(parts[parts.length - 1].trim());
      }
    });

    events.forEach(e => {
      if (e.place && e.place.trim()) placesSet.add(e.place.trim());
    });

    // Centuries & Oldest birth year
    const centuriesSet = new Set<number>();
    let oldestBirthYear: number | undefined = undefined;

    people.forEach(p => {
      const year = this.extractYear(p.birthDate || p.birthDateApprox);
      if (year && !isNaN(year)) {
        const century = Math.floor(year / 100) + 1;
        centuriesSet.add(century);
        if (!oldestBirthYear || year < oldestBirthYear) {
          oldestBirthYear = year;
        }
      }
    });

    // Generations depth calculation
    const generationsDepth = this.calculateGenerationsDepth(people, relationships);

    // Average completeness
    let totalCompleteness = 0;
    people.forEach(p => {
      totalCompleteness += this.calculatePersonCompleteness(p, relationships, media, sources).score;
    });
    const completenessAverage = personsCount > 0 ? Math.round(totalCompleteness / personsCount) : 0;

    return {
      personsCount,
      livingCount,
      deceasedCount,
      generationsDepth,
      photosCount,
      documentsCount,
      storiesCount,
      sourcesCount,
      verifiedDataCount,
      collaboratorsCount,
      surnamesCount,
      countriesCount: Math.max(countriesSet.size, 1),
      placesCount: placesSet.size,
      eventsCount: events.length,
      centuriesCount: centuriesSet.size,
      oldestBirthYear,
      completenessAverage,
      relationshipsCount: relationships.length
    };
  }

  /**
   * Helper to extract numeric 4-digit year from date string
   */
  static extractYear(dateStr?: string): number | null {
    if (!dateStr) return null;
    const match = dateStr.match(/\b(1[0-9]{3}|20[0-9]{2}|0?[0-9]{1,3})\b/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Calculates maximum generational depth across parent-child tree
   */
  static calculateGenerationsDepth(people: Person[], relationships: Relationship[]): number {
    if (people.length === 0) return 0;
    if (people.length === 1) return 1;

    // Build parent -> children and child -> parents map
    const parentToChildren: Record<string, string[]> = {};
    const childToParents: Record<string, string[]> = {};

    relationships.forEach(rel => {
      if (rel.type === 'parent') {
        const parentId = rel.person1Id;
        const childId = rel.person2Id;
        if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
        parentToChildren[parentId].push(childId);

        if (!childToParents[childId]) childToParents[childId] = [];
        childToParents[childId].push(parentId);
      }
    });

    // Find roots (people with no parents in tree)
    const allIds = people.map(p => p.id);
    const roots = allIds.filter(id => !childToParents[id] || childToParents[id].length === 0);

    if (roots.length === 0) return 1;

    // DFS to find max depth
    let maxDepth = 1;

    const findDepth = (currentId: string, visited: Set<string>): number => {
      if (visited.has(currentId)) return 0;
      visited.add(currentId);

      const children = parentToChildren[currentId] || [];
      if (children.length === 0) return 1;

      let childMax = 0;
      for (const ch of children) {
        const d = findDepth(ch, new Set(visited));
        if (d > childMax) childMax = d;
      }
      return 1 + childMax;
    };

    roots.forEach(rootId => {
      const depth = findDepth(rootId, new Set<string>());
      if (depth > maxDepth) maxDepth = depth;
    });

    return maxDepth;
  }

  /**
   * Calculates completeness breakdown for a single person
   */
  static calculatePersonCompleteness(
    person: Person,
    relationships: Relationship[],
    media: MediaItem[] = [],
    sources: HistoricalSource[] = []
  ): PersonCompletenessBreakdown {
    const completedFields: string[] = [];
    const missingFields: string[] = [];

    const hasName = Boolean(person.firstName && person.lastName && person.firstName.trim().length > 0 && person.lastName.trim().length > 0);
    const hasGender = Boolean(person.gender && person.gender !== 'unknown');
    const hasBirthDate = Boolean(person.birthDate || person.birthDateApprox);
    const hasBirthPlace = Boolean(person.birthPlace && person.birthPlace.trim().length > 0);
    const hasDeathDate = Boolean(!person.isLiving ? (person.deathDate || person.deathDateApprox) : true);
    const hasAvatar = Boolean(person.avatarUrl || media.some(m => m.relatedPersonIds?.includes(person.id) && m.type === 'photo'));
    const hasBio = Boolean((person.bio && person.bio.trim().length > 15) || (person.notes && person.notes.trim().length > 15));
    
    const hasParents = relationships.some(r => r.type === 'parent' && r.person2Id === person.id);
    const hasPartner = relationships.some(r => (r.type === 'spouse' || r.type === 'partner') && (r.person1Id === person.id || r.person2Id === person.id));
    const hasChildren = relationships.some(r => r.type === 'parent' && r.person1Id === person.id);
    const hasSources = Boolean((person.sourceIds && person.sourceIds.length > 0) || sources.some(s => s.notes?.includes(person.firstName) || s.notes?.includes(person.lastName)));

    if (hasName) completedFields.push('Nombre y Apellido'); else missingFields.push('Nombre completo');
    if (hasBirthDate) completedFields.push('Fecha de nacimiento'); else missingFields.push('Fecha de nacimiento');
    if (hasBirthPlace) completedFields.push('Lugar de nacimiento'); else missingFields.push('Lugar de nacimiento');
    if (hasAvatar) completedFields.push('Fotografía / Retrato'); else missingFields.push('Fotografía o retrato');
    if (hasBio) completedFields.push('Biografía / Historia'); else missingFields.push('Biografía o historia');
    if (hasParents) completedFields.push('Padres vinculados'); else missingFields.push('Padres vinculados');
    if (hasSources) completedFields.push('Fuentes documentales'); else missingFields.push('Fuentes documentales');

    // Score computation
    let score = 0;
    if (hasName) score += 20;
    if (hasGender) score += 5;
    if (hasBirthDate) score += 15;
    if (hasBirthPlace) score += 10;
    if (hasDeathDate) score += 10;
    if (hasAvatar) score += 15;
    if (hasBio) score += 10;
    if (hasParents) score += 5;
    if (hasSources) score += 10;

    return {
      score: Math.min(100, score),
      completedFields,
      missingFields,
      details: {
        name: hasName,
        gender: hasGender,
        birthDate: hasBirthDate,
        birthPlace: hasBirthPlace,
        deathDate: hasDeathDate,
        avatar: hasAvatar,
        bio: hasBio,
        parents: hasParents,
        partner: hasPartner,
        children: hasChildren,
        sources: hasSources
      }
    };
  }

  /**
   * Main evaluation engine that takes current tree state, computes progress,
   * unlocks achievements, calculates XP, determines level and updates gamification state.
   */
  static evaluateGamificationState(
    tree: Tree | null,
    people: Person[],
    relationships: Relationship[],
    events: FamilyEvent[] = [],
    media: MediaItem[] = [],
    sources: HistoricalSource[] = [],
    members: TreeMember[] = [],
    currentUnlockedIds: Record<string, string> = {},
    streakDays: number = 1,
    equippedTitle?: string
  ): GamificationState {
    const stats = this.calculateTreeStats(people, relationships, events, media, sources, members);
    const newUnlockedMap: Record<string, string> = { ...currentUnlockedIds };
    const newlyUnlockedList: Achievement[] = [];

    // Evaluate each master achievement against stats & tree structure
    const evaluatedAchievements: Achievement[] = this.MASTER_ACHIEVEMENTS.map(ach => {
      let progress = 0;
      const target = ach.target;

      switch (ach.id) {
        // Construction
        case 'const_first_step':
        case 'const_family_moving':
        case 'const_small_family':
        case 'const_large_family':
        case 'const_great_family':
        case 'const_clan':
        case 'const_dynasty':
        case 'const_great_lineage':
        case 'const_encyclopedia':
          progress = stats.personsCount;
          break;

        // Generations
        case 'gen_second':
        case 'gen_third':
        case 'gen_fourth':
        case 'gen_fifth':
        case 'gen_sixth':
        case 'gen_seventh':
        case 'gen_eighth':
        case 'gen_ninth':
        case 'gen_tenth':
        case 'gen_beyond':
          progress = stats.generationsDepth;
          break;

        // Photos
        case 'photo_first':
        case 'photo_album':
        case 'photo_gallery':
        case 'photo_archive':
          progress = stats.photosCount;
          break;
        case 'photo_visual_memory':
        case 'photo_faces_past':
          progress = people.filter(p => p.avatarUrl || media.some(m => m.relatedPersonIds?.includes(p.id) && m.type === 'photo')).length;
          break;
        case 'photo_three_gen':
          progress = Math.min(stats.generationsDepth, stats.photosCount > 0 ? 3 : 0);
          break;
        case 'photo_visual_testimony':
          progress = media.filter(m => m.type === 'photo' && m.historicalDate && m.historicalPlace).length;
          break;

        // Documents
        case 'doc_first':
        case 'doc_apprentice':
        case 'doc_family_archive':
          progress = stats.documentsCount;
          break;
        case 'doc_historic_50': {
          const currentYear = new Date().getFullYear();
          progress = media.filter(m => {
            const y = this.extractYear(m.historicalDate);
            return y && (currentYear - y) >= 50;
          }).length;
          break;
        }
        case 'doc_centennial': {
          const currentYear = new Date().getFullYear();
          progress = media.filter(m => {
            const y = this.extractYear(m.historicalDate);
            return y && (currentYear - y) >= 100;
          }).length;
          break;
        }
        case 'doc_organized':
          progress = media.filter(m => m.title && m.type && (m.historicalDate || m.tags?.length > 0)).length;
          break;

        // Stories
        case 'story_first':
        case 'story_chronicler':
        case 'story_narrator':
          progress = stats.storiesCount;
          break;
        case 'story_immigration':
          progress = events.filter(e => e.type === 'migration' || e.type === 'immigration' || e.type === 'emigration').length;
          break;
        case 'story_oral_memory':
          progress = people.filter(p => (!p.isLiving || (p.birthDate && this.extractYear(p.birthDate)! < 1960)) && p.bio && p.bio.length > 20).length;
          break;

        // Dates & Centuries
        case 'date_first':
        case 'date_calendar':
        case 'date_timeline_100':
          progress = people.filter(p => p.birthDate || p.deathDate).length + events.filter(e => e.date).length;
          break;
        case 'date_century_19':
          progress = people.some(p => {
            const y = this.extractYear(p.birthDate || p.birthDateApprox);
            return y !== null && y >= 1800 && y <= 1899;
          }) ? 1 : 0;
          break;
        case 'date_century_18':
          progress = people.some(p => {
            const y = this.extractYear(p.birthDate || p.birthDateApprox);
            return y !== null && y >= 1700 && y <= 1799;
          }) ? 1 : 0;
          break;
        case 'date_before_1800':
          progress = stats.oldestBirthYear && stats.oldestBirthYear < 1800 ? 1 : 0;
          break;

        // Places & Migration
        case 'place_first':
        case 'place_map_10':
          progress = stats.placesCount;
          break;
        case 'place_international_3':
        case 'place_global_5':
          progress = stats.countriesCount;
          break;
        case 'place_migration_route':
          progress = events.filter(e => (e.type === 'migration' || e.type === 'immigration') && e.place).length;
          break;

        // Surnames
        case 'surname_first':
        case 'surname_five':
        case 'surname_ten':
          progress = stats.surnamesCount;
          break;
        case 'surname_historic_style':
          progress = tree?.settings?.surnameStyles ? Object.keys(tree.settings.surnameStyles).length : 0;
          break;

        // Collaboration
        case 'collab_first_invite':
        case 'collab_first_partner':
        case 'collab_team_3':
        case 'collab_together_5':
          progress = stats.collaboratorsCount;
          break;

        // Verification & Sources
        case 'verif_first':
        case 'verif_inspector_10':
        case 'verif_careful_50':
          progress = stats.verifiedDataCount;
          break;
        case 'source_first':
        case 'source_ten':
        case 'source_fifty':
          progress = stats.sourcesCount;
          break;

        // Preservation
        case 'preserv_first_backup':
          progress = 1; // Unlocked when state exists
          break;
        case 'preserv_digital_legacy':
          progress = stats.completenessAverage >= 70 && stats.personsCount >= 10 ? 1 : 0;
          break;

        // Completeness
        case 'complete_first_100':
        case 'complete_five_100':
        case 'complete_ten_100': {
          const fullCount = people.filter(p => this.calculatePersonCompleteness(p, relationships, media, sources).score >= 90).length;
          progress = fullCount;
          break;
        }

        // Secret Achievements
        case 'secret_traveler':
          progress = (stats.countriesCount >= 2 && events.some(e => e.type === 'migration')) ? 1 : 0;
          break;
        case 'secret_lost_link':
          progress = relationships.length > 5 && stats.generationsDepth >= 4 ? 1 : 0;
          break;
        case 'secret_three_centuries':
          progress = stats.centuriesCount >= 3 ? 3 : stats.centuriesCount;
          break;

        default:
          progress = 0;
      }

      const percent = Math.min(100, Math.round((progress / target) * 100));
      const unlocked = progress >= target;

      if (unlocked && !newUnlockedMap[ach.id]) {
        const nowStr = new Date().toISOString();
        newUnlockedMap[ach.id] = nowStr;
        newlyUnlockedList.push({
          ...ach,
          unlocked: true,
          unlockedAt: nowStr,
          progress,
          percent: 100
        });
      }

      return {
        ...ach,
        unlocked: unlocked || Boolean(newUnlockedMap[ach.id]),
        unlockedAt: newUnlockedMap[ach.id],
        progress: Math.min(progress, target),
        percent: unlocked ? 100 : percent
      };
    });

    // Compute total XP from unlocked achievements + base tree activities
    let totalXp = 0;
    evaluatedAchievements.forEach(ach => {
      if (ach.unlocked) {
        totalXp += ach.xpReward;
      }
    });

    // Add activity XP (people, photos, docs, verified data)
    totalXp += stats.personsCount * 10;
    totalXp += stats.photosCount * 15;
    totalXp += stats.documentsCount * 20;
    totalXp += stats.storiesCount * 20;
    totalXp += stats.sourcesCount * 15;
    totalXp += stats.verifiedDataCount * 10;
    totalXp += (stats.generationsDepth - 1) * 50;

    // Determine current level
    let currentLevel = this.LEVELS[0];
    let nextLevel: ResearcherLevel | null = this.LEVELS[1];

    for (let i = 0; i < this.LEVELS.length; i++) {
      if (totalXp >= this.LEVELS[i].minXp) {
        currentLevel = this.LEVELS[i];
        nextLevel = i < this.LEVELS.length - 1 ? this.LEVELS[i + 1] : null;
      }
    }

    // Progress to next level percent
    let progressToNextLevel = 100;
    if (nextLevel) {
      const levelSpan = nextLevel.minXp - currentLevel.minXp;
      const currentProgress = totalXp - currentLevel.minXp;
      progressToNextLevel = Math.min(100, Math.max(0, Math.round((currentProgress / levelSpan) * 100)));
    }

    // Evaluate collections
    const collections: FamilyCollection[] = this.MASTER_COLLECTIONS.map(col => {
      const totalCount = col.achievementIds.length;
      const completedCount = col.achievementIds.filter(id => Boolean(newUnlockedMap[id])).length;
      const completed = completedCount >= totalCount;
      return {
        ...col,
        totalCount,
        completedCount,
        completed
      };
    });

    // Unlocked Titles list
    const unlockedTitles = this.LEVELS
      .filter(lvl => totalXp >= lvl.minXp)
      .map(lvl => lvl.title);
    
    // Add collection titles if completed
    collections.forEach(col => {
      if (col.completed && !unlockedTitles.includes(col.rewardTitle)) {
        unlockedTitles.push(col.rewardTitle);
      }
    });

    // Generate smart recommendations
    const recommendations = this.generateSmartRecommendations(people, relationships, media, sources, evaluatedAchievements, stats);

    // Generate dynamic missions adapted to current tree state
    const missions = this.generateDynamicMissions(people, relationships, media, sources, stats);

    // Branch progress by surname
    const branchProgress = this.calculateBranchProgress(people, relationships, media, sources);

    return {
      currentXp: totalXp,
      level: currentLevel,
      nextLevel,
      progressToNextLevel,
      equippedTitle: equippedTitle || currentLevel.title,
      streakDays: Math.max(streakDays, 1),
      lastActiveDate: new Date().toISOString(),
      unlockedAchievements: newUnlockedMap,
      completedMissions: {},
      unlockedTitles,
      stats,
      achievements: evaluatedAchievements,
      missions,
      collections,
      recommendations,
      branchProgress,
      recentUnlocks: newlyUnlockedList
    };
  }

  /**
   * Generates dynamic daily & weekly missions adapted to tree status
   */
  static generateDynamicMissions(
    people: Person[],
    relationships: Relationship[],
    media: MediaItem[],
    sources: HistoricalSource[],
    stats: FamilyTreeStats
  ): Mission[] {
    const missions: Mission[] = [];

    // 1. Daily: Missing photo for someone
    const personWithoutPhoto = people.find(p => !p.avatarUrl && !media.some(m => m.relatedPersonIds?.includes(p.id) && m.type === 'photo'));
    if (personWithoutPhoto) {
      missions.push({
        id: 'mission_daily_photo',
        title: 'Misión Diaria: Memoria Visual',
        description: `Agrega una fotografía o retrato de ${personWithoutPhoto.firstName} ${personWithoutPhoto.lastName}.`,
        type: 'daily',
        category: 'photos',
        xpReward: 35,
        progress: 0,
        target: 1,
        completed: false,
        iconName: 'Camera',
        actionHint: 'Subir foto a la galería o editar perfil',
        targetPersonId: personWithoutPhoto.id,
        targetPersonName: `${personWithoutPhoto.firstName} ${personWithoutPhoto.lastName}`
      });
    }

    // 2. Daily: Missing birthdate or birthplace
    const personWithoutBirth = people.find(p => !p.birthDate && !p.birthDateApprox);
    if (personWithoutBirth) {
      missions.push({
        id: 'mission_daily_birth',
        title: 'Misión Diaria: Fecha de Origen',
        description: `Investiga y registra la fecha de nacimiento de ${personWithoutBirth.firstName} ${personWithoutBirth.lastName}.`,
        type: 'daily',
        category: 'dates',
        xpReward: 25,
        progress: 0,
        target: 1,
        completed: false,
        iconName: 'Calendar',
        actionHint: 'Completar fecha aproximada o exacta',
        targetPersonId: personWithoutBirth.id,
        targetPersonName: `${personWithoutBirth.firstName} ${personWithoutBirth.lastName}`
      });
    }

    // 3. Daily: Verification of 2 data points
    const unverifiedPeople = people.filter(p => p.certainty !== 'confirmed').length;
    missions.push({
      id: 'mission_daily_verify',
      title: 'Misión Diaria: Control de Calidad',
      description: 'Revisa y marca 2 registros con grado de certeza confirmado.',
      type: 'daily',
      category: 'verification',
      xpReward: 40,
      progress: Math.min(2, Math.max(0, 2 - unverifiedPeople)),
      target: 2,
      completed: unverifiedPeople === 0 && people.length > 2,
      iconName: 'ShieldCheck',
      actionHint: 'Verificar datos en detalle de familiar'
    });

    // 4. Weekly: Add 3 new family members
    missions.push({
      id: 'mission_weekly_expand',
      title: 'Desafío Semanal: Nuevas Ramas',
      description: 'Agrega al menos 3 nuevos familiares para expandir el linaje.',
      type: 'weekly',
      category: 'construction',
      xpReward: 150,
      progress: Math.min(3, stats.personsCount % 5),
      target: 3,
      completed: false,
      iconName: 'Users',
      actionHint: 'Agregar padres, hermanos o cónyuges'
    });

    // 5. Weekly: Attach historical sources
    missions.push({
      id: 'mission_weekly_sources',
      title: 'Desafío Semanal: Respaldo Documental',
      description: 'Vincular 3 fuentes históricas (actas, certificados o registros civiles).',
      type: 'weekly',
      category: 'sources',
      xpReward: 120,
      progress: Math.min(3, stats.sourcesCount),
      target: 3,
      completed: stats.sourcesCount >= 3,
      iconName: 'BookOpen',
      actionHint: 'Crear fuentes en la pestaña Fuentes'
    });

    // 6. Special Campaign Event: "Mes de los Abuelos y Sabiduría"
    missions.push({
      id: 'mission_event_grandparents',
      title: 'Evento Especial: Mes de los Abuelos',
      description: 'Documenta los recuerdos y fecha de nacimiento de al menos 2 abuelos en el linaje.',
      type: 'special_event',
      category: 'stories',
      xpReward: 250,
      progress: Math.min(2, stats.generationsDepth >= 3 ? 2 : 1),
      target: 2,
      completed: stats.generationsDepth >= 3,
      iconName: 'Heart',
      actionHint: 'Completar historias en 3ra generación',
      expiresIn: 'Evento Activo de Temporada'
    });

    return missions;
  }

  /**
   * Generates intelligent recommendations that guide the user to the next rewarding milestone
   */
  static generateSmartRecommendations(
    people: Person[],
    relationships: Relationship[],
    media: MediaItem[],
    sources: HistoricalSource[],
    achievements: Achievement[],
    stats: FamilyTreeStats
  ): SmartRecommendation[] {
    const recs: SmartRecommendation[] = [];

    // Find nearest locked achievements
    const nearestAchievements = achievements
      .filter(a => !a.unlocked && a.percent >= 50 && a.percent < 100)
      .sort((a, b) => b.percent - a.percent);

    nearestAchievements.slice(0, 2).forEach(ach => {
      const remaining = ach.target - ach.progress;
      recs.push({
        id: `rec_ach_${ach.id}`,
        type: 'achievement_near',
        title: `🏆 A solo ${remaining} de desbloquear "${ach.title}"`,
        description: `Tu árbol tiene ${ach.progress}/${ach.target} completado. ${ach.description}`,
        targetAchievementId: ach.id,
        targetAchievementTitle: ach.title,
        actionType: 'achievement_progress',
        xpPotential: ach.xpReward,
        urgency: 'high'
      });
    });

    // Check for missing parents on oldest generation
    const peopleWithoutParents = people.filter(p => !relationships.some(r => r.type === 'parent' && r.person2Id === p.id));
    if (peopleWithoutParents.length > 0 && stats.generationsDepth < 6) {
      const topPerson = peopleWithoutParents[0];
      recs.push({
        id: `rec_parents_${topPerson.id}`,
        type: 'missing_parent',
        title: `🌳 Descubre la generación de ${topPerson.firstName} ${topPerson.lastName}`,
        description: `Sabemos sobre ${topPerson.firstName}, pero sus padres aún no están registrados. Agregar un antepasado avanzará tu profundidad generacional.`,
        personId: topPerson.id,
        personName: `${topPerson.firstName} ${topPerson.lastName}`,
        actionType: 'add_parent',
        xpPotential: 100,
        urgency: 'medium'
      });
    }

    // Check for branch with no photos
    const personNoPhoto = people.find(p => !p.avatarUrl && !media.some(m => m.relatedPersonIds?.includes(p.id)));
    if (personNoPhoto) {
      recs.push({
        id: `rec_photo_${personNoPhoto.id}`,
        type: 'missing_photo',
        title: `📷 Rostro pendiente: ${personNoPhoto.firstName} ${personNoPhoto.lastName}`,
        description: `Subir una foto a este perfil otorgará +15 XP y avanzará en la colección "Memoria y Rostros".`,
        personId: personNoPhoto.id,
        personName: `${personNoPhoto.firstName} ${personNoPhoto.lastName}`,
        actionType: 'upload_photo',
        xpPotential: 50,
        urgency: 'low'
      });
    }

    // Check for missing sources
    if (stats.sourcesCount < 5 && stats.personsCount > 10) {
      recs.push({
        id: 'rec_sources_needed',
        type: 'missing_source',
        title: '📜 Respalda tus descubrimientos con fuentes',
        description: 'Vincular actas de nacimiento o archivos históricos eleva el grado de certeza del árbol familiar.',
        actionType: 'add_source',
        xpPotential: 75,
        urgency: 'medium'
      });
    }

    return recs;
  }

  /**
   * Calculates genealogy branch analysis grouped by surname
   */
  static calculateBranchProgress(
    people: Person[],
    relationships: Relationship[],
    media: MediaItem[],
    sources: HistoricalSource[]
  ): BranchProgress[] {
    const surnameGroups: Record<string, Person[]> = {};

    people.forEach(p => {
      const sn = p.lastName ? p.lastName.trim() : 'Sin apellido';
      if (!surnameGroups[sn]) surnameGroups[sn] = [];
      surnameGroups[sn].push(p);
    });

    const results: BranchProgress[] = [];

    Object.entries(surnameGroups).forEach(([surname, members]) => {
      if (members.length === 0) return;

      const memberIds = members.map(m => m.id);
      const branchMedia = media.filter(m => m.relatedPersonIds?.some(id => memberIds.includes(id)));
      const photosCount = branchMedia.filter(m => m.type === 'photo').length;
      const documentsCount = branchMedia.filter(m => m.type !== 'photo').length;

      // Oldest ancestor in branch
      let oldestAncestor: string | undefined = undefined;
      let oldestYear = 9999;
      members.forEach(m => {
        const y = this.extractYear(m.birthDate || m.birthDateApprox);
        if (y && y < oldestYear) {
          oldestYear = y;
          oldestAncestor = `${m.firstName} ${m.lastName} (${y})`;
        }
      });

      // Average completeness
      let compSum = 0;
      members.forEach(m => {
        compSum += this.calculatePersonCompleteness(m, relationships, media, sources).score;
      });
      const completenessPercent = Math.round(compSum / members.length);

      // Depth of this branch
      const branchDepth = this.calculateGenerationsDepth(members, relationships);

      results.push({
        surname,
        personCount: members.length,
        generationsDepth: branchDepth,
        photosCount,
        documentsCount,
        sourcesCount: sources.filter(s => members.some(m => s.notes?.includes(m.firstName))).length,
        completenessPercent,
        oldestAncestor
      });
    });

    return results.sort((a, b) => b.personCount - a.personCount);
  }

  /**
   * Plays a celebratory chime sound using browser Web Audio API (zero external assets needed)
   */
  static playAchievementSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major celebratory chord)
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }
}
