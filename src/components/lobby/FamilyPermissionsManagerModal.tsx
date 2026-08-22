/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, Users, Mail, Link as LinkIcon, Clock, Check, 
  X, AlertTriangle, UserCheck, UserX, Plus, Copy, 
  CheckCircle, ArrowRight, GitBranch, Edit3, Trash2, 
  History, Calendar, Eye, Sparkles, Key
} from 'lucide-react';
import { useFamilyLobby } from '../../context/FamilyLobbyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PermissionRequest, 
  PermissionGrant, 
  PermissionAction, 
  PermissionScopeType,
  FamilyInvitation
} from '../../types/familyLobby';

export const FamilyPermissionsManagerModal: React.FC = () => {
  const { 
    families,
    permissionRequests,
    permissionGrants,
    invitations,
    auditLogs,
    selectedFamilyForProfile,
    closeModals,
    approvePermissionRequest,
    rejectPermissionRequest,
    createDirectGrant,
    revokeGrant,
    createInvitation,
    revokeInvitation
  } = useFamilyLobby();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'members' | 'invitations' | 'audit'>('requests');
  
  // Custom Approval State Modal/Drawer
  const [requestToApproveCustom, setRequestToApproveCustom] = useState<PermissionRequest | null>(null);
  const [customScope, setCustomScope] = useState<PermissionScopeType>('FAMILY');
  const [customBranchId, setCustomBranchId] = useState<string>('');
  const [customSurname, setCustomSurname] = useState<string>('');
  const [customPermissions, setCustomPermissions] = useState<PermissionAction[]>(['VIEW', 'CREATE', 'EDIT']);
  const [customExpiresDays, setCustomExpiresDays] = useState<number>(0);
  const [customNotes, setCustomNotes] = useState<string>('');

  // New Direct Member Form
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPermissions, setNewMemberPermissions] = useState<PermissionAction[]>(['VIEW', 'CREATE', 'EDIT']);
  const [newMemberScope, setNewMemberScope] = useState<PermissionScopeType>('FAMILY');
  const [newMemberBranchId, setNewMemberBranchId] = useState('');
  const [newMemberSurname, setNewMemberSurname] = useState('');

  // New Invite Link Form
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [invitePermissions, setInvitePermissions] = useState<PermissionAction[]>(['VIEW', 'CREATE', 'EDIT']);
  const [inviteScope, setInviteScope] = useState<PermissionScopeType>('FAMILY');
  const [inviteBranchId, setInviteBranchId] = useState('');
  const [inviteSurname, setInviteSurname] = useState('');
  const [inviteExpiresDays, setInviteExpiresDays] = useState<number>(7);
  const [inviteMaxUses, setInviteMaxUses] = useState<number>(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Focus Family (Default to first or selected)
  const currentFamily = selectedFamilyForProfile || families[0];

  const pendingRequests = permissionRequests.filter(r => 
    r.status === 'pending' && (!currentFamily || r.familyId === currentFamily.id)
  );

  const activeGrants = permissionGrants.filter(g => 
    (!currentFamily || g.familyId === currentFamily.id) && g.status === 'active'
  );

  const familyInvitations = invitations.filter(i => 
    (!currentFamily || i.familyId === currentFamily.id) && i.status === 'active'
  );

  const familyAuditLogs = auditLogs.filter(a => 
    !currentFamily || a.familyId === currentFamily.id
  );

  // Open Custom Approval
  const handleOpenCustomApproval = (req: PermissionRequest) => {
    setRequestToApproveCustom(req);
    setCustomScope(req.scope);
    setCustomBranchId(req.targetBranchId || '');
    setCustomSurname(req.targetSurname || '');
    setCustomPermissions(req.requestedPermissions);
    setCustomExpiresDays(0);
    setCustomNotes(`Aprobado con alcance personalizado para ${req.requesterName}.`);
  };

  // Submit Custom Approval
  const handleConfirmCustomApproval = async () => {
    if (!requestToApproveCustom) return;

    let expiresAt: string | undefined = undefined;
    if (customExpiresDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + customExpiresDays);
      expiresAt = exp.toISOString();
    }

    const branchObj = currentFamily.branches.find(b => b.id === customBranchId);

    await approvePermissionRequest(requestToApproveCustom.id, {
      scope: customScope,
      targetBranchId: customScope === 'BRANCH' ? customBranchId : undefined,
      targetBranchName: customScope === 'BRANCH' && branchObj ? branchObj.name : undefined,
      targetSurname: customScope === 'SURNAME' ? customSurname : undefined,
      permissions: customPermissions,
      expiresAt,
      notes: customNotes
    });

    setRequestToApproveCustom(null);
  };

  // Handle Copy Link
  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/?invite=${code}&tree=${currentFamily.id}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Create Direct Grant submit
  const handleAddDirectMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    const branchObj = currentFamily.branches.find(b => b.id === newMemberBranchId);

    await createDirectGrant({
      familyId: currentFamily.id,
      familyName: currentFamily.name,
      userId: `usr-direct-${Date.now()}`,
      userName: newMemberName.trim() || newMemberEmail.split('@')[0],
      userEmail: newMemberEmail.trim(),
      permissions: newMemberPermissions,
      scope: newMemberScope,
      targetBranchId: newMemberScope === 'BRANCH' ? newMemberBranchId : undefined,
      targetBranchName: newMemberScope === 'BRANCH' && branchObj ? branchObj.name : undefined,
      targetSurname: newMemberScope === 'SURNAME' ? newMemberSurname : undefined,
      notes: 'Miembro añadido directamente por el administrador.'
    });

    setShowAddMember(false);
    setNewMemberEmail('');
    setNewMemberName('');
  };

  // Create Invitation Submit
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    const branchObj = currentFamily.branches.find(b => b.id === inviteBranchId);

    const exp = new Date();
    exp.setDate(exp.getDate() + inviteExpiresDays);

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `INV-${currentFamily.name.substring(0, 4).toUpperCase().replace(/\s+/g, '')}-${randomSuffix}`;

    await createInvitation({
      code,
      familyId: currentFamily.id,
      familyName: currentFamily.name,
      permissions: invitePermissions,
      scope: inviteScope,
      targetBranchId: inviteScope === 'BRANCH' ? inviteBranchId : undefined,
      targetBranchName: inviteScope === 'BRANCH' && branchObj ? branchObj.name : undefined,
      targetSurname: inviteScope === 'SURNAME' ? inviteSurname : undefined,
      expiresAt: exp.toISOString(),
      maxUses: inviteMaxUses
    });

    setShowCreateInvite(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors duration-200">
        
        {/* Top Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Panel del Propietario & Control de Permisos
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8]">
                {currentFamily.name} · Administración de colaboradores y solicitudes
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2D9] dark:border-[#334155] bg-[#F5F2ED] dark:bg-[#1E293B]/70 px-6 pt-2 text-xs font-semibold overflow-x-auto shrink-0 uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-[#5A5A40] dark:border-amber-400 text-[#434331] dark:text-white font-bold'
                : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Solicitudes Pendientes</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-[#5A5A40] dark:border-amber-400 text-[#434331] dark:text-white font-bold'
                : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Miembros & Permisos Activos ({activeGrants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'invitations'
                ? 'border-[#5A5A40] dark:border-amber-400 text-[#434331] dark:text-white font-bold'
                : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Enlaces de Invitación ({familyInvitations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#5A5A40] dark:border-amber-400 text-[#434331] dark:text-white font-bold'
                : 'border-transparent text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial & Auditoría</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-[#D1CEC7] dark:border-[#334155]">
                  <Mail className="w-10 h-10 text-[#9A968A] mx-auto mb-2 opacity-60" />
                  <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                    No tienes solicitudes de colaboración pendientes
                  </h3>
                  <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
                    Cuando otros usuarios descubran tu árbol en el Lobby y soliciten colaborar, aparecerán aquí para tu aprobación.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] p-5 shadow-xs space-y-4"
                    >
                      {/* Requester Header */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center space-x-3">
                          {req.requesterPhoto ? (
                            <img src={req.requesterPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-[#D1CEC7]" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm">
                              {req.requesterName.substring(0, 1)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC]">
                              {req.requesterName}
                            </h4>
                            <div className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                              {req.requesterEmail} · {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Request Badges */}
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            Alcance: {req.scope} {req.targetBranchName ? `(${req.targetBranchName})` : ''} {req.targetSurname ? `(${req.targetSurname})` : ''}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-300">
                            {req.requestedPermissions.join(' + ')}
                          </span>
                        </div>
                      </div>

                      {/* Relation & Contribution Message */}
                      <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#0F172A] rounded-2xl text-xs space-y-1.5 border border-[#E5E2D9] dark:border-[#334155]">
                        <div className="text-[#434331] dark:text-[#E2E8F0]">
                          <strong className="text-[#5A5A40] dark:text-amber-400">Vínculo familiar:</strong> {req.familyRelation}
                        </div>
                        {req.contributionIntent && (
                          <div className="text-[#434331] dark:text-[#E2E8F0]">
                            <strong className="text-[#5A5A40] dark:text-amber-400">Aportes propuestos:</strong> {req.contributionIntent}
                          </div>
                        )}
                        {req.message && (
                          <div className="text-[#7C796F] dark:text-[#94A3B8] italic pt-1 border-t border-[#E5E2D9] dark:border-[#334155]">
                            "{req.message}"
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D9] dark:border-[#334155] flex-wrap gap-2">
                        <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8]">
                          Puedes aprobar tal como lo solicitó o personalizar el alcance a una rama o apellido específico.
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => rejectPermissionRequest(req.id)}
                            className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Rechazar
                          </button>

                          <button
                            onClick={() => handleOpenCustomApproval(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                            title="Ajustar alcance antes de aprobar (ej. limitar a rama Pérez)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Aprobar con Alcance Personalizado...</span>
                          </button>

                          <button
                            onClick={() => approvePermissionRequest(req.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprobar Directo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE MEMBERS & PERMISSION MATRIX */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                  Colaboradores con Permisos Concedidos
                </h3>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Colaborador Directo</span>
                </button>
              </div>

              {/* Add Member Drawer */}
              {showAddMember && (
                <form onSubmit={handleAddDirectMember} className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC]">
                      Nuevo Permiso Directo
                    </h4>
                    <button type="button" onClick={() => setShowAddMember(false)} className="text-[#9A968A]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Email del usuario *</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="familiar@gmail.com"
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Nombre para mostrar</label>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Nombre y Apellido"
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Alcance (Scope)</label>
                      <select
                        value={newMemberScope}
                        onChange={(e) => setNewMemberScope(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      >
                        <option value="FAMILY">Árbol Completo</option>
                        <option value="BRANCH">Rama Específica</option>
                        <option value="SURNAME">Apellido Específico</option>
                      </select>
                    </div>

                    {newMemberScope === 'BRANCH' && (
                      <div>
                        <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Rama asignada</label>
                        <select
                          value={newMemberBranchId}
                          onChange={(e) => setNewMemberBranchId(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                        >
                          <option value="">-- Elige rama --</option>
                          {currentFamily.branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {newMemberScope === 'SURNAME' && (
                      <div>
                        <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Apellido asignado</label>
                        <input
                          type="text"
                          value={newMemberSurname}
                          onChange={(e) => setNewMemberSurname(e.target.value)}
                          placeholder="Ej: Pérez"
                          className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-3 py-1.5 rounded-xl border border-[#D1CEC7] text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold"
                    >
                      Guardar Permiso
                    </button>
                  </div>
                </form>
              )}

              {/* Members Table */}
              <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2ED] dark:bg-[#0F172A] border-b border-[#E5E2D9] dark:border-[#334155] text-[#7C796F] dark:text-[#94A3B8] font-sans font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Colaborador</th>
                      <th className="p-3.5">Permisos</th>
                      <th className="p-3.5">Alcance (Scope)</th>
                      <th className="p-3.5">Caducidad</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9] dark:divide-[#334155]">
                    {/* Owner Row */}
                    <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                            {currentFamily.ownerName.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#434331] dark:text-[#F8FAFC]">
                              {currentFamily.ownerName}
                            </div>
                            <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                              {currentFamily.ownerEmail || 'Propietario Principal'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                          Control Total (OWNER)
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-[#434331] dark:text-[#F8FAFC]">
                        Árbol Completo
                      </td>
                      <td className="p-3.5 text-[#7C796F] dark:text-[#94A3B8]">
                        Permanente
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                          Autor
                        </span>
                      </td>
                    </tr>

                    {/* Active Grants Rows */}
                    {activeGrants.map((grant) => (
                      <tr key={grant.id} className="hover:bg-[#F5F2ED]/50 dark:hover:bg-[#334155]/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            {grant.userPhoto ? (
                              <img src={grant.userPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#E5E2D9] dark:bg-[#334155] text-[#5A5A40] dark:text-white flex items-center justify-center font-bold text-xs">
                                {grant.userName.substring(0, 1)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-[#434331] dark:text-[#F8FAFC]">
                                {grant.userName}
                              </div>
                              <div className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                                {grant.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {grant.permissions.map(p => (
                              <span
                                key={p}
                                className={`px-1.5 py-0.2 rounded-md text-[9px] font-sans font-bold uppercase ${
                                  p === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                                  p === 'MANAGE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                                  'bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-300 border border-[#D1CEC7] dark:border-[#334155]'
                                }`}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 text-[#434331] dark:text-[#CBD5E1]">
                          <span className="font-medium">
                            {grant.scope === 'FAMILY' ? '🌳 Árbol Completo' :
                             grant.scope === 'BRANCH' ? `🌿 Rama: ${grant.targetBranchName || grant.targetBranchId}` :
                             grant.scope === 'SURNAME' ? `📜 Apellido: ${grant.targetSurname}` : grant.scope}
                          </span>
                        </td>

                        <td className="p-3.5 text-[#7C796F] dark:text-[#94A3B8]">
                          {grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : 'Sin caducidad'}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => revokeGrant(grant.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Revocar acceso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVITATIONS & CODES */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                    Enlaces de Invitación Temporal
                  </h3>
                  <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                    Genera links para compartir por WhatsApp o email con permisos y vencimientos preconfigurados.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateInvite(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5A5A40] dark:bg-amber-600 hover:bg-[#434331] text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Enlace</span>
                </button>
              </div>

              {/* Create Invite Form */}
              {showCreateInvite && (
                <form onSubmit={handleCreateInvitation} className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F8FAFC]">
                      Configurar Nuevo Enlace de Invitación
                    </h4>
                    <button type="button" onClick={() => setShowCreateInvite(false)} className="text-[#9A968A]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Alcance (Scope)</label>
                      <select
                        value={inviteScope}
                        onChange={(e) => setInviteScope(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      >
                        <option value="FAMILY">Árbol Completo</option>
                        <option value="BRANCH">Rama Específica</option>
                        <option value="SURNAME">Apellido Específico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Caducidad</label>
                      <select
                        value={inviteExpiresDays}
                        onChange={(e) => setInviteExpiresDays(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      >
                        <option value={7}>7 días</option>
                        <option value={15}>15 días</option>
                        <option value={30}>30 días</option>
                        <option value={90}>90 días</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">Máximo de usos</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={inviteMaxUses}
                        onChange={(e) => setInviteMaxUses(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateInvite(false)}
                      className="px-3 py-1.5 rounded-xl border border-[#D1CEC7] text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold"
                    >
                      Generar Enlace
                    </button>
                  </div>
                </form>
              )}

              {/* Invitations List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-[#F5F2ED] dark:bg-[#0F172A] px-2.5 py-1 rounded-lg text-[#5A5A40] dark:text-amber-300">
                        {inv.code}
                      </span>
                      <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                        Usado {inv.usedCount} de {inv.maxUses}
                      </span>
                    </div>

                    <div className="text-xs text-[#434331] dark:text-[#CBD5E1]">
                      <div><strong>Alcance:</strong> {inv.scope} {inv.targetBranchName ? `(${inv.targetBranchName})` : ''}</div>
                      <div><strong>Permisos:</strong> {inv.permissions.join(', ')}</div>
                      <div className="text-[11px] text-[#7C796F] dark:text-[#94A3B8] mt-1">
                        Vence: {new Date(inv.expiresAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between">
                      <button
                        onClick={() => handleCopyLink(inv.code)}
                        className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedCode === inv.code ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === inv.code ? '¡Copiado!' : 'Copiar Enlace'}</span>
                      </button>

                      <button
                        onClick={() => revokeInvitation(inv.id)}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Revocar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                Registro de Auditoría de Permisos & Seguridad
              </h3>

              <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#D1CEC7] dark:border-[#334155] divide-y divide-[#E5E2D9] dark:divide-[#334155]">
                {familyAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#F5F2ED] dark:bg-[#0F172A] text-[#5A5A40] dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-semibold text-[#434331] dark:text-[#F8FAFC]">
                          {log.userName}
                        </span>
                        <span className="text-[10px] text-[#7C796F] dark:text-[#94A3B8]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[#434331] dark:text-[#CBD5E1] mt-0.5">
                        {log.details}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.2 rounded-md bg-[#F5F2ED] dark:bg-[#0F172A] text-[9px] font-sans font-bold uppercase text-[#7C796F] dark:text-[#94A3B8]">
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* CUSTOM APPROVAL MODAL / OVERLAY */}
        {requestToApproveCustom && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-lg rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#434331] dark:text-[#F8FAFC]">
                  Aprobación con Alcance Personalizado
                </h3>
                <button onClick={() => setRequestToApproveCustom(null)} className="text-[#9A968A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
                El usuario solicitó: <strong>{requestToApproveCustom.scope}</strong>. Como propietario, puedes restringir o adecuar los permisos exactos otorgados.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                    Alcance Autorizado (Scope)
                  </label>
                  <select
                    value={customScope}
                    onChange={(e) => setCustomScope(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                  >
                    <option value="FAMILY">Árbol Completo</option>
                    <option value="BRANCH">Rama Específica</option>
                    <option value="SURNAME">Apellido Específico</option>
                  </select>
                </div>

                {customScope === 'BRANCH' && (
                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      Seleccionar rama autorizada:
                    </label>
                    <select
                      value={customBranchId}
                      onChange={(e) => setCustomBranchId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                    >
                      <option value="">-- Seleccionar rama --</option>
                      {currentFamily.branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {customScope === 'SURNAME' && (
                  <div>
                    <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                      Apellido autorizado:
                    </label>
                    <input
                      type="text"
                      value={customSurname}
                      onChange={(e) => setCustomSurname(e.target.value)}
                      placeholder="Ej: Pérez"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#434331] dark:text-[#E2E8F0] mb-1">
                    Duración / Caducidad temporal
                  </label>
                  <select
                    value={customExpiresDays}
                    onChange={(e) => setCustomExpiresDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D1CEC7] dark:border-[#334155] text-xs text-[#434331] dark:text-[#E2E8F0]"
                  >
                    <option value={0}>Permanente (sin caducidad)</option>
                    <option value={30}>30 días de colaboración</option>
                    <option value={90}>90 días de colaboración</option>
                    <option value={180}>180 días de colaboración</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E5E2D9] dark:border-[#334155]">
                <button
                  onClick={() => setRequestToApproveCustom(null)}
                  className="px-4 py-2 rounded-xl border border-[#D1CEC7] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmCustomApproval}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirmar Aprobación
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
