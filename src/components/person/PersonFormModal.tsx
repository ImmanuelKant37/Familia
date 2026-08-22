import React, { useState } from 'react';
import { X, Save, User, Calendar, MapPin, Briefcase, Globe, Shield, Tag, Trash2 } from 'lucide-react';
import { Person, Gender, CertaintyLevel } from '../../types';

interface PersonFormModalProps {
  person: Person | null; // null = create new
  onClose: () => void;
  onSave: (personData: Partial<Person>) => Promise<void>;
  onDelete?: (personId: string) => Promise<void>;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  person,
  onClose,
  onSave,
  onDelete
}) => {
  const [firstName, setFirstName] = useState(person?.firstName || '');
  const [middleName, setMiddleName] = useState(person?.middleName || '');
  const [lastName, setLastName] = useState(person?.lastName || '');
  const [maidenName, setMaidenName] = useState(person?.maidenName || '');
  const [gender, setGender] = useState<Gender>(person?.gender || 'unknown');
  const [isLiving, setIsLiving] = useState<boolean>(person?.isLiving ?? false);
  const [birthDate, setBirthDate] = useState(person?.birthDate || '');
  const [birthDateApprox, setBirthDateApprox] = useState(person?.birthDateApprox || '');
  const [birthPlace, setBirthPlace] = useState(person?.birthPlace || '');
  const [deathDate, setDeathDate] = useState(person?.deathDate || '');
  const [deathDateApprox, setDeathDateApprox] = useState(person?.deathDateApprox || '');
  const [deathPlace, setDeathPlace] = useState(person?.deathPlace || '');
  const [profession, setProfession] = useState(person?.profession || '');
  const [nationality, setNationality] = useState(person?.nationality || '');
  const [avatarUrl, setAvatarUrl] = useState(person?.avatarUrl || '');
  const [bio, setBio] = useState(person?.bio || '');
  const [aliasesStr, setAliasesStr] = useState((person?.aliases || []).join(', '));
  const [tagsStr, setTagsStr] = useState((person?.tags || []).join(', '));
  const [notes, setNotes] = useState(person?.notes || '');
  const [certainty, setCertainty] = useState<CertaintyLevel>(person?.certainty || 'confirmed');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setSaving(true);
    try {
      const aliases = aliasesStr.split(',').map(s => s.trim()).filter(Boolean);
      const tags = tagsStr.split(',').map(s => {
        const trimmed = s.trim();
        return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      }).filter(s => s.length > 1);

      await onSave({
        ...(person ? { id: person.id } : {}),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        maidenName: maidenName.trim() || undefined,
        gender,
        isLiving,
        birthDate: birthDate || undefined,
        birthDateApprox: birthDateApprox || undefined,
        birthPlace: birthPlace.trim() || undefined,
        deathDate: isLiving ? undefined : (deathDate || undefined),
        deathDateApprox: isLiving ? undefined : (deathDateApprox || undefined),
        deathPlace: isLiving ? undefined : (deathPlace.trim() || undefined),
        profession: profession.trim() || undefined,
        nationality: nationality.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        aliases,
        tags,
        notes: notes.trim() || undefined,
        certainty
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-[#FDFBF7] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <User className="w-5 h-5 text-[#F5F2ED]" />
            <h2 className="font-serif font-bold text-lg text-white">
              {person ? `Editar a ${person.firstName} ${person.lastName}` : 'Registrar Nueva Persona'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Nombre(s) <span className="text-[#A65D47]">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Ej: Mateo"
                required
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Segundo Nombre
              </label>
              <input
                type="text"
                value={middleName}
                onChange={e => setMiddleName(e.target.value)}
                placeholder="Ej: Bautista"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Apellido(s) <span className="text-[#A65D47]">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Ej: Cantero"
                required
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Apellido de Nacimiento / Soltera
              </label>
              <input
                type="text"
                value={maidenName}
                onChange={e => setMaidenName(e.target.value)}
                placeholder="Ej: Rossi (opcional)"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          {/* Género & Estado Vital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E2D9]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Sexo / Género
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
                <option value="other">Otro</option>
                <option value="unknown">No especificado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Estado Vital
              </label>
              <div className="flex items-center space-x-3 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-[#434331]">
                  <input
                    type="checkbox"
                    checked={isLiving}
                    onChange={e => setIsLiving(e.target.checked)}
                    className="w-4 h-4 text-[#5A5A40] rounded border-[#D1CEC7] focus:ring-[#5A5A40]"
                  />
                  <span>Persona Viva (Protección de privacidad)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Nacimiento */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#434331] flex items-center space-x-1.5 font-serif">
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
              <span>Datos de Nacimiento</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#7C796F] mb-1">Fecha Exacta (AAAA-MM-DD)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#7C796F] mb-1">O Fecha Aproximada (ej: ≈ 1852)</label>
                <input
                  type="text"
                  value={birthDateApprox}
                  onChange={e => setBirthDateApprox(e.target.value)}
                  placeholder="Ej: ≈ 1852"
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#7C796F] mb-1">Lugar de Nacimiento</label>
              <input
                type="text"
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                placeholder="Ej: Oviedo, Asturias, España"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              />
            </div>
          </div>

          {/* Defunción (Solo si no está viva) */}
          {!isLiving && (
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#434331] flex items-center space-x-1.5 font-serif">
                <Calendar className="w-4 h-4 text-[#7C796F]" />
                <span>Datos de Fallecimiento</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#7C796F] mb-1">Fecha Exacta</label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={e => setDeathDate(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7C796F] mb-1">O Fecha Aproximada</label>
                  <input
                    type="text"
                    value={deathDateApprox}
                    onChange={e => setDeathDateApprox(e.target.value)}
                    placeholder="Ej: c. 1928"
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#7C796F] mb-1">Lugar de Defunción</label>
                <input
                  type="text"
                  value={deathPlace}
                  onChange={e => setDeathPlace(e.target.value)}
                  placeholder="Ej: Concordia, Entre Ríos, Argentina"
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                />
              </div>
            </div>
          )}

          {/* Profesión, Nacionalidad & Certeza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Profesión / Oficio</label>
              <input
                type="text"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="Ej: Carpintero naval"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Nacionalidad</label>
              <input
                type="text"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                placeholder="Ej: Española / Argentina"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Certeza Genealógica</label>
              <select
                value={certainty}
                onChange={e => setCertainty(e.target.value as CertaintyLevel)}
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              >
                <option value="confirmed">Confirmado (Con Actas)</option>
                <option value="probable">Probable</option>
                <option value="estimated">Estimado / Tradición</option>
              </select>
            </div>
          </div>

          {/* URL Avatar & Apodos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">URL Fotografía / Retrato</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Apodos o Nombres Alternativos</label>
              <input
                type="text"
                value={aliasesStr}
                onChange={e => setAliasesStr(e.target.value)}
                placeholder="Ej: Don Mateo, El Abuelo"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Reseña Biográfica & Historia de Vida</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Narración de la vida, anécdotas o datos relevantes..."
              rows={3}
              className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between gap-3 shrink-0">
            <div>
              {person && onDelete && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`¿Eliminar a "${person.firstName} ${person.lastName}" del árbol definitivamente?`)) {
                      await onDelete(person.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Registro</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#5A5A40] hover:bg-[#434331] text-white px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : person ? 'Guardar Cambios' : 'Crear Persona'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
