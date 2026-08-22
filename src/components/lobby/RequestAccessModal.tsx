/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, UserPlus, CheckCircle, AlertTriangle, 
  GitBranch, Users, Sparkles, Send, Info, Eye, Edit3, Trash2
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { useAuth } from '../../context/AuthContext';
import { PermissionAction, PermissionScopeType } from '../../types/familyLobby';

export const RequestAccessModal: React.FC = () => {
  const { 
    selectedFamilyForRequest, 
    requestInitialScope, 
    closeModals, 
    submitPermissionRequest 
  } = useFamilyLobby();

  const { currentUser } = useAuth();

  const [permissions, setPermissions] = useState<PermissionAction[]>(['VIEW', 'CREATE', 'EDIT']);
  const [scope, setScope] = useState<PermissionScopeType>(requestInitialScope?.scope || 'FAMILY');
  const [targetBranchId, setTargetBranchId] = useState<string>(requestInitialScope?.branchId || '');
  const [targetSurname, setTargetSurname] = useState<string>(requestInitialScope?.surname || '');
  
  const [familyRelation, setFamilyRelation] = useState('');
  const [contributionIntent, setContributionIntent] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (requestInitialScope) {
      if (requestInitialScope.scope) setScope(requestInitialScope.scope);
      if (requestInitialScope.branchId) setTargetBranchId(requestInitialScope.branchId);
      if (requestInitialScope.surname) setTargetSurname(requestInitialScope.surname);
    }
  }, [requestInitialScope]);

  if (!selectedFamilyForRequest) return null;

  const family = selectedFamilyForRequest;

  const handleTogglePermission = (action: PermissionAction) => {
    if (action === 'VIEW') return; // VIEW is always required
    setPermissions(prev => 
      prev.includes(action) ? prev.filter(p => p !== action) : [...prev, action]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyRelation.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedBranch = family.branches.find(b => b.id === targetBranchId);

      await submitPermissionRequest({
        familyId: family.id,
        familyName: family.name,
        requestedPermissions: permissions,
        scope,
        targetBranchId: scope === 'BRANCH' ? targetBranchId : undefined,
        targetBranchName: scope === 'BRANCH' && selectedBranch ? selectedBranch.name : undefined,
        targetSurname: scope === 'SURNAME' ? targetSurname : undefined,
        familyRelation: familyRelation.trim(),
        contributionIntent: contributionIntent.trim() || 'Aporte de datos y memoria familiar',
        message: message.trim() || `Hola ${family.ownerName}, solicito acceso para colaborar en ${family.name}.`
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-2.5">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Solicitar Acceso y Colaboración
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8]">
                {family.name} · Propietario: {family.ownerName}
              </p>
            </div>
          </div>
          <button
            onClick={closeModals}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#434331] dark:text-[#F8FAFC]">
              ¡Solicitud Enviada con Éxito!
            </h3>
            <p className="text-xs sm:text-sm text-[#7C796F] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              El propietario del árbol (<strong>{family.ownerName}</strong>) ha recibido tu petición. Podrá revisar tus vínculos familiares, aprobar o adaptar los permisos solicitados.
            </p>
            <div className="p-4 bg-[#F5F2ED] dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#5A5A40] dark:text-[#CBD5E1] max-w-sm mx-auto">
              <span className="font-semibold block mb-1">Permisos solicitados:</span>
              <span>{permissions.join(', ')} · Alcance: {scope}</span>
            </div>
            <button
              onClick={closeModals}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#5A5A40] dark:bg-amber-600 text-white text-xs font-semibold hover:bg-[#434331] cursor-pointer"
            >
              Entendido y Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Step 1: Permissions Selector */}
            <div className="space-y-2">
              <label className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC] block">
                1. ¿Qué nivel de permisos deseas solicitar?
              </label>
              <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                El principio de mínimo privilegio asegura que sólo accedas a lo necesario.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* VIEW */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] flex items-start space-x-2.5 opacity-90">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="mt-0.5 rounded text-[#5A5A40]"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#434331] dark:text-[#F8FAFC] block">
                      Visualizar información (VIEW)
                    </span>
                    <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                      Consultar personas, fechas y biografías públicas.
                    </span>
                  </div>
                </div>

                {/* CREATE */}
                <div 
                  onClick={() => handleTogglePermission('CREATE')}
                  className={`p-3 rounded-2xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                    permissions.includes('CREATE')
                      ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700'
                      : 'bg-white dark:bg-[#1E293B] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes('CREATE')}
                    onChange={() => handleTogglePermission('CREATE')}
                    className="mt-0.5 rounded text-amber-600"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#434331] dark:text-[#F8FAFC] block">
                      Agregar parientes (CREATE)
                    </span>
                    <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                      Incorporar nuevos hijos, cónyuges y fotografías.
                    </span>
                  </div>
                </div>

                {/* EDIT */}
                <div 
                  onClick={() => handleTogglePermission('EDIT')}
                  className={`p-3 rounded-2xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                    permissions.includes('EDIT')
                      ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700'
                      : 'bg-white dark:bg-[#1E293B] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes('EDIT')}
                    onChange={() => handleTogglePermission('EDIT')}
                    className="mt-0.5 rounded text-amber-600"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#434331] dark:text-[#F8FAFC] block">
                      Editar datos existentes (EDIT)
                    </span>
                    <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                      Corregir fechas, lugares y biografías.
                    </span>
                  </div>
                </div>

                {/* DELETE */}
                <div 
                  onClick={() => handleTogglePermission('DELETE')}
                  className={`p-3 rounded-2xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                    permissions.includes('DELETE')
                      ? 'bg-red-50/60 dark:bg-red-950/40 border-red-400 dark:border-red-700'
                      : 'bg-white dark:bg-[#1E293B] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes('DELETE')}
                    onChange={() => handleTogglePermission('DELETE')}
                    className="mt-0.5 rounded text-red-600"
                  />
                  <div>
                    <span className="font-semibold text-xs text-red-900 dark:text-red-300 block flex items-center space-x-1">
                      <span>Eliminar registros (DELETE)</span>
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                    </span>
                    <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                      Operación de alto riesgo para purgar duplicados.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Scope Selector */}
            <div className="space-y-2">
              <label className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC] block">
                2. Alcance territorial / genealógico (Scope)
              </label>
              <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                Define en qué sección específica del árbol deseas colaborar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setScope('FAMILY')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    scope === 'FAMILY'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#434331] dark:text-[#E2E8F0] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <span className="font-serif font-bold text-xs block">🌳 Árbol Completo</span>
                  <span className={`text-[10px] ${scope === 'FAMILY' ? 'text-white/80' : 'text-[#7C796F] dark:text-[#94A3B8]'}`}>
                    Todas las ramas y apellidos
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('BRANCH')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    scope === 'BRANCH'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#434331] dark:text-[#E2E8F0] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <span className="font-serif font-bold text-xs block">🌿 Rama Específica</span>
                  <span className={`text-[10px] ${scope === 'BRANCH' ? 'text-white/80' : 'text-[#7C796F] dark:text-[#94A3B8]'}`}>
                    Una línea genealógica concreta
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('SURNAME')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    scope === 'SURNAME'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#434331] dark:text-[#E2E8F0] border-[#D1CEC7] dark:border-[#334155]'
                  }`}
                >
                  <span className="font-serif font-bold text-xs block">📜 Apellido Específico</span>
                  <span className={`text-[10px] ${scope === 'SURNAME' ? 'text-white/80' : 'text-[#7C796F] dark:text-[#94A3B8]'}`}>
                    Solo registros de un apellido
                  </span>
                </button>
              </div>

              {/* Dynamic Branch Dropdown if BRANCH is selected */}
              {scope === 'BRANCH' && (
                <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] animate-in fade-in">
                  <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                    Selecciona la rama en la que deseas colaborar:
                  </label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                    required
                  >
                    <option value="">-- Elige una rama --</option>
                    {family.branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.rootPersonName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Surname Input if SURNAME is selected */}
              {scope === 'SURNAME' && (
                <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] animate-in fade-in">
                  <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                    Apellido en el que colaborarás (ej: Cantero, Pérez):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetSurname}
                      onChange={(e) => setTargetSurname(e.target.value)}
                      placeholder="Escribe o selecciona apellido..."
                      className="flex-1 p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {family.surnameTags.map(sn => (
                      <button
                        type="button"
                        key={sn}
                        onClick={() => setTargetSurname(sn)}
                        className="px-2 py-0.5 rounded-md bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-300 text-[10px] font-serif cursor-pointer hover:bg-[#E5E2D9]"
                      >
                        {sn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Relation & Proof Details */}
            <div className="space-y-3">
              <label className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC] block">
                3. Tu Vínculo Familiar & Documentación a Aportar
              </label>

              <div>
                <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                  ¿Cuál es tu parentesco o relación con este árbol? *
                </label>
                <input
                  type="text"
                  value={familyRelation}
                  onChange={(e) => setFamilyRelation(e.target.value)}
                  placeholder="Ej: Soy bisnieto de Bartolomé Cantero por la línea de Gualeguaychú..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0] placeholder-[#9A968A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                  ¿Qué fuentes, fotografías o memorias planeas aportar?
                </label>
                <input
                  type="text"
                  value={contributionIntent}
                  onChange={(e) => setContributionIntent(e.target.value)}
                  placeholder="Ej: Libreta de matrimonio de 1892, 4 fotos familiares y cartas..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0] placeholder-[#9A968A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                  Mensaje personal para {family.ownerName}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Escribe un mensaje para explicar cómo te gustaría colaborar..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0] placeholder-[#9A968A]"
                />
              </div>
            </div>

            {/* Authenticated User Banner */}
            <div className="p-3 bg-[#F5F2ED] dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser?.displayName?.substring(0, 1) || 'U'}
                  </div>
                )}
                <span className="text-[#434331] dark:text-[#F8FAFC]">
                  Solicitante: <strong>{currentUser?.displayName || 'Usuario Google'}</strong> ({currentUser?.email})
                </span>
              </div>
            </div>

            {/* Submit Button Bar */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={closeModals}
                className="px-4 py-2.5 rounded-xl border border-[#D1CEC7] dark:border-[#334155] text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] hover:bg-white dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !familyRelation.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] dark:hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center space-x-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitud al Propietario'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
