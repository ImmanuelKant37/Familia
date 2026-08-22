import React, { useState } from 'react';
import { 
  Download, Upload, FileCode, CheckCircle, 
  AlertCircle, X, ArrowDownToLine, Database, RefreshCw, BookMarked, Sparkles 
} from 'lucide-react';
import { useTree } from '../../context/TreeContext';

interface GedcomModalProps {
  onClose: () => void;
  onOpenBookModal?: () => void;
}

export const GedcomModal: React.FC<GedcomModalProps> = ({
  onClose,
  onOpenBookModal
}) => {
  const { 
    activeTree, people, exportGedcomData, 
    exportJsonData, importGedcomData, importJsonData 
  } = useTree();

  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportGedcom = () => {
    if (!activeTree) return;
    const gedcomContent = exportGedcomData();
    const blob = new Blob([gedcomContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTree.name.replace(/\s+/g, '_')}_GEDCOM.ged`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!activeTree) return;
    const jsonContent = exportJsonData();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTree.name.replace(/\s+/g, '_')}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRunImport = async () => {
    if (!importText.trim()) return;

    setIsImporting(true);
    setImportStatus(null);
    try {
      if (importText.trim().startsWith('{')) {
        await importJsonData(importText);
        setImportStatus('¡Base de datos JSON importada con éxito!');
      } else {
        const count = await importGedcomData(importText);
        setImportStatus(`¡Importación GEDCOM completada con éxito! Se cargaron ${count} personas.`);
      }
      setImportText('');
    } catch (err: any) {
      setImportStatus(`Error al importar: ${err.message || 'Formato no válido'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-[#F5F2ED]" />
            <h2 className="font-serif font-bold text-lg">
              Importar / Exportar GEDCOM & JSON
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2ED] p-2 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode('export')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              mode === 'export' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Árbol</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('import')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              mode === 'import' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Archivo</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          
          {mode === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7C796F] font-serif italic">
                Descarga una copia completa de tu árbol genealógico en formatos estándar de la industria o en un formato de Libro Decorado para imprimir o compartir.
              </p>

              {/* Libro Decorado Feature Banner */}
              {onOpenBookModal && (
                <div className="bg-gradient-to-r from-[#F5F2ED] via-[#FDFBF7] to-[#F5F2ED] p-4 rounded-2xl border border-[#D1CEC7] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-serif font-bold text-sm text-[#434331]">Libro Genealógico Decorado</h4>
                        <span className="bg-[#A65D47] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Nuevo</span>
                      </div>
                      <p className="text-xs text-[#7C796F] font-serif mt-0.5 leading-relaxed">
                        Exportación maquetada con portada, índice de linajes, biografías, estadísticas y tablas formateadas en PDF, Excel y JSON.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBookModal();
                    }}
                    className="w-full sm:w-auto shrink-0 bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir Exportador Libro</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 font-serif font-bold text-[#434331]">
                      <FileCode className="w-4 h-4 text-[#5A5A40]" />
                      <span>Formato Estándar GEDCOM 5.5.1 (.ged)</span>
                    </div>
                    <p className="text-xs text-[#7C796F] mt-1.5 font-serif leading-relaxed">
                      Compatible con cualquier software o plataforma genealógica internacional.
                    </p>
                  </div>
                  <button
                    onClick={handleExportGedcom}
                    className="w-full bg-[#5A5A40] hover:bg-[#434331] text-white py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Descargar .GED</span>
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 font-serif font-bold text-[#434331]">
                      <Database className="w-4 h-4 text-[#A65D47]" />
                      <span>Respaldo Completo JSON (.json)</span>
                    </div>
                    <p className="text-xs text-[#7C796F] mt-1.5 font-serif leading-relaxed">
                      Copia integral de personas, relaciones, fotos, fuentes y comentarios.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] border border-[#D1CEC7] py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7C796F] font-serif italic">
                Carga un archivo .ged (GEDCOM) o .json para poblar o enriquecer el árbol genealógico.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                  Seleccionar archivo de tu computadora
                </label>
                <input
                  type="file"
                  accept=".ged,.json,.txt"
                  onChange={handleFileUpload}
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-xs text-[#434331]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                  O pegar contenido GEDCOM / JSON directamente
                </label>
                <textarea
                  rows={5}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="0 HEAD&#10;1 SOUR DigitalTree&#10;1 GEDC&#10;2 VERS 5.5.1..."
                  className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-xs font-mono text-[#434331]"
                />
              </div>

              {importStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                  importStatus.includes('Error') 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {importStatus.includes('Error') ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#7C796F] hover:bg-[#E5E2D9] rounded-full"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleRunImport}
                  disabled={!importText.trim() || isImporting}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isImporting ? 'animate-spin' : ''}`} />
                  <span>{isImporting ? 'Procesando...' : 'Iniciar Importación'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
