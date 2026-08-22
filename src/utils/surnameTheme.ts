import { SurnameStyle } from '../types';

export interface SurnamePreset {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  cardBgLight: string;
}

export const SURNAME_PRESETS: SurnamePreset[] = [
  {
    id: 'emerald',
    name: 'Verde Esmeralda Dinástico',
    bgColor: '#244234',
    textColor: '#FFFFFF',
    borderColor: '#C5A059',
    accentColor: '#4ADE80',
    cardBgLight: '#F2F7F4'
  },
  {
    id: 'bordeaux',
    name: 'Vino Borgoña Imperial',
    bgColor: '#5C1D24',
    textColor: '#FFFFFF',
    borderColor: '#E5C378',
    accentColor: '#F87171',
    cardBgLight: '#FAF0F1'
  },
  {
    id: 'navy',
    name: 'Azul Marino Real',
    bgColor: '#1B2A4A',
    textColor: '#FFFFFF',
    borderColor: '#D4AF37',
    accentColor: '#60A5FA',
    cardBgLight: '#F0F4FA'
  },
  {
    id: 'ochre',
    name: 'Ocre Dorado Antiguo',
    bgColor: '#7D5A2B',
    textColor: '#FFFFFF',
    borderColor: '#EADBB6',
    accentColor: '#FBBF24',
    cardBgLight: '#FAF7F0'
  },
  {
    id: 'terracotta',
    name: 'Terracota Cálida',
    bgColor: '#8B4526',
    textColor: '#FFFFFF',
    borderColor: '#F2D5BA',
    accentColor: '#FB923C',
    cardBgLight: '#FAF3F0'
  },
  {
    id: 'slate',
    name: 'Pizarra Clásica',
    bgColor: '#34424D',
    textColor: '#FFFFFF',
    borderColor: '#B0BEC5',
    accentColor: '#94A3B8',
    cardBgLight: '#F1F4F6'
  },
  {
    id: 'plum',
    name: 'Púrpura Noble',
    bgColor: '#4A234A',
    textColor: '#FFFFFF',
    borderColor: '#D8B4E2',
    accentColor: '#C084FC',
    cardBgLight: '#F7F0F7'
  },
  {
    id: 'sage',
    name: 'Verde Salvia',
    bgColor: '#465945',
    textColor: '#FFFFFF',
    borderColor: '#C2D6C0',
    accentColor: '#86EFAC',
    cardBgLight: '#F3F6F3'
  },
  {
    id: 'obsidian',
    name: 'Obsidiana & Oro',
    bgColor: '#262626',
    textColor: '#FFFFFF',
    borderColor: '#D4AF37',
    accentColor: '#EAB308',
    cardBgLight: '#F5F5F5'
  },
  {
    id: 'parchment',
    name: 'Pergamino Sepia',
    bgColor: '#5A5A40',
    textColor: '#FFFFFF',
    borderColor: '#D1CEC7',
    accentColor: '#F5F2ED',
    cardBgLight: '#FDFBF7'
  }
];

export const getSurnameStyle = (
  surname?: string,
  customStyles?: Record<string, SurnameStyle>
): SurnamePreset => {
  if (!surname || !surname.trim()) {
    return SURNAME_PRESETS[9]; // Parchment default
  }

  const cleanKey = surname.trim().toLowerCase();

  // 1. Check if user configured a custom style for this surname
  if (customStyles && customStyles[cleanKey]) {
    const custom = customStyles[cleanKey];
    return {
      id: `custom-${cleanKey}`,
      name: `Personalizado (${surname})`,
      bgColor: custom.bgColor,
      textColor: custom.textColor || '#FFFFFF',
      borderColor: custom.borderColor || '#C5A059',
      accentColor: custom.accentColor || custom.bgColor,
      cardBgLight: '#FDFBF7'
    };
  }

  // 2. Deterministic hash to assign an automatic elegant preset
  let hash = 0;
  for (let i = 0; i < cleanKey.length; i++) {
    hash = cleanKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SURNAME_PRESETS.length;
  return SURNAME_PRESETS[index];
};
