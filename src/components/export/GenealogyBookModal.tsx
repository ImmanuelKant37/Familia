import React, { useState } from 'react';
import { 
  BookOpen, Download, FileSpreadsheet, FileCode, Printer, 
  X, CheckCircle, Sparkles, Shield, Bookmark, ArrowRight, Eye, RefreshCw 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTree } from '../../context/TreeContext';
import { 
  generateGenealogyBookPDF, 
  generateGenealogyExcelBook, 
  generateDecoratedJsonBook 
} from '../../utils/exportDecoratedBook';

interface GenealogyBookModalProps {
  onClose: () => void;
}

export const GenealogyBookModal: React.FC<GenealogyBookModalProps> = ({ onClose }) => {
  const { 
    activeTree, people, relationships, events, 
    media, sources, getSanitizedPerson 
  } = useTree();

  const [tab, setTab] = useState<'pdf' | 'excel' | 'json' | 'preview'>('pdf');
  const [coverTitle, setCoverTitle] = useState(activeTree?.name || 'Crónica Familiar');
  const [coverSubtitle, setCoverSubtitle] = useState(activeTree?.description || 'Libro de Linajes y Memorias Ancestrales');
  const [dedication, setDedication] = useState('Para las generaciones presentes y futuras, en honor a la memoria de nuestros ancestros.');
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!activeTree) return null;

  const surnameStyles = activeTree.settings?.surnameStyles || {};

  const handleExportPDF = () => {
    setIsExporting(true);
    setSuccessMsg(null);
    try {
      const doc = generateGenealogyBookPDF(
        activeTree,
        people,
        relationships,
        events,
        sources,
        surnameStyles,
        {
          coverTitle,
          coverSubtitle,
          dedication
        }
      );
      const filename = `${activeTree.name.replace(/\s+/g, '_')}_Libro_Genealogico.pdf`;
      doc.save(filename);
      setSuccessMsg(`¡Libro PDF generado exitosamente: "${filename}"!`);
    } catch (e: any) {
      console.error('Error generating PDF book:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setSuccessMsg(null);
    try {
      const wb = generateGenealogyExcelBook(
        activeTree,
        people,
        relationships,
        events,
        sources
      );
      const filename = `${activeTree.name.replace(/\s+/g, '_')}_Libro_Genealogico.xlsx`;
      XLSX.writeFile(wb, filename);
      setSuccessMsg(`¡Libro Excel (.xlsx) generado exitosamente: "${filename}" con 5 pestañas de datos!`);
    } catch (e: any) {
      console.error('Error generating Excel book:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    setIsExporting(true);
    setSuccessMsg(null);
    try {
      const jsonStr = generateDecoratedJsonBook(
        activeTree,
        people,
        relationships,
        events,
        media,
        sources,
        surnameStyles
      );
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTree.name.replace(/\s+/g, '_')}_Libro_Decorado.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg('¡Archivo JSON con formato Libro Decorado descargado con éxito!');
    } catch (e: any) {
      console.error('Error generating JSON book:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D1CEC7] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-2xl">
              <BookOpen className="w-5 h-5 text-[#F5F2ED]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">
                Exportar Libro Genealógico Decorado
              </h2>
              <p className="text-[11px] text-[#F5F2ED]/80 font-sans">
                Genera tu crónica familiar en PDF ilustrado, Excel multilibro o JSON estructurado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2ED] p-2 text-xs font-semibold uppercase tracking-wider shrink-0">
          <button
            type="button"
            onClick={() => setTab('pdf')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'pdf' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#A65D47]" />
            <span>1. Libro PDF Ilustrado</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('excel')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'excel' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>2. Libro Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('json')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'json' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>3. Formato Libro JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'preview' ? 'bg-white shadow-xs text-[#434331] font-bold' : 'text-[#7C796F] hover:bg-[#E5E2D9]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Vista de Lectura / Imprimir</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PDF BOOK */}
          {tab === 'pdf' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4">
                <h4 className="font-serif font-bold text-base text-[#434331] flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-[#A65D47]" />
                  <span>Personalizar Portada del Libro PDF</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={coverTitle}
                      onChange={e => setCoverTitle(e.target.value)}
                      placeholder="Ej: ÁRBOL GENEALÓGICO DE LOS GARCÍA"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                      Subtítulo / Epígrafe
                    </label>
                    <input
                      type="text"
                      value={coverSubtitle}
                      onChange={e => setCoverSubtitle(e.target.value)}
                      placeholder="Ej: Crónica, linajes y memoria documental"
                      className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C796F] mb-1">
                    Dedicatoria o Cita Conmemorativa
                  </label>
                  <textarea
                    rows={2}
                    value={dedication}
                    onChange={e => setDedication(e.target.value)}
                    placeholder="Dedicatoria..."
                    className="w-full bg-[#F5F2ED] border border-[#D1CEC7] rounded-xl p-2.5 text-[#434331] font-serif text-xs"
                  />
                </div>
              </div>

              {/* Book Chapters summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#E5E2D9]">
                  <span className="font-serif font-bold text-[#5A5A40]">Capítulo I & II</span>
                  <p className="text-[11px] text-[#7C796F] mt-1">
                    Índice de linajes por apellido y {people.length} fichas biográficas individuales con fechas, lugares y certezas.
                  </p>
                </div>

                <div className="bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#E5E2D9]">
                  <span className="font-serif font-bold text-[#A65D47]">Capítulo III</span>
                  <p className="text-[11px] text-[#7C796F] mt-1">
                    Crónica cronológica de {events.length} acontecimientos históricos (bodas, nacimientos, migraciones).
                  </p>
                </div>

                <div className="bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#E5E2D9]">
                  <span className="font-serif font-bold text-[#434331]">Capítulo IV</span>
                  <p className="text-[11px] text-[#7C796F] mt-1">
                    Registro de {sources.length} fuentes archivísticas y citas parroquiales y civiles.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md flex items-center space-x-2 transition-transform transform active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generando Libro PDF...' : 'Descargar Libro PDF Decorado'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXCEL BOOK */}
          {tab === 'excel' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center space-x-2 text-[#2E7D32] font-serif font-bold text-base">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Libro de Cálculo Multitabla Excel (.XLSX)</span>
                </div>
                <p className="text-xs text-[#7C796F] font-serif leading-relaxed">
                  Genera una hoja de cálculo profesional con formato de libro encuadernado que incluye 5 hojas temáticas:
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#434331]">
                  <li className="flex items-center space-x-2 p-2 bg-[#F5F2ED] rounded-xl">
                    <span className="text-[#2E7D32] font-bold">1.</span>
                    <span>📖 <strong>Libro Genealógico:</strong> Resumen y distribución por apellidos</span>
                  </li>
                  <li className="flex items-center space-x-2 p-2 bg-[#F5F2ED] rounded-xl">
                    <span className="text-[#2E7D32] font-bold">2.</span>
                    <span>👥 <strong>Personas y Biografías:</strong> Registro completo con estados y lugares</span>
                  </li>
                  <li className="flex items-center space-x-2 p-2 bg-[#F5F2ED] rounded-xl">
                    <span className="text-[#2E7D32] font-bold">3.</span>
                    <span>🔗 <strong>Vínculos y Linajes:</strong> Relaciones padre-hijo, cónyuges y certezas</span>
                  </li>
                  <li className="flex items-center space-x-2 p-2 bg-[#F5F2ED] rounded-xl">
                    <span className="text-[#2E7D32] font-bold">4.</span>
                    <span>📅 <strong>Línea de Tiempo:</strong> Acontecimientos cronológicos detallados</span>
                  </li>
                  <li className="flex items-center space-x-2 p-2 bg-[#F5F2ED] rounded-xl col-span-1 sm:col-span-2">
                    <span className="text-[#2E7D32] font-bold">5.</span>
                    <span>📜 <strong>Fuentes y Archivos:</strong> Repositorios y citas bibliográficas</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md flex items-center space-x-2 transition-transform transform active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Compilando Excel...' : 'Descargar Libro Excel (.xlsx)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: JSON BOOK */}
          {tab === 'json' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center space-x-2 text-[#5A5A40] font-serif font-bold text-base">
                  <FileCode className="w-5 h-5" />
                  <span>Formato Libro JSON Decorado (.JSON)</span>
                </div>
                <p className="text-xs text-[#7C796F] font-serif leading-relaxed">
                  Exporta un archivo JSON de alta fidelidad estructurado como capítulos de un libro genealógico digital, incluyendo paletas personalizadas por apellido, nodos puente y metadatos de linaje.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={isExporting}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md flex items-center space-x-2 transition-transform transform active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generando JSON...' : 'Descargar JSON Formato Libro'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PREVIEW / PRINTABLE BOOK */}
          {tab === 'preview' && (
            <div className="space-y-6 print:p-0">
              <div className="flex items-center justify-between no-print">
                <p className="text-xs text-[#7C796F] font-serif italic">
                  Vista interactiva con estilo pergamino antiguo. Puedes imprimir directamente o guardar como PDF desde el navegador.
                </p>
                <button
                  onClick={handlePrint}
                  className="bg-[#5A5A40] hover:bg-[#434331] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>

              {/* Book Page Container */}
              <div className="bg-[#FAF7F0] border-4 border-[#5A5A40] p-8 sm:p-12 rounded-3xl shadow-xl space-y-8 relative overflow-hidden text-[#434331] font-serif">
                
                {/* Vintage Corner Ornaments */}
                <div className="text-center border-b-2 border-[#A65D47] pb-6">
                  <div className="text-2xl text-[#5A5A40] mb-1">✦ ✦ ✦</div>
                  <span className="text-xs font-sans uppercase tracking-widest text-[#A65D47] font-bold">
                    MEMORIAS Y ÁRBOL GENEALÓGICO
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase mt-2 text-[#434331]">
                    {coverTitle}
                  </h1>
                  <p className="text-sm italic text-[#7C796F] mt-1">
                    {coverSubtitle}
                  </p>
                  <p className="text-xs italic text-[#9A968A] mt-3 max-w-lg mx-auto">
                    «{dedication}»
                  </p>
                </div>

                {/* Chapter I: Linajes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-[#D1CEC7] pb-1 text-[#5A5A40] uppercase tracking-wider">
                    I. Registro de Miembros del Linaje
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {people.map((p, idx) => {
                      const sanitized = getSanitizedPerson(p);
                      const isPlaceholder = p.isPlaceholder || p.firstName.startsWith('[');
                      return (
                        <div 
                          key={p.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            isPlaceholder ? 'bg-amber-50/50 border-dashed border-amber-300' : 'bg-white border-[#E5E2D9]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-sm text-[#434331]">
                              {idx + 1}. {sanitized.firstName} {sanitized.lastName}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-[#A65D47] font-sans">
                              {isPlaceholder ? 'Tarjeta Puente' : sanitized.isLiving ? 'Persona Viva' : `Certeza: ${sanitized.certainty}`}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#7C796F]">
                            Nacimiento: {sanitized.birthDate || sanitized.birthDateApprox || 'S/D'} {sanitized.birthPlace ? `(${sanitized.birthPlace})` : ''}
                          </p>
                          <p className="text-[11px] text-[#7C796F]">
                            Defunción: {sanitized.isLiving ? 'En vida' : (sanitized.deathDate || sanitized.deathDateApprox || 'Fallecido/a')} {sanitized.deathPlace ? `(${sanitized.deathPlace})` : ''}
                          </p>
                          {sanitized.profession && (
                            <p className="text-[10px] uppercase tracking-wider text-[#9A968A] font-sans">
                              Profesión: {sanitized.profession}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chapter II: Timeline */}
                {events.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-[#D1CEC7]">
                    <h3 className="text-lg font-bold border-b border-[#D1CEC7] pb-1 text-[#5A5A40] uppercase tracking-wider">
                      II. Crónica y Acontecimientos Históricos
                    </h3>

                    <div className="space-y-2 text-xs">
                      {events.map(e => (
                        <div key={e.id} className="p-2.5 bg-white rounded-xl border border-[#E5E2D9] flex items-start space-x-2">
                          <span className="font-bold text-[#A65D47] shrink-0 font-sans">
                            {e.date || e.dateApprox || 'S/F'}:
                          </span>
                          <div>
                            <span className="font-bold text-[#434331]">{e.title}</span>
                            {e.place && <span className="text-[#7C796F] text-[11px]"> ({e.place})</span>}
                            {e.description && <p className="text-[#7C796F] text-[11px] mt-0.5">{e.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
