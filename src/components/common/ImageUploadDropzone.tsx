import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, FileText, CheckCircle, 
  AlertTriangle, Loader2, X, Sparkles, Camera, Link, RefreshCw
} from 'lucide-react';
import { SupabaseStorageService, StorageUploadResult } from '../../services/supabaseStorageService';

interface ImageUploadDropzoneProps {
  currentUrl?: string;
  onUploadComplete: (result: StorageUploadResult) => void;
  uploadType?: 'avatar' | 'media' | 'document';
  personId?: string;
  treeId?: string;
  label?: string;
  sublabel?: string;
  accept?: string;
  showUrlInput?: boolean;
  className?: string;
  compact?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  currentUrl,
  onUploadComplete,
  uploadType = 'avatar',
  personId = 'new',
  treeId = 'default_tree',
  label = 'Subir fotografía a Supabase',
  sublabel = 'Formatos: JPG, PNG, WEBP hasta 20MB',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  showUrlInput = true,
  className = '',
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    // Check size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('El archivo excede el límite máximo de 50MB');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessInfo(null);
    setUploadProgress(25);

    try {
      // Local immediate preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setUploadProgress(50);

      let result: StorageUploadResult;
      if (uploadType === 'avatar') {
        result = await SupabaseStorageService.uploadPersonAvatar(file, personId, treeId);
      } else if (uploadType === 'document') {
        result = await SupabaseStorageService.uploadHistoricalDocument(file, { treeId, sourceId: personId });
      } else {
        result = await SupabaseStorageService.uploadGalleryMedia(file, { treeId, folder: 'gallery' });
      }

      setUploadProgress(100);

      if (result.publicUrl) {
        setPreviewUrl(result.publicUrl);
        onUploadComplete(result);
        
        if (result.isFallbackDataUrl) {
          setSuccessInfo('Guardado con éxito (modo local)');
        } else {
          setSuccessInfo(`✓ Subido a Supabase Storage [${result.bucket}]`);
        }
      } else {
        setErrorMsg(result.error || 'Error al subir archivo');
      }
    } catch (err: any) {
      console.error('Upload handler error:', err);
      setErrorMsg(err.message || 'Error durante la subida');
    } finally {
      setUploading(false);
      setTimeout(() => setSuccessInfo(null), 4000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    setPreviewUrl(manualUrl.trim());
    onUploadComplete({
      publicUrl: manualUrl.trim(),
      filePath: 'external_url',
      fileSize: 0,
      mimeType: 'image/jpeg',
      bucket: 'external'
    });
    setSuccessInfo('URL vinculada correctamente');
    setShowManualInput(false);
    setTimeout(() => setSuccessInfo(null), 3000);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onUploadComplete({
      publicUrl: '',
      filePath: '',
      fileSize: 0,
      mimeType: '',
      bucket: ''
    });
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`compact-file-input-${personId}`}
        />
        
        <div className="flex items-center space-x-3">
          <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-14 h-14 rounded-2xl bg-[#E5E2D9] dark:bg-[#334155] border-2 border-[#D1CEC7] dark:border-[#475569] overflow-hidden flex items-center justify-center shadow-xs group-hover/avatar:border-[#5A5A40] dark:group-hover/avatar:border-amber-400 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-[#5A5A40] dark:text-amber-400 animate-spin" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-[#7C796F] dark:text-[#94A3B8]" />
              )}
            </div>

            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold text-[#5A5A40] dark:text-amber-400 hover:text-[#434331] dark:hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{previewUrl ? 'Cambiar Foto Supabase' : 'Subir Foto a Supabase'}</span>
            </button>
            <p className="text-[10px] text-[#7C796F] dark:text-[#94A3B8] truncate mt-0.5">
              JPG, PNG en Supabase Storage
            </p>
            {successInfo && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5 animate-in fade-in">
                {successInfo}
              </span>
            )}
            {errorMsg && (
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block mt-0.5 animate-in fade-in">
                {errorMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`full-file-input-${personId}`}
      />

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-5 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#5A5A40] dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 scale-[1.01]'
            : previewUrl
            ? 'border-[#D1CEC7] dark:border-[#334155] bg-white/70 dark:bg-[#1E293B]/70'
            : 'border-[#D1CEC7] dark:border-[#334155] bg-[#FDFBF7] dark:bg-[#0F172A]/50 hover:border-[#5A5A40] dark:hover:border-amber-500'
        }`}
      >
        {uploading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#5A5A40] dark:text-amber-400 animate-spin" />
            <div className="w-48 bg-[#E5E2D9] dark:bg-[#334155] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#5A5A40] dark:bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-[#434331] dark:text-[#F1F5F9]">
              Subiendo a Supabase Storage... {uploadProgress}%
            </p>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <div className="relative group/preview shrink-0">
              {uploadType === 'document' && !previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex flex-col items-center justify-center text-amber-900 dark:text-amber-300 shadow-sm">
                  <FileText className="w-8 h-8" />
                  <span className="text-[9px] font-bold uppercase mt-1">DOC / PDF</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-[#334155] shadow-md ring-2 ring-[#D1CEC7] dark:ring-[#475569]"
                />
              )}

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                title="Quitar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Archivo listo en Supabase</span>
              </div>
              <p className="text-[11px] text-[#7C796F] dark:text-[#94A3B8] max-w-xs truncate">
                {previewUrl}
              </p>
              
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold rounded-full flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reemplazar archivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="px-2.5 py-1 text-[#7C796F] dark:text-[#94A3B8] hover:text-[#434331] dark:hover:text-[#F1F5F9] text-xs transition-colors"
                >
                  Editar URL
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#5A5A40] dark:text-amber-400 border border-amber-200 dark:border-amber-800 mx-auto flex items-center justify-center shadow-xs">
              {uploadType === 'document' ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>

            <div>
              <p className="text-xs font-bold text-[#434331] dark:text-[#F1F5F9] font-serif">
                {label}
              </p>
              <p className="text-[11px] text-[#7C796F] dark:text-[#94A3B8] mt-0.5">
                {sublabel}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold uppercase tracking-wider rounded-full flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Examinar o Tomar Foto</span>
              </button>

              {showUrlInput && (
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="px-3 py-2 bg-[#E5E2D9] dark:bg-[#334155] hover:bg-[#D1CEC7] dark:hover:bg-[#475569] text-[#434331] dark:text-[#F1F5F9] text-xs font-semibold rounded-full flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Pegar URL</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <span>⚡ Conectado a Supabase Storage</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manual URL Input Form */}
      {showManualInput && (
        <div className="p-3 bg-[#F5F2ED] dark:bg-[#1E293B] rounded-2xl border border-[#D1CEC7] dark:border-[#334155] space-y-2 animate-in fade-in">
          <label className="block text-[11px] font-bold text-[#434331] dark:text-[#E2E8F0]">
            Ingresar URL directa de la imagen / archivo
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... o https://tu-supabase.co/storage/..."
              className="flex-1 bg-white dark:bg-[#0F172A] border border-[#D1CEC7] dark:border-[#475569] rounded-xl px-3 py-1.5 text-xs text-[#434331] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
            <button
              type="button"
              onClick={handleApplyManualUrl}
              className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#434331] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {successInfo && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
