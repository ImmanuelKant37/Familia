import React, { useState } from 'react';
import { 
  Users, UserPlus, Check, X, Shield, Mail, 
  Copy, Sparkles, CheckCircle, Share2, ArrowRight
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';
import { useAuth } from '../../context/AuthContext';
import { MemberRole } from '../../types';

interface CollaborationModalProps {
  onClose: () => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  onClose
}) => {
  const { 
    activeTree, requests, proposals, 
    respondToRequest, respondToProposal,
    sendAccessRequest, canManage
  } = useTree();
  const { activeRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'proposals' | 'share'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('editor');
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Request access form (for visitors)
  const [reqRelation, setReqRelation] = useState('');
  const [reqIntent, setReqIntent] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSent(true);
    setInviteEmail('');
    setInviteName('');
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleVisitorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendAccessRequest({
      userName: inviteName.trim() || 'Familiar Solicitante',
      userEmail: inviteEmail.trim() || 'contacto@familia.com',
      familyRelation: reqRelation.trim(),
      contributionIntent: reqIntent.trim(),
      message: reqMessage.trim(),
      requestedRole: 'collaborator'
    });
    setReqSuccess(true);
    setTimeout(() => setReqSuccess(false), 4000);
  };

  const shareUrl = `${window.location.origin}/?tree=${activeTree?.id || 'default'}&public=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingProposals = proposals.filter(p => p.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-[#F5F2ED]" />
            <h2 className="font-serif font-bold text-lg text-white">
              Colaboración Familiar & Permisos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2ED] px-4 pt-2 text-xs font-semibold overflow-x-auto shrink-0 uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-[#5A5A40] text-[#434331] font-bold'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Miembros del Árbol</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-[#5A5A40] text-[#434331] font-bold'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Solicitudes de Acceso</span>
            {pendingRequests.length > 0 && (
              <span className="bg-[#A65D47] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'proposals'
                ? 'border-[#5A5A40] text-[#434331] font-bold'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Propuestas de Cambio</span>
            {pendingProposals.length > 0 && (
              <span className="bg-[#A65D47] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingProposals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'share'
                ? 'border-[#5A5A40] text-[#434331] font-bold'
                : 'border-transparent text-[#7C796F] hover:text-[#434331]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir Árbol</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Active Role Status */}
              <div className="p-3.5 bg-[#E5E2D9]/70 rounded-2xl border border-[#D1CEC7] flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-[#434331]">
                  <strong>Tu rol actual en esta familia:</strong> <span className="capitalize font-semibold text-[#5A5A40]">{activeRole === 'owner' ? 'Propietario' : activeRole}</span>
                </div>
              </div>

              {/* Invite Form */}
              {canManage && (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] p-4">
                  <h3 className="font-serif font-bold text-[#434331] text-sm mb-3 flex items-center space-x-1.5">
                    <UserPlus className="w-4 h-4 text-[#5A5A40]" />
                    <span>Invitar a un Familiar a Colaborar</span>
                  </h3>

                  <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Nombre del familiar"
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#434331] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl px-3 py-2 text-xs text-[#434331] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                    <div className="flex space-x-2">
                      <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value as MemberRole)}
                        className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl px-2 py-2 text-xs text-[#434331] focus:outline-none flex-1"
                      >
                        <option value="editor">Editor (Edición directa)</option>
                        <option value="collaborator">Colaborador (Sujeto a aprobación)</option>
                        <option value="viewer">Lector (Solo ver)</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-[#5A5A40] hover:bg-[#434331] text-white font-semibold uppercase tracking-wider px-4 py-2 rounded-full text-xs transition-colors shrink-0"
                      >
                        Enviar
                      </button>
                    </div>
                  </form>

                  {inviteSent && (
                    <div className="mt-2 text-xs text-[#5A5A40] font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Invitación enviada exitosamente por correo electrónico.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C796F]">
                  Miembros Activos
                </h4>

                <div className="divide-y divide-[#E5E2D9] border border-[#E5E2D9] rounded-2xl bg-white overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80"
                        alt="Owner"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D1CEC7]"
                      />
                      <div>
                        <div className="font-serif font-bold text-[#434331] text-xs sm:text-sm">
                          {activeTree?.ownerName || 'Juan Carlos Cantero'} <span className="text-[#9A968A] font-normal">(Tú)</span>
                        </div>
                        <div className="text-[11px] text-[#7C796F] font-mono">
                          {activeTree?.ownerEmail || 'fecsoul@gmail.com'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30">
                      Propietario
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                        alt="Elena Cantero"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D1CEC7]"
                      />
                      <div>
                        <div className="font-serif font-bold text-[#434331] text-xs sm:text-sm">
                          Dra. Lucía Cantero Rossi
                        </div>
                        <div className="text-[11px] text-[#7C796F] font-mono">
                          lucia.cantero@gmail.com
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30">
                      Editora
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                        alt="Ignacio"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D1CEC7]"
                      />
                      <div>
                        <div className="font-serif font-bold text-[#434331] text-xs sm:text-sm">
                          Ignacio Cantero Varela
                        </div>
                        <div className="text-[11px] text-[#7C796F] font-mono">
                          ignacio.c@universidad.edu
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#A65D47]/15 text-[#A65D47] border-[#A65D47]/30">
                      Colaborador
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7C796F] font-serif italic">
                Familiares o investigadores que han solicitado acceso para colaborar con nuevos datos o fotografías.
              </p>

              {/* Submit a request simulation */}
              <div className="p-4 bg-white rounded-2xl border border-[#E5E2D9] space-y-3">
                <h4 className="font-serif font-bold text-[#434331] text-xs">
                  Enviar Nueva Solicitud de Acceso (Como Familiar)
                </h4>
                <form onSubmit={handleVisitorRequest} className="space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Tu correo electrónico"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Parentesco (ej: Nieto de Carlos Cantero)"
                      value={reqRelation}
                      onChange={e => setReqRelation(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                    <input
                      type="text"
                      placeholder="¿Qué información deseas aportar?"
                      value={reqIntent}
                      onChange={e => setReqIntent(e.target.value)}
                      className="bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2 text-[#434331]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#5A5A40] hover:bg-[#434331] text-white font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-colors text-xs"
                  >
                    Enviar Solicitud
                  </button>
                  {reqSuccess && (
                    <span className="text-[#5A5A40] font-semibold ml-2 text-xs">
                      ¡Solicitud registrada correctamente!
                    </span>
                  )}
                </form>
              </div>

              {/* Requests List */}
              <div className="space-y-3 pt-2">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-[#9A968A] text-xs bg-white rounded-2xl border border-[#E5E2D9]">
                    No hay solicitudes de acceso pendientes.
                  </div>
                ) : (
                  requests.map(req => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-[#E5E2D9] p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-serif font-bold text-[#434331] text-sm">
                            {req.userName}
                          </div>
                          <div className="text-xs text-[#7C796F] font-mono">
                            {req.userEmail}
                          </div>
                          <div className="text-xs text-[#5A5A40] font-medium mt-1 font-serif">
                            Parentesco: {req.familyRelation || 'Familiar'}
                          </div>
                        </div>

                        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          req.status === 'pending'
                            ? 'bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30'
                            : req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </div>

                      {req.contributionIntent && (
                        <p className="text-xs text-[#2C2C2C] bg-[#F5F2ED] p-2.5 rounded-xl border border-[#D1CEC7] font-serif">
                          {req.contributionIntent}
                        </p>
                      )}

                      {canManage && req.status === 'pending' && (
                        <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E2D9]">
                          <button
                            onClick={() => respondToRequest(req.id, 'rejected')}
                            className="px-3 py-1.5 text-[#7C796F] hover:bg-[#E5E2D9] rounded-full text-xs font-semibold uppercase tracking-wider"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => respondToRequest(req.id, 'accepted')}
                            className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Aceptar & Dar Rol
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROPOSALS */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7C796F] font-serif italic">
                Cambios propuestos por colaboradores familiares que requieren revisión y aprobación antes de incorporarse al árbol.
              </p>

              <div className="space-y-3">
                {proposals.length === 0 ? (
                  <div className="text-center py-8 text-[#9A968A] text-xs bg-white rounded-2xl border border-[#E5E2D9]">
                    No hay propuestas de cambios pendientes de aprobación.
                  </div>
                ) : (
                  proposals.map(prop => (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl border border-[#E5E2D9] p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-serif font-bold text-[#434331]">
                            Persona: {prop.targetName || prop.targetId}
                          </span>
                          <p className="text-xs text-[#7C796F] mt-0.5">
                            Propuesto por: <strong>{prop.proposedByName}</strong>
                          </p>
                        </div>

                        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          prop.status === 'pending'
                            ? 'bg-[#5A5A40]/15 text-[#434331] border-[#5A5A40]/30'
                            : prop.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {prop.status === 'pending' ? 'Por Revisar' : prop.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                        </span>
                      </div>

                      {/* Diff View */}
                      <div className="bg-[#F5F2ED] p-3 rounded-xl border border-[#D1CEC7] space-y-1.5">
                        <div className="font-semibold text-xs text-[#434331]">
                          Campo a modificar: {prop.fieldChanged}
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="line-through text-[#9A968A]">
                            {prop.currentValue || 'Sin dato previo'}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#7C796F] shrink-0" />
                          <div className="text-[#434331] font-bold bg-[#E5E2D9] px-2 py-0.5 rounded border border-[#D1CEC7]">
                            {prop.proposedValue}
                          </div>
                        </div>
                        {prop.sourceNote && (
                          <div className="text-[11px] text-[#7C796F] italic mt-1 font-serif">
                            Fuente / Justificación: {prop.sourceNote}
                          </div>
                        )}
                      </div>

                      {canManage && prop.status === 'pending' && (
                        <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5E2D9]">
                          <button
                            onClick={() => respondToProposal(prop.id, 'rejected')}
                            className="px-3 py-1.5 text-[#7C796F] hover:bg-[#E5E2D9] rounded-full text-xs font-semibold uppercase tracking-wider"
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => respondToProposal(prop.id, 'accepted')}
                            className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Aprobar & Aplicar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SHARE */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#E5E2D9]/70 rounded-2xl border border-[#D1CEC7] text-xs text-[#434331] space-y-2">
                <div className="font-serif font-bold flex items-center space-x-1.5 text-[#434331]">
                  <Shield className="w-4 h-4 text-[#5A5A40]" />
                  <span>Protección Automática de Privacidad Activa</span>
                </div>
                <p className="font-serif leading-relaxed text-[#2C2C2C]">
                  Al compartir este enlace públicamente con familiares o investigadores, el sistema ocultará automáticamente apellidos, fechas exactas y notas privadas de personas vivas, protegiendo la identidad y privacidad de la familia.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1.5">
                  Enlace Público Compartible
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="border border-[#D1CEC7] bg-[#F5F2ED] rounded-xl px-3 py-2 text-xs font-mono text-[#434331] flex-1 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
