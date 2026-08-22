import React, { useState, useEffect } from 'react';
import { 
  X, Database, HardDrive, Copy, Check, Terminal, 
  Shield, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Sparkles, Server
} from 'lucide-react';
import { SupabaseStorageService, StorageBucketStatus } from '../../services/supabaseStorageService';
import { SUPABASE_URL } from '../../supabase/client';

interface SupabaseSqlModalProps {
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'database' | 'diagnostics'>('storage');
  const [copiedStorage, setCopiedStorage] = useState(false);
  const [copiedDatabase, setCopiedDatabase] = useState(false);
  
  // Diagnostics State
  const [testing, setTesting] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    success: boolean;
    buckets: StorageBucketStatus[];
    supabaseUrl: string;
    message: string;
  } | null>(null);

  const storageSql = SupabaseStorageService.getStorageSqlScript();
  const databaseSql = SupabaseStorageService.getFullDatabaseSqlScript();

  const handleCopyStorageSql = () => {
    navigator.clipboard.writeText(storageSql);
    setCopiedStorage(true);
    setTimeout(() => setCopiedStorage(false), 3000);
  };

  const handleCopyDatabaseSql = () => {
    navigator.clipboard.writeText(databaseSql);
    setCopiedDatabase(true);
    setTimeout(() => setCopiedDatabase(false), 3000);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const res = await SupabaseStorageService.testStorageConnection();
      setDiagResult(res);
    } catch (err: any) {
      setDiagResult({
        success: false,
        buckets: [],
        supabaseUrl: SUPABASE_URL,
        message: err?.message || 'Error al ejecutar diagnóstico'
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] dark:bg-[#0F172A] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D1CEC7] dark:border-[#334155] overflow-hidden max-h-[92vh] flex flex-col my-auto text-[#2C2C2C] dark:text-[#E2E8F0]">
        
        {/* Modal Header */}
        <div className="bg-[#5A5A40] dark:bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#434331] dark:border-[#334155]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Scripts SQL para Supabase (Storage & Tablas)
              </h2>
              <p className="text-xs text-[#E5E2D9] dark:text-[#94A3B8] font-sans">
                Configuración completa de almacenamiento de fotos, documentos y esquema de base de datos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#F5F2ED] dark:bg-[#1E293B]/70 px-6 py-2.5 border-b border-[#E5E2D9] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'storage'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] border border-[#D1CEC7] dark:border-[#334155]'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>1. Storage Buckets & Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'database'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] border border-[#D1CEC7] dark:border-[#334155]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>2. Tablas de Base de Datos</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F172A] text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] border border-[#D1CEC7] dark:border-[#334155]'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>3. Diagnóstico en Vivo</span>
            </button>
          </div>

          <a
            href="https://supabase.com/dashboard/project/_/sql"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>Abrir Supabase SQL Editor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
          
          {/* TAB 1: STORAGE SQL */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-sm text-amber-950 dark:text-amber-300">
                    Instrucciones para Supabase Storage
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                    Copia y ejecuta este script en el <strong>SQL Editor</strong> de tu proyecto en Supabase para crear los buckets <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">genealogy-media</code>, <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">avatars</code> y <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">documents</code> con permisos públicos de subida y lectura.
                  </p>
                </div>

                <button
                  onClick={handleCopyStorageSql}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {copiedStorage ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedStorage ? '¡SQL Copiado!' : 'Copiar Script Storage'}</span>
                </button>
              </div>

              {/* Code Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D1CEC7] dark:border-[#334155] shadow-inner bg-[#18181B] text-[#F4F4F5]">
                <div className="bg-[#27272A] px-4 py-2 flex items-center justify-between text-xs text-[#A1A1AA] border-b border-[#3F3F46]">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>storage_setup.sql</span>
                  </div>
                  <span className="text-[10px]">PostgreSQL / Supabase Storage</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[340px] leading-relaxed text-emerald-400">
                  {storageSql}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE TABLES DDL */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-sm text-sky-950 dark:text-sky-300">
                    Esquema Relacional Completo
                  </h3>
                  <p className="text-xs text-sky-800 dark:text-sky-400 mt-0.5">
                    Crea todas las tablas del árbol genealógico (<code className="bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">people</code>, <code className="bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">media</code>, <code className="bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded font-mono font-bold text-[11px]">sources</code>, etc.) con sus índices y políticas de seguridad RLS.
                  </p>
                </div>

                <button
                  onClick={handleCopyDatabaseSql}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {copiedDatabase ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedDatabase ? '¡SQL Copiado!' : 'Copiar Script Tablas'}</span>
                </button>
              </div>

              {/* Code Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D1CEC7] dark:border-[#334155] shadow-inner bg-[#18181B] text-[#F4F4F5]">
                <div className="bg-[#27272A] px-4 py-2 flex items-center justify-between text-xs text-[#A1A1AA] border-b border-[#3F3F46]">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>schema_full.sql</span>
                  </div>
                  <span className="text-[10px]">PostgreSQL DDL</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[340px] leading-relaxed text-sky-300">
                  {databaseSql}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] dark:border-[#334155] pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#434331] dark:text-[#F1F5F9]">
                      Estado de Conexión y Buckets
                    </h3>
                    <p className="text-xs text-[#7C796F] dark:text-[#94A3B8] font-mono mt-0.5">
                      Instancia: {SUPABASE_URL}
                    </p>
                  </div>

                  <button
                    onClick={runDiagnostics}
                    disabled={testing}
                    className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>{testing ? 'Verificando...' : 'Reintentar Test'}</span>
                  </button>
                </div>

                {diagResult && (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${
                      diagResult.success 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                    }`}>
                      {diagResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                      <span className="text-xs font-medium">{diagResult.message}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {diagResult.buckets.map((b) => (
                        <div 
                          key={b.bucketName}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            b.exists 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200' 
                              : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-4 h-4 text-[#5A5A40] dark:text-amber-400" />
                            <span className="font-mono font-bold text-xs">{b.bucketName}</span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.exists 
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                              : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                          }`}>
                            {b.exists ? '✓ Activo' : '✗ No Creado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F2ED] dark:bg-[#1E293B] px-6 py-3 border-t border-[#E5E2D9] dark:border-[#334155] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#7C796F] dark:text-[#94A3B8]">
            Soporta subida en vivo de fotografías, retratos, actas parroquiales y documentos PDF.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
