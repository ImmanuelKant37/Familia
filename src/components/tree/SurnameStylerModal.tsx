import React, { useState, useMemo } from 'react';
import { 
  Palette, X, Check, RefreshCw, Sparkles, 
  Shield, Layers, Sliders, ChevronRight, Eye 
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { SURNAME_PRESETS, getSurnameStyle, SurnamePreset } from '../../utils/surnameTheme';
import { SurnameStyle } from '../../types';

interface SurnameStylerModalProps {
  onClose: () => void;
}

export const SurnameStylerModal: React.FC<SurnameStylerModalProps> = ({ onClose }) => {
  const { activeTree, people, updateSurnameStyle, removeSurnameStyle } = useTree();

  // Extract all distinct surnames from the tree
  const distinctSurnames = useMemo(() => {
    const counts: Record<string, number> = {};
    people.forEach(p => {
      const s = p.lastName?.trim();
      if (s && !s.startsWith('[')) {
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([surname, count]) => ({ surname, count }));
  }, [people]);

  const [selectedSurname, setSelectedSurname] = useState<string>(
    distinctSurnames.length > 0 ? distinctSurnames[0].surname : 'García'
  );

  const currentStyles = activeTree?.settings?.surnameStyles || {};
  const currentActivePreset = useMemo(() => {
    return getSurnameStyle(selectedSurname, currentStyles);
  }, [selectedSurname, currentStyles]);

  const [customBgColor, setCustomBgColor] = useState<string>(currentActivePreset.bgColor);
  const [customBorderColor, setCustomBorderColor] = useState<string>(currentActivePreset.borderColor);
  const [customTextColor, setCustomTextColor] = useState<string>(currentActivePreset.textColor);
  const [customAccentColor, setCustomAccentColor] = useState<string>(currentActivePreset.accentColor);
  const [saving, setSaving] = useState(false);

  // Sync state when selected surname changes
  const handleSelectSurname = (s: string) => {
    setSelectedSurname(s);
    const style = getSurnameStyle(s, currentStyles);
    setCustomBgColor(style.bgColor);
    setCustomBorderColor(style.borderColor);
    setCustomTextColor(style.textColor);
    setCustomAccentColor(style.accentColor);
  };

  const handleApplyPreset = (preset: SurnamePreset) => {
    setCustomBgColor(preset.bgColor);
    setCustomBorderColor(preset.borderColor);
    setCustomTextColor(preset.textColor);
    setCustomAccentColor(preset.accentColor);
  };

  const handleSave = async () => {
    if (!selectedSurname) return;
    setSaving(true);
    try {
      const newStyle: SurnameStyle = {
        surname: selectedSurname,
        bgColor: customBgColor,
        borderColor: customBorderColor,
        textColor: customTextColor,
        accentColor: customAccentColor
      };
      await updateSurnameStyle(selectedSurname, newStyle);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await removeSurnameStyle(selectedSurname);
      const defaultPreset = getSurnameStyle(selectedSurname, {});
      setCustomBgColor(defaultPreset.bgColor);
      setCustomBorderColor(defaultPreset.borderColor);
      setCustomTextColor(defaultPreset.textColor);
      setCustomAccentColor(defaultPreset.accentColor);
    } finally {
      setSaving(false);
    }
  };

  // Find a sample person with this surname
  const samplePerson = people.find(p => p.lastName?.toLowerCase() === selectedSurname.toLowerCase()) || {
    firstName: 'Santiago',
    lastName: selectedSurname,
    gender: 'M',
    birthDateApprox: '≈ 1885',
    birthPlace: 'Sevilla, España',
    isLiving: false,
    certainty: 'confirmed'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <Palette className="w-5 h-5 text-[#F5F2ED]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">
                Personalizar Fondos y Estilos por Apellido
              </h2>
              <p className="text-[11px] text-[#F5F2ED]/80 font-sans">
                Asigna colores, marcos heráldicos e identidades visuales distintivas a cada linaje
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Surnames List */}
          <div className="md:col-span-4 space-y-2 border-r border-[#E5E2D9] pr-0 md:pr-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-2 flex items-center justify-between">
              <span>Linajes del Árbol</span>
              <span className="text-[10px] bg-[#E5E2D9] px-2 py-0.5 rounded-full font-mono font-normal">
                {distinctSurnames.length}
              </span>
            </h4>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {distinctSurnames.map(({ surname, count }) => {
                const isSelected = selectedSurname.toLowerCase() === surname.toLowerCase();
                const style = getSurnameStyle(surname, currentStyles);
                const hasCustom = Boolean(currentStyles[surname.toLowerCase()]);

                return (
                  <button
                    key={surname}
                    onClick={() => handleSelectSurname(surname)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between transition-all text-xs ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-[#F5F2ED] text-[#434331] border border-[#E5E2D9]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/60 shadow-2xs"
                        style={{ backgroundColor: style.bgColor }}
                      />
                      <span className="font-serif font-bold truncate">{surname}</span>
                      {hasCustom && (
                        <span className={`text-[9px] px-1 rounded uppercase tracking-wider font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-[#5A5A40]/10 text-[#5A5A40]'}`}>
                          Custom
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-sans ${isSelected ? 'text-white/80' : 'text-[#7C796F]'}`}>
                      {count} {count === 1 ? 'familiar' : 'fam.'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Style Customizer & Live Card Preview */}
          <div className="md:col-span-8 space-y-5">
            
            {/* Live Interactive Card Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7C796F] flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Vista Previa de Tarjeta para la Rama «{selectedSurname}»</span>
                </label>
              </div>

              {/* Dynamic Styled Sample Card */}
              <div 
                className="p-4 rounded-2xl border-2 transition-all shadow-md flex items-start space-x-3.5 relative overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: customBorderColor
                }}
              >
                {/* Header ribbon with surname background color */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2.5"
                  style={{ backgroundColor: customBgColor }}
                />

                <div 
                  className="w-12 h-12 rounded-full border-2 shadow-xs flex items-center justify-center font-serif font-bold text-sm shrink-0 mt-1"
                  style={{
                    backgroundColor: customBgColor,
                    borderColor: customBorderColor,
                    color: customTextColor
                  }}
                >
                  {samplePerson.firstName?.[0] || '?'}{samplePerson.lastName?.[0] || ''}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${customBgColor}15`,
                        borderColor: `${customBorderColor}60`,
                        color: customBgColor
                      }}
                    >
                      Linaje {selectedSurname}
                    </span>
                    <span className="text-[10px] text-[#7C796F] font-mono">✓ Confirmado</span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#434331] mt-1 leading-tight">
                    {samplePerson.firstName} {samplePerson.lastName}
                  </h4>
                  <p className="text-xs text-[#7C796F] italic font-serif">
                    {samplePerson.birthDateApprox || '1885'} — {samplePerson.isLiving ? 'Presente' : '1962'}
                  </p>
                  <p className="text-[11px] text-[#9A968A] mt-0.5">
                    📍 {samplePerson.birthPlace || 'Lugar de Origen'}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
                <span>Paletas Nobiliarias y Temas Preestablecidos</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SURNAME_PRESETS.map(preset => {
                  const isCurrentPreset = customBgColor.toLowerCase() === preset.bgColor.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 text-xs ${
                        isCurrentPreset
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 ring-2 ring-[#5A5A40]'
                          : 'border-[#E5E2D9] bg-white hover:bg-[#F5F2ED]'
                      }`}
                    >
                      <span 
                        className="w-4 h-4 rounded-full border border-white/80 shadow-xs shrink-0" 
                        style={{ backgroundColor: preset.bgColor }}
                      />
                      <span className="font-sans font-medium text-[#434331] truncate text-[11px]">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E2D9] space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#434331] flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Ajuste Fino de Colores</span>
              </h5>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#7C796F] mb-1">Color Principal (Fondo / Escudo)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={e => setCustomBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#D1CEC7] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customBgColor}
                      onChange={e => setCustomBgColor(e.target.value)}
                      className="flex-1 bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl px-2 py-1 font-mono text-xs text-[#434331]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#7C796F] mb-1">Color de Ribete / Borde</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customBorderColor}
                      onChange={e => setCustomBorderColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#D1CEC7] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customBorderColor}
                      onChange={e => setCustomBorderColor(e.target.value)}
                      className="flex-1 bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl px-2 py-1 font-mono text-xs text-[#434331]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="text-xs text-[#7C796F] hover:text-[#A65D47] font-medium flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restablecer a color automático</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : `Guardar para ${selectedSurname}`}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
