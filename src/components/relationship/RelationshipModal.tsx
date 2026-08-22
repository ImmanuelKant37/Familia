import React, { useState } from 'react';
import { X, Link2, Plus, Users, UserCheck, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { Person, RelationshipType, CertaintyLevel } from '../../types';
import { useTree } from '../../context/TreeContext';

interface RelationshipModalProps {
  person: Person;
  initialRelType?: RelationshipType | string;
  onClose: () => void;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  person,
  initialRelType,
  onClose
}) => {
  const { people, addRelationship, addPerson, addIndirectRelative } = useTree();

  const isInitialIndirect = initialRelType === 'grandparent' || initialRelType === 'great_grandparent' || initialRelType === 'uncle_aunt' || initialRelType === 'cousin' || initialRelType === 'grandchild' || initialRelType === 'nephew_niece';

  const [mode, setMode] = useState<'existing' | 'new' | 'indirect'>(
    isInitialIndirect ? 'indirect' : initialRelType ? 'new' : 'existing'
  );
  const [targetPersonId, setTargetPersonId] = useState<string>('');
  const [relationType, setRelationType] = useState<RelationshipType>(
    !isInitialIndirect && initialRelType ? (initialRelType as RelationshipType) : 'parent'
  );
  const [relationRole, setRelationRole] = useState<'isParentOf' | 'isChildOf' | 'isSpouseOf'>(
    initialRelType === 'child' ? 'isChildOf' : initialRelType === 'spouse' ? 'isSpouseOf' : 'isParentOf'
  );
  const [customLabel, setCustomLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [certainty, setCertainty] = useState<CertaintyLevel>('confirmed');

  // Indirect relative type
  const [indirectType, setIndirectType] = useState<'grandparent' | 'great_grandparent' | 'uncle_aunt' | 'cousin' | 'grandchild' | 'nephew_niece'>(
    (isInitialIndirect ? initialRelType : 'grandparent') as any
  );

  // New person form fields if mode === 'new' or 'indirect'
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState(person.lastName || '');
  const [newGender, setNewGender] = useState<'M' | 'F' | 'other' | 'unknown'>('unknown');
  const [newBirthYear, setNewBirthYear] = useState('');
  const [newIsLiving, setNewIsLiving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [bridgeNotice, setBridgeNotice] = useState<string | null>(null);

  const availablePeople = people.filter(p => p.id !== person.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBridgeNotice(null);
    try {
      if (mode === 'indirect') {
        const res = await addIndirectRelative({
          fromPersonId: person.id,
          indirectType,
          relativeData: {
            firstName: newFirstName.trim() || undefined,
            lastName: newLastName.trim() || person.lastName,
            gender: newGender,
            birthDateApprox: newBirthYear ? `≈ ${newBirthYear}` : undefined,
            isLiving: newIsLiving,
            certainty
          }
        });

        if (res.bridgePlaceholders.length > 0) {
          // Tell the user that bridge cards were created
          setBridgeNotice(`Se crearon ${res.bridgePlaceholders.length} tarjeta(s) vacía(s) puente para conectar la línea genealógica.`);
        }
        onClose();
        return;
      }

      let linkedPersonId = targetPersonId;

      if (mode === 'new') {
        if (!newFirstName.trim()) return;
        const createdPerson = await addPerson({
          firstName: newFirstName.trim(),
          lastName: newLastName.trim() || person.lastName,
          gender: newGender,
          birthDateApprox: newBirthYear ? `≈ ${newBirthYear}` : undefined,
          isLiving: newIsLiving,
          certainty: 'confirmed'
        });
        linkedPersonId = createdPerson.id;
      }

      if (!linkedPersonId) return;

      // Handle directional relations
      let p1 = person.id;
      let p2 = linkedPersonId;

      if (relationType === 'parent') {
        if (relationRole === 'isParentOf') {
          p1 = linkedPersonId;
          p2 = person.id;
        } else {
          p1 = person.id;
          p2 = linkedPersonId;
        }
      }

      await addRelationship({
        person1Id: p1,
        person2Id: p2,
        type: relationType,
        customTypeLabel: customLabel.trim() || undefined,
        startDate: startDate || undefined,
        notes: notes.trim() || undefined,
        certainty
      });

      onClose();
    } catch (err) {
      console.error('Error creating relationship:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-[#F5F2ED]" />
            <h3 className="font-serif font-bold text-base">
              Conectar Pariente con {person.firstName} {person.lastName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2ED] p-2 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors uppercase tracking-wider ${
              mode === 'existing' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Existente</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors uppercase tracking-wider ${
              mode === 'new' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Directo</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('indirect')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors uppercase tracking-wider ${
              mode === 'indirect' ? 'bg-white shadow-xs text-[#A65D47] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A65D47]" />
            <span>Indirecto / Puente</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
          
          {/* MODE: INDIRECT RELATIVE WITH AUTOMATIC PLACEHOLDER BRIDGES */}
          {mode === 'indirect' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">Generación Automática de Tarjetas Puente</strong>
                  Puedes agregar un pariente indirecto aunque no conozcas los datos intermedios. El sistema creará tarjetas vacías (ej: un padre o abuelo puente) que podrás rellenar en cualquier momento.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1.5">
                  Parentesco Indirecto con {person.firstName}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'grandparent', label: '👴👵 Abuelo / Abuela', desc: 'Crea tarjeta padre si falta' },
                    { id: 'great_grandparent', label: '🏛️ Bisabuelo / Bisabuela', desc: 'Crea padres y abuelos puente' },
                    { id: 'uncle_aunt', label: '👔👒 Tío / Tía', desc: 'Crea abuelos y padres si faltan' },
                    { id: 'cousin', label: '🤝 Primo / Prima', desc: 'Crea tíos, abuelos y padres' },
                    { id: 'grandchild', label: '👶 Nieto / Nieta', desc: 'Crea tarjeta de hijo si falta' },
                    { id: 'nephew_niece', label: '🧒 Sobrino / Sobrina', desc: 'Crea hermano/a puente' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIndirectType(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        indirectType === item.id
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 ring-2 ring-[#5A5A40] font-bold text-[#434331]'
                          : 'border-[#E5E2D9] bg-white text-[#7C796F] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      <div className="font-serif">{item.label}</div>
                      <div className="text-[10px] text-[#9A968A] font-sans mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data of this indirect relative */}
              <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#434331]">
                  Datos del Pariente (Opcional: Si lo dejas en blanco se creará como tarjeta vacía para rellenar)
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[#7C796F] mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={e => setNewFirstName(e.target.value)}
                      placeholder="Ej: Carmen"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7C796F] mb-1">Apellido</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      placeholder="Apellido"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[#7C796F] mb-1">Sexo / Género</label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value as any)}
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    >
                      <option value="unknown">Desconocido</option>
                      <option value="M">Hombre</option>
                      <option value="F">Mujer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#7C796F] mb-1">Año Nacimiento Aprox.</label>
                    <input
                      type="text"
                      value={newBirthYear}
                      onChange={e => setNewBirthYear(e.target.value)}
                      placeholder="Ej: 1910"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE: DIRECT RELATIONSHIP */}
          {mode !== 'indirect' && (
            <>
              {/* Tipo de Relación */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                  Tipo de Parentesco Directo
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as RelationshipType)}
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40]"
                >
                  <option value="parent">Padre / Madre / Hijo / Hija</option>
                  <option value="spouse">Cónyuge / Matrimonio</option>
                  <option value="partner">Pareja / Conviviente</option>
                  <option value="sibling">Hermano / Hermana</option>
                  <option value="guardian">Tutor / Guardián</option>
                  <option value="custom">Parentesco Personalizado</option>
                </select>
              </div>

              {relationType === 'parent' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                    Dirección del Parentesco
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRelationRole('isParentOf')}
                      className={`p-2.5 rounded-2xl border text-left font-medium transition-colors ${
                        relationRole === 'isParentOf'
                          ? 'border-[#5A5A40] bg-[#5A5A40]/15 text-[#434331] font-bold'
                          : 'border-[#D1CEC7] bg-white text-[#7C796F] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      El pariente es Padre/Madre de {person.firstName}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelationRole('isChildOf')}
                      className={`p-2.5 rounded-2xl border text-left font-medium transition-colors ${
                        relationRole === 'isChildOf'
                          ? 'border-[#5A5A40] bg-[#5A5A40]/15 text-[#434331] font-bold'
                          : 'border-[#D1CEC7] bg-white text-[#7C796F] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      El pariente es Hijo/a de {person.firstName}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: Existing Person Dropdown */}
              {mode === 'existing' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                    Selecciona al Pariente del Árbol <span className="text-[#A65D47]">*</span>
                  </label>
                  <select
                    value={targetPersonId}
                    onChange={(e) => setTargetPersonId(e.target.value)}
                    required
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40]"
                  >
                    <option value="">-- Seleccionar Persona --</option>
                    {availablePeople.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} {p.birthDateApprox ? `(${p.birthDateApprox})` : p.birthDate ? `(${p.birthDate.slice(0, 4)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode: New Person Mini Form */}
              {mode === 'new' && (
                <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#434331]">Datos Básicos del Nuevo Pariente</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[#7C796F] mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={newFirstName}
                        onChange={e => setNewFirstName(e.target.value)}
                        placeholder="Nombre"
                        required
                        className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7C796F] mb-1">Apellido *</label>
                      <input
                        type="text"
                        value={newLastName}
                        onChange={e => setNewLastName(e.target.value)}
                        placeholder="Apellido"
                        required
                        className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[#7C796F] mb-1">Sexo / Género</label>
                      <select
                        value={newGender}
                        onChange={e => setNewGender(e.target.value as any)}
                        className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                      >
                        <option value="M">Hombre</option>
                        <option value="F">Mujer</option>
                        <option value="unknown">Desconocido</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#7C796F] mb-1">Año Nacimiento Aprox.</label>
                      <input
                        type="text"
                        value={newBirthYear}
                        onChange={e => setNewBirthYear(e.target.value)}
                        placeholder="Ej: 1890"
                        className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fecha del acontecimiento */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Fecha de la Relación</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    placeholder="Ej: 1885 ó 1885-11-12"
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">Certeza</label>
                  <select
                    value={certainty}
                    onChange={e => setCertainty(e.target.value as CertaintyLevel)}
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                  >
                    <option value="confirmed">Confirmado (Acta Matrimonio / Bautismo)</option>
                    <option value="probable">Probable</option>
                    <option value="estimated">Estimado</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Conectando...' : mode === 'indirect' ? 'Crear Pariente & Nodos Puente' : 'Establecer Parentesco'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

