import React, { useState } from 'react';
import { 
  Settings, Shield, Globe, Lock, Save, X, Plus, 
  Trash2, Check, FolderTree, Sparkles, AlertTriangle 
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { VisibilityLevel } from '../../types';

interface TreeSettingsModalProps {
  initialTab?: 'settings' | 'create' | 'list';
  onClose: () => void;
}

export const TreeSettingsModal: React.FC<TreeSettingsModalProps> = ({
  initialTab = 'settings',
  onClose
}) => {
  const { trees, activeTree, updateTree, createTree, deleteTree, selectTree } = useTree();

  const [activeModalTab, setActiveModalTab] = useState<'settings' | 'create' | 'list'>(initialTab);

  // Edit current tree form state
  const [name, setName] = useState(activeTree?.name || '');
  const [description, setDescription] = useState(activeTree?.description || '');
  const [visibility, setVisibility] = useState<VisibilityLevel>(activeTree?.visibility || 'shared');
  const [hideLiving, setHideLiving] = useState<boolean>(activeTree?.settings?.hideLivingDetails ?? true);
  const [requireApproval, setRequireApproval] = useState<boolean>(activeTree?.settings?.requireProposalApproval ?? true);

  // Create new tree form state
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDescription, setNewFamilyDescription] = useState('');
  const [newFamilyVisibility, setNewFamilyVisibility] = useState<VisibilityLevel>('public');
  const [startWithRootPerson, setStartWithRootPerson] = useState<boolean>(true);
  const [rootPersonFirstName, setRootPersonFirstName] = useState('');
  const [rootPersonLastName, setRootPersonLastName] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleUpdateCurrentTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await updateTree({
        name: name.trim(),
        description: description.trim(),
        visibility,
        settings: {
          ...activeTree?.settings,
          hideLivingDetails: hideLiving,
          livingAgeThreshold: activeTree?.settings?.livingAgeThreshold || 100,
          defaultRoleForInvites: activeTree?.settings?.defaultRoleForInvites || 'collaborator',
          allowPublicRequests: true,
          requireProposalApproval: requireApproval,
          showCommentsToPublic: true
        }
      });
      setFeedbackMsg('Ajustes guardados correctamente');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error updating tree settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    setSaving(true);
    try {
      await createTree(
        {
          name: newFamilyName.trim(),
          description: newFamilyDescription.trim(),
          visibility: newFamilyVisibility
        },
        {
          startWithRootPerson,
          rootPersonName: rootPersonFirstName.trim() || undefined,
          rootPersonLastName: rootPersonLastName.trim() || undefined
        }
      );
      setFeedbackMsg(`Familia "${newFamilyName}" creada con éxito`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error creating new family:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTree = async (treeId: string, treeName: string) => {
    const isOnlyOne = trees.length <= 1;
    const confirmMessage = isOnlyOne
      ? `¿Eliminar "${treeName}"? Como es la única familia, se creará un nuevo árbol limpio en blanco.`
      : `¿Estás completamente seguro de eliminar la familia "${treeName}" y todos sus integrantes registrados? Esta acción no se puede deshacer.`;

    if (window.confirm(confirmMessage)) {
      setSaving(true);
      try {
        await deleteTree(treeId);
        setFeedbackMsg(`Familia eliminada correctamente`);
        setTimeout(() => setFeedbackMsg(null), 2000);
      } catch (err) {
        console.error('Error deleting tree:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <FolderTree className="w-5 h-5 text-[#F5F2ED]" />
            <h2 className="font-serif font-bold text-lg">
              Gestión de Familias y Árboles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2ED] px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveModalTab('settings')}
            className={`px-4 py-2 text-xs font-sans font-semibold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeModalTab === 'settings'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Editar Árbol Actual</span>
          </button>

          <button
            onClick={() => setActiveModalTab('create')}
            className={`px-4 py-2 text-xs font-sans font-semibold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeModalTab === 'create'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>+ Crear Nueva Familia</span>
          </button>

          <button
            onClick={() => setActiveModalTab('list')}
            className={`px-4 py-2 text-xs font-sans font-semibold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeModalTab === 'list'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] rounded-t-xl'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Mis Familias ({trees.length})</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="bg-emerald-50 text-emerald-800 px-6 py-2.5 text-xs font-medium border-b border-emerald-200 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* TAB 1: Edit Current Tree */}
        {activeModalTab === 'settings' && (
          <form onSubmit={handleUpdateCurrentTree} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
            <div className="bg-[#F5F2ED] p-3 rounded-2xl border border-[#D1CEC7] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7C796F] tracking-wider block">Árbol Activo</span>
                <span className="font-serif font-bold text-[#434331] text-base">{activeTree?.name}</span>
              </div>
              <span className="text-xs bg-[#E5E2D9] px-2.5 py-1 rounded-full text-[#5A5A40] font-semibold">
                Activo
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Nombre del Árbol Familiar *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Familia Cantero & Rossi"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Descripción & Linaje Principal
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Linaje familiar originario de Asturias e Italia hacia el Río de la Plata..."
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-2">
                Nivel de Visibilidad Global
              </label>
              
              <div className="space-y-2">
                <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  visibility === 'public' ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#434331]' : 'border-[#D1CEC7] bg-white text-[#7C796F]'
                }`}>
                  <input
                    type="radio"
                    name="vis"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="mt-0.5 text-[#5A5A40]"
                  />
                  <div>
                    <div className="font-serif font-bold flex items-center space-x-1.5 text-[#434331]">
                      <Globe className="w-4 h-4 text-[#5A5A40]" />
                      <span>Público</span>
                    </div>
                    <p className="text-[11px] text-[#7C796F] font-serif">
                      Accesible por enlace web sin login. Personas vivas protegidas automáticamente.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  visibility === 'shared' ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#434331]' : 'border-[#D1CEC7] bg-white text-[#7C796F]'
                }`}>
                  <input
                    type="radio"
                    name="vis"
                    value="shared"
                    checked={visibility === 'shared'}
                    onChange={() => setVisibility('shared')}
                    className="mt-0.5 text-[#5A5A40]"
                  />
                  <div>
                    <div className="font-serif font-bold flex items-center space-x-1.5 text-[#434331]">
                      <Shield className="w-4 h-4 text-[#5A5A40]" />
                      <span>Familiar (Compartido por invitación)</span>
                    </div>
                    <p className="text-[11px] text-[#7C796F] font-serif">
                      Solo los familiares invitados o con solicitud aprobada pueden explorar el árbol.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  visibility === 'private' ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#434331]' : 'border-[#D1CEC7] bg-white text-[#7C796F]'
                }`}>
                  <input
                    type="radio"
                    name="vis"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="mt-0.5 text-[#5A5A40]"
                  />
                  <div>
                    <div className="font-serif font-bold flex items-center space-x-1.5 text-[#434331]">
                      <Lock className="w-4 h-4 text-[#5A5A40]" />
                      <span>Privado Estricto</span>
                    </div>
                    <p className="text-[11px] text-[#7C796F] font-serif">
                      Solo el creador del árbol puede ver o editar la información.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] space-y-2.5">
              <h4 className="font-serif font-bold text-[#434331] text-xs">Reglas de Privacidad y Calidad</h4>
              
              <label className="flex items-center space-x-2 text-xs text-[#434331] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideLiving}
                  onChange={e => setHideLiving(e.target.checked)}
                  className="w-4 h-4 text-[#5A5A40] rounded border-[#D1CEC7]"
                />
                <span>Ocultar datos personales y apellidos de personas vivas en vista pública</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-[#434331] cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={e => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 text-[#5A5A40] rounded border-[#D1CEC7]"
                />
                <span>Exigir aprobación del propietario para cambios enviados por colaboradores</span>
              </label>
            </div>

            <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-between">
              {activeTree && (
                <button
                  type="button"
                  onClick={() => handleDeleteTree(activeTree.id, activeTree.name)}
                  className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar este Árbol</span>
                </button>
              )}

              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : 'Guardar Ajustes'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Create New Family */}
        {activeModalTab === 'create' && (
          <form onSubmit={handleCreateNewFamily} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
            <div className="bg-[#5A5A40]/10 p-3 rounded-2xl border border-[#5A5A40]/30 text-[#434331] text-xs">
              <p className="font-semibold flex items-center space-x-1 text-[#5A5A40]">
                <Sparkles className="w-4 h-4" />
                <span>Nueva Familia Independiente</span>
              </p>
              <p className="text-[11px] text-[#7C796F] mt-1">
                Al crear una nueva familia se generará un linaje completamente nuevo y limpio, sin mezclar datos con tus árboles anteriores.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Nombre de la Familia o Árbol *
              </label>
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={e => {
                  setNewFamilyName(e.target.value);
                  if (!rootPersonLastName) {
                    const cleaned = e.target.value.replace(/^(árbol|familia|arbol|family|de|los|las)\s+/i, '').trim();
                    setRootPersonLastName(cleaned);
                  }
                }}
                placeholder="Ej: Familia Morales o Árbol Rossi"
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Descripción / Origen Geográfico
              </label>
              <textarea
                rows={2}
                value={newFamilyDescription}
                onChange={e => setNewFamilyDescription(e.target.value)}
                placeholder="Ej: Linaje familiar originario de Galicia, España..."
                className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                Plantilla Inicial de Inicio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <label className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-start space-x-2.5 ${
                  startWithRootPerson ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#434331]' : 'border-[#D1CEC7] bg-white text-[#7C796F]'
                }`}>
                  <input
                    type="radio"
                    name="template"
                    checked={startWithRootPerson}
                    onChange={() => setStartWithRootPerson(true)}
                    className="mt-1 text-[#5A5A40]"
                  />
                  <div>
                    <span className="font-semibold font-serif block text-xs text-[#434331]">Tarjeta Inicial con (+)</span>
                    <span className="text-[11px] text-[#7C796F]">Inicia con una ficha principal lista para invitar o expandir.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-start space-x-2.5 ${
                  !startWithRootPerson ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#434331]' : 'border-[#D1CEC7] bg-white text-[#7C796F]'
                }`}>
                  <input
                    type="radio"
                    name="template"
                    checked={!startWithRootPerson}
                    onChange={() => setStartWithRootPerson(false)}
                    className="mt-1 text-[#5A5A40]"
                  />
                  <div>
                    <span className="font-semibold font-serif block text-xs text-[#434331]">Lienzo en Blanco</span>
                    <span className="text-[11px] text-[#7C796F]">Empieza completamente vacío sin ninguna persona inicial.</span>
                  </div>
                </label>
              </div>
            </div>

            {startWithRootPerson && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <span className="text-xs font-serif font-bold text-[#434331] block">
                  Datos de la Ficha Inicial (Familiar Raíz):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#7C796F] block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={rootPersonFirstName}
                      onChange={e => setRootPersonFirstName(e.target.value)}
                      placeholder="Ej: Juan o María"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-xs text-[#434331]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#7C796F] block mb-1">Apellido Familiar</label>
                    <input
                      type="text"
                      value={rootPersonLastName}
                      onChange={e => setRootPersonLastName(e.target.value)}
                      placeholder="Ej: Morales"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-xs text-[#434331]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !newFamilyName.trim()}
                className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{saving ? 'Creando...' : 'Crear Familia'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: List & Manage All Families */}
        {activeModalTab === 'list' && (
          <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#7C796F]">
                Todas las Familias ({trees.length})
              </span>
              <button
                onClick={() => setActiveModalTab('create')}
                className="text-xs text-[#5A5A40] hover:text-[#434331] font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Crear Otra Familia</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {trees.map((t) => {
                const isActive = activeTree?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive ? 'bg-[#5A5A40]/10 border-[#5A5A40]' : 'bg-white border-[#E5E2D9] hover:border-[#D1CEC7]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-[#434331] text-sm truncate">{t.name}</span>
                        {isActive && (
                          <span className="bg-[#5A5A40] text-white text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7C796F] truncate mt-0.5 font-serif italic">
                        {t.description || 'Sin descripción'}
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] text-[#9A968A] mt-1 font-sans">
                        <span>Creado: {t.createdAt?.slice(0, 10) || 'Reciente'}</span>
                        <span>•</span>
                        <span className="capitalize">{t.visibility === 'public' ? '🌐 Público' : '🔒 Privado'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {!isActive && (
                        <button
                          onClick={async () => {
                            await selectTree(t.id);
                            setFeedbackMsg(`Cambiado a "${t.name}"`);
                            setTimeout(() => onClose(), 600);
                          }}
                          className="bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Abrir
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTree(t.id, t.name)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title={`Eliminar familia "${t.name}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E5E2D9] flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#5A5A40] hover:bg-[#434331] text-white rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

