/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, MapPin, Users, GitBranch, Image as ImageIcon, 
  FileText, ShieldCheck, UserPlus, HeartHandshake, 
  Globe, Eye, Lock, Shield, Sparkles, ChevronRight, 
  Calendar, Award, BookOpen, AlertCircle
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { FamilySummary, FamilyBranchSummary } from '../../types/familyLobby';

export const FamilyPublicProfileModal: React.FC = () => {
  const { 
    selectedFamilyForProfile, 
    closeModals, 
    openRequestAccessModal, 
    openConnectFamiliesModal 
  } = useFamilyLobby();

  if (!selectedFamilyForProfile) return null;

  const family = selectedFamilyForProfile;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Cover & Hero Section */}
        <div className="relative h-48 sm:h-56 bg-[#5A5A40] dark:bg-[#1E293B] overflow-hidden shrink-0">
          {family.coverImage ? (
            <img
              src={family.coverImage}
              alt={family.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-5xl font-bold text-white/20">
              {family.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={closeModals}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/30 hover:bg-black/50 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Content */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/30">
                {family.visibility === 'public' ? 'Árbol Público' : family.visibility === 'public_restricted' ? 'Público Restringido' : 'Descubrible'}
              </span>
              {family.isVerifiedOrigin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                  <Award className="w-3 h-3 mr-1" /> Origen Documentado
                </span>
              )}
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight drop-shadow-md">
              {family.name}
            </h1>
            
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/90 drop-shadow-sm mt-1">
              <MapPin className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{family.approximateOrigin || `${family.region}, ${family.country}`}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Privacy & Authorization Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-950 dark:text-amber-100">
                Visualización libre y colaboración protegida
              </h4>
              <p className="mt-0.5 leading-relaxed">
                Este árbol es visible públicamente para enriquecer la memoria histórica. Si tienes fotografías, actas o información para corregir o agregar a una rama o apellido específico, puedes solicitar autorización con el alcance exacto que desees.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155]">
              <div className="font-serif font-bold text-xl text-[#5A5A40] dark:text-amber-400">
                {family.generationsCount}
              </div>
              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Generaciones
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155]">
              <div className="font-serif font-bold text-xl text-[#5A5A40] dark:text-amber-400">
                {family.peopleCount}
              </div>
              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Personas
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155]">
              <div className="font-serif font-bold text-xl text-[#5A5A40] dark:text-amber-400">
                {family.branchesCount}
              </div>
              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Ramas
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155]">
              <div className="font-serif font-bold text-xl text-[#5A5A40] dark:text-amber-400">
                {family.photosCount}
              </div>
              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Fotografías
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155]">
              <div className="font-serif font-bold text-xl text-[#5A5A40] dark:text-amber-400">
                {family.documentsCount}
              </div>
              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Documentos
              </div>
            </div>
          </div>

          {/* Description & Author Bio */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-3xl border border-[#D1CEC7] dark:border-[#334155] space-y-3">
            <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
              Historia y Alcance de la Investigación
            </h3>
            <p className="text-xs sm:text-sm text-[#434331] dark:text-[#CBD5E1] leading-relaxed">
              {family.description}
            </p>

            <div className="pt-3 border-t border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2">
                {family.ownerPhotoURL ? (
                  <img
                    src={family.ownerPhotoURL}
                    alt={family.ownerName}
                    className="w-8 h-8 rounded-full object-cover border border-[#D1CEC7]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold">
                    {family.ownerName.substring(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-[#434331] dark:text-[#F8FAFC]">
                    Investigador Principal: {family.ownerName}
                  </div>
                  <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                    Iniciado en {new Date(family.createdAt).getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openConnectFamiliesModal(family)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F2ED] dark:bg-[#334155] hover:bg-[#E5E2D9] text-[#434331] dark:text-[#F8FAFC] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Conectar Familias</span>
                </button>
              </div>
            </div>
          </div>

          {/* Surnames Associated with this Family */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC] flex items-center justify-between">
              <span>Apellidos documentados en este árbol ({family.surnameTags.length})</span>
              <span className="text-xs font-sans font-normal text-[#7C796F] dark:text-[#94A3B8]">
                Familia ≠ Apellido único
              </span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {family.surnameTags.map(surname => (
                <div
                  key={surname}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs flex items-center space-x-2 group hover:border-[#5A5A40]"
                >
                  <span className="font-serif font-bold text-[#5A5A40] dark:text-amber-400">{surname}</span>
                  <button
                    onClick={() => openRequestAccessModal(family, { scope: 'SURNAME', surname })}
                    className="text-[10px] text-[#A65D47] dark:text-amber-300 font-semibold hover:underline cursor-pointer"
                    title={`Solicitar colaborar sólo en el apellido ${surname}`}
                  >
                    Colaborar en este apellido →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Branches (Ramas Genealógicas) */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
              Ramas Genealógicas Estructuradas ({family.branches.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {family.branches.map((branch: FamilyBranchSummary) => (
                <div
                  key={branch.id}
                  className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-4 h-4 text-[#5A5A40] dark:text-amber-400 shrink-0" />
                        <h4 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC]">
                          {branch.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-bold bg-[#F5F2ED] dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8]">
                        {branch.membersCount} personas
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-[#7C796F] dark:text-[#94A3B8]">
                      <strong>Tronco raíz:</strong> {branch.rootPersonName}
                    </div>

                    {branch.description && (
                      <p className="mt-1.5 text-xs text-[#434331] dark:text-[#CBD5E1] line-clamp-2">
                        {branch.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {branch.surnames.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded-md bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-300 text-[10px] font-serif font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                      {branch.generationsCount} generaciones
                    </span>

                    <button
                      onClick={() => openRequestAccessModal(family, { 
                        scope: 'BRANCH', 
                        branchId: branch.id, 
                        branchName: branch.name 
                      })}
                      className="text-xs font-semibold text-[#A65D47] dark:text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Solicitar colaborar en esta rama</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#F5F2ED] dark:bg-[#0F172A] px-6 py-4 border-t border-[#E5E2D9] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
            Propietario del árbol: <span className="font-semibold text-[#434331] dark:text-white">{family.ownerName}</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={closeModals}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-[#D1CEC7] dark:border-[#334155] text-xs font-semibold text-[#434331] dark:text-[#E2E8F0] hover:bg-white dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              onClick={() => openRequestAccessModal(family)}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] dark:hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Solicitar Colaboración General</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
