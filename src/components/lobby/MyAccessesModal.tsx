/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Key, Shield, Check, X, ArrowRight, Clock, 
  BookOpen, Plus, UserPlus, Compass, AlertCircle
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { useAuth } from '../../context/AuthContext';

export const MyAccessesModal: React.FC = () => {
  const { 
    getUserAccessList, 
    permissionRequests, 
    openLobby, 
    openPublicProfile,
    openRequestAccessModal,
    closeModals 
  } = useFamilyLobby();

  const { currentUser } = useAuth();
  const userAccesses = getUserAccessList();

  const mySentRequests = permissionRequests.filter(r => 
    currentUser && (r.requesterId === currentUser.userId || r.requesterEmail === currentUser.email)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[90vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-2.5">
            <Key className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Mis Accesos & Permisos Genealógicos
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8]">
                {currentUser?.displayName || 'Usuario'} ({currentUser?.email})
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Active Family Accesses */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC] flex items-center justify-between">
              <span>Árboles a los que tienes acceso ({userAccesses.length})</span>
              <button
                onClick={() => openLobby()}
                className="text-xs font-sans text-[#5A5A40] dark:text-amber-400 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explorar más en el Lobby</span>
              </button>
            </h3>

            {userAccesses.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-[#D1CEC7] dark:border-[#334155] space-y-2">
                <Shield className="w-8 h-8 text-[#9A968A] mx-auto opacity-60" />
                <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                  Aún no tienes permisos en árboles familiares. ¡Explora el Lobby para descubrir tus raíces y solicitar acceso a ramas colaborativas!
                </p>
                <button
                  onClick={() => openLobby()}
                  className="mt-2 px-4 py-2 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#434331] cursor-pointer"
                >
                  Abrir Lobby de Familias
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userAccesses.map((acc) => (
                  <div
                    key={acc.family.id}
                    className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                            {acc.family.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                            acc.isOwner 
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300' 
                              : 'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-400'
                          }`}>
                            {acc.roleTitle}
                          </span>
                        </div>
                        <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] mt-0.5">
                          Alcance asignado: <strong className="text-[#434331] dark:text-white">{acc.scopeDescription}</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openPublicProfile(acc.family)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F2ED] dark:bg-[#334155] text-xs font-semibold text-[#434331] dark:text-white hover:bg-[#E5E2D9] transition-colors cursor-pointer"
                        >
                          Ver Ficha
                        </button>
                        {!acc.isOwner && (
                          <button
                            onClick={() => openRequestAccessModal(acc.family)}
                            className="px-3 py-1.5 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#434331] transition-colors cursor-pointer"
                          >
                            Ampliación de Permisos
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Granular Permission Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#E5E2D9] dark:border-[#334155] text-xs">
                      <div className="p-2 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-xl flex items-center justify-between">
                        <span>Ver</span>
                        {acc.canView ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="p-2 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-xl flex items-center justify-between">
                        <span>Crear</span>
                        {acc.canCreate ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="p-2 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-xl flex items-center justify-between">
                        <span>Editar</span>
                        {acc.canEdit ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="p-2 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-xl flex items-center justify-between">
                        <span>Eliminar</span>
                        {acc.canDelete ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="p-2 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-xl flex items-center justify-between col-span-2 sm:col-span-1">
                        <span>Admin</span>
                        {acc.canManage ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests Status */}
          {mySentRequests.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#E5E2D9] dark:border-[#334155]">
              <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                Solicitudes que has enviado ({mySentRequests.length})
              </h3>

              <div className="space-y-2.5">
                {mySentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] flex items-center justify-between text-xs flex-wrap gap-2"
                  >
                    <div>
                      <div className="font-semibold text-[#434331] dark:text-[#F8FAFC]">
                        {req.familyName}
                      </div>
                      <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                        Alcance: {req.scope} · Permisos: {req.requestedPermissions.join(', ')} · {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold text-[10px]">
                          En revisión por propietario
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                          ✓ Aprobada
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 font-bold text-[10px]">
                          Rechazada
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F5F2ED] dark:bg-[#0F172A] px-6 py-3 border-t border-[#E5E2D9] dark:border-[#334155] flex justify-end">
          <button
            onClick={closeModals}
            className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#434331] cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
