'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, X, AlertCircle, ScrollText, UserCheck, Eraser, PenTool, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface PolicySignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (data: { nombreFirmante: string; documentoFirmante: string; firmaVirtualBase64?: string }) => void;
  initialNombre?: string;
  isSubmitting?: boolean;
}

export default function PolicySignatureModal({
  isOpen,
  onClose,
  onSign,
  initialNombre = '',
  isSubmitting = false,
}: PolicySignatureModalProps) {
  const [nombreFirmante, setNombreFirmante] = useState(initialNombre);
  const [documentoFirmante, setDocumentoFirmante] = useState('');
  const [hasReadAndAgreed, setHasReadAndAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isExpandedText, setIsExpandedText] = useState(false);

  // Canvas de Firma Virtual Manuscrita
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombreFirmante(initialNombre);
      setError('');
      setHasDrawnSignature(false);
    }
  }, [isOpen, initialNombre]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    setError('');

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Tinta oscura Slate-900
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleSubmitSignature = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreFirmante.trim()) {
      setError('Por favor ingresa tu Nombre Completo como emprendedor responsable');
      return;
    }

    const docClean = documentoFirmante.replace(/\D/g, '');

    if (!docClean) {
      setError('Por favor ingresa tu número de Cédula de Ciudadanía Colombiana');
      return;
    }

    if (docClean.length < 7 || docClean.length > 10) {
      setError('La Cédula de Ciudadanía Colombiana debe contener entre 7 y 10 dígitos numéricos (ej. 1032456789 o 72123456)');
      return;
    }

    if (!hasDrawnSignature) {
      setError('Por favor traza tu firma manuscrita en el recuadro interactivo');
      return;
    }

    if (!hasReadAndAgreed) {
      setError('Debes marcar la casilla declarando haber leído y aceptado la Política POL-EMP-001');
      return;
    }

    let firmaVirtualBase64: string | undefined = undefined;
    if (canvasRef.current && hasDrawnSignature) {
      firmaVirtualBase64 = canvasRef.current.toDataURL('image/png');
    }

    onSign({
      nombreFirmante: nombreFirmante.trim(),
      documentoFirmante: documentoFirmante.trim(),
      firmaVirtualBase64,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D85A30] rounded-2xl shadow-md text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Firma Digital & Manuscrita
                </span>
                <span className="text-[11px] text-slate-400 font-mono">POL-EMP-001 v1.0</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Política de Responsabilidad de Calidad, Higiene y Manipulación
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Documento Legal Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 font-mono text-[11px]">
            <p><strong>DOCUMENTO LEGAL INSTITUCIONAL:</strong> POL-EMP-001</p>
            <p><strong>VERSIÓN:</strong> 1.0 | <strong>FECHA DE EMISIÓN:</strong> 18 de agosto de 2026</p>
            <p><strong>APROBACIÓN Y VALIDACIÓN LEGAL:</strong> CEO Richard Francisco Guzmán Guzmán</p>
          </div>

          {/* Barra de Controles de Lectura Completa */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ScrollText className="w-4 h-4 text-[#D85A30]" />
              <span>Contrato Institucional POL-EMP-001 (8 Secciones Legales)</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsExpandedText(!isExpandedText)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer text-xs"
              >
                {isExpandedText ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reducir Vista</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#D85A30]" />
                    <span>Ampliar / Ver Todo el Contrato</span>
                  </>
                )}
              </button>

              <a
                href="/politica-higiene"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Abrir en Nueva Pestaña</span>
              </a>
            </div>
          </div>

          {/* Texto Oficial Completo de la Política POL-EMP-001 v1.0 */}
          <div className={`space-y-5 text-slate-700 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-inner transition-all duration-300 ${
            isExpandedText ? 'max-h-none' : 'max-h-[380px] overflow-y-auto scrollbar-thin'
          }`}>
            <div className="text-center border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-black text-[#1F222E] text-base uppercase">
                POLÍTICA INSTITUCIONAL DE RESPONSABILIDAD, HIGIENE Y CALIDAD
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">POL-EMP-001 v1.0 — Universidad del Norte, Barranquilla</p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                1. OBJETIVO
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                Establecer las condiciones, responsabilidades y procedimientos que deben cumplir los emprendimientos afiliados a la plataforma UniPide para garantizar la calidad, higiene y seguridad de los productos y servicios ofrecidos a la comunidad universitaria, delimitando claramente que dicha responsabilidad recae de forma exclusiva en el emprendedor, y definiendo el rol de la plataforma como intermediario tecnológico no productor.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                2. ALCANCE
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                Esta política aplica a todos los emprendimientos estudiantiles que soliciten afiliación o se encuentren afiliados a la plataforma UniPide en la Universidad del Norte, especialmente aquellos que comercialicen alimentos, bebidas, ropa, accesorios, productos manufacturados o presten servicios en el campus.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                3. DEFINICIONES
              </h4>
              <ul className="text-xs space-y-1 list-disc pl-4 text-slate-700">
                <li><strong>Emprendimiento Afiliado:</strong> Persona natural o grupo de estudiantes inscritos que ofrecen bienes o servicios a través de la plataforma UniPide.</li>
                <li><strong>Plataforma (UniPide):</strong> Canal digital que facilita el contacto, catálogo y recepción de pedidos entre estudiantes usuarios y emprendimientos de Uninorte.</li>
                <li><strong>Buenas Prácticas de Manufactura (BPM):</strong> Principios básicos y prácticas de higiene en la manipulación, almacenamiento y preparación de alimentos y artículos.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                4. DIRECTRICES Y RESPONSABILIDAD EXCLUSIVA DE CALIDAD E HIGIENE
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                El emprendedor afiliado asume la <strong>responsabilidad total y exclusiva</strong> de la inocuidad, frescura, vigencia de fechas de vencimiento, etiquetado, empaque y calidad de sus productos. La plataforma UniPide, su equipo directivo y su representante legal Richard Francisco Guzmán Guzmán (CEO), actúan únicamente como un canal de intermediación tecnológica y no ejercen labores de producción, preparación, empaque ni distribución directa de los bienes comercializados, quedando exentos de responsabilidad sanitaria, civil o legal.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                5. BUENAS PRÁCTICAS EN LA PREPARACIÓN Y ENTREGA EN CAMPUS
              </h4>
              <p className="text-xs leading-relaxed text-slate-700 mb-1.5">
                Los emprendimientos afiliados se comprometen expresamente a:
              </p>
              <ul className="text-xs space-y-1 list-disc pl-4 text-slate-700">
                <li>Utilizar insumos frescos, utensilios limpios y empaques debidamente sellados que protejan el contenido de contaminación externa.</li>
                <li>Mantener la cadena de frío y temperaturas adecuadas de conservación para productos perecederos durante su transporte y entrega en Uninorte.</li>
                <li>Abstenerse estrictamente de vender productos vencidos, alterados, deteriorados o no autorizados por el reglamento del campus.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                6. AUTONOMÍA E INDEPENDENCIA OPERATIVA
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                La afiliación a UniPide no constituye relación laboral, subordinación de empleo, representación mercantil ni sociedad comercial entre el emprendedor y UniPide. Cada emprendedor opera como comerciante independiente.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                7. DERECHO DE SUSPENSIÓN Y RETIRO DE LA PLATAFORMA
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                UniPide se reserva la facultad de suspender o retirar de forma definitiva la tienda virtual de cualquier emprendimiento que registre quejas reiteradas o graves sobre calidad, higiene o violaciones al reglamento institucional.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#1F222E] text-xs uppercase tracking-wider border-b border-slate-150 pb-1 mb-1.5 text-[#D85A30]">
                8. DECLARACIÓN JURAMENTADA Y ACEPTACIÓN DE TÉRMINOS
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                Al diligenciar los datos a continuación y trazar la firma manuscrita, el estudiante o representante legal declara bajo gravedad de juramento haber leído, comprendido y aceptado en su totalidad las cláusulas de esta Política POL-EMP-001 v1.0.
              </p>
            </div>

            {!isExpandedText && (
              <div className="text-center pt-3 pb-1 border-t border-slate-200 bg-amber-50/50 rounded-xl p-2">
                <button
                  type="button"
                  onClick={() => setIsExpandedText(true)}
                  className="text-xs font-black text-[#D85A30] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Haz clic aquí para ampliar y desplegar las 8 cláusulas completas sin desplazarte</span>
                </button>
              </div>
            )}
          </div>

          {/* Formulario de Firma Digital Juramentada & Canvas Manuscrito */}
          <form onSubmit={handleSubmitSignature} id="signature-form" className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#D85A30]/30 space-y-4">
            <div className="flex items-center justify-between gap-2 text-xs font-black text-[#D85A30] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#D85A30]" />
                <span>Diligenciamiento de Firma Digital & Manuscrita</span>
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre Completo del Emprendedor Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={nombreFirmante}
                  onChange={(e) => setNombreFirmante(e.target.value)}
                  placeholder="Ej. Juan Carlos Pérez Gómez"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#D85A30] outline-none font-medium text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cédula de Ciudadanía Colombiana (7 a 10 dígitos) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={documentoFirmante}
                  onChange={(e) => setDocumentoFirmante(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej. 1032456789 o 72123456"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#D85A30] outline-none font-medium text-slate-900 bg-white font-mono"
                />
              </div>
            </div>

            {/* Recuadro Interactivo de Firma Manuscrita en Canvas */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#D85A30]" />
                  <span>Traza tu Firma Manuscrita con tu Mouse o Pantalla Táctil *</span>
                </label>
                {hasDrawnSignature && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Borrar y Volver a Firmar</span>
                  </button>
                )}
              </div>

              <div className="relative bg-white rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 cursor-crosshair touch-none bg-white"
                />
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Firma aquí usando tu mouse, lápiz o dedo...
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox de Aceptación Juramentada */}
            <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-amber-50/50 transition">
              <input
                type="checkbox"
                checked={hasReadAndAgreed}
                onChange={(e) => setHasReadAndAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#D85A30] rounded focus:ring-[#D85A30]"
              />
              <span className="text-xs text-slate-700 font-medium leading-relaxed">
                Declaro bajo gravedad de juramento que he leído, entiendo y acepto en su totalidad la <strong>Política POL-EMP-001 (Versión 1.0)</strong>. Reconozco que mi emprendimiento es el único responsable de la calidad e higiene de los productos que comercializo y eximo a la plataforma UniPide de toda responsabilidad legal.
              </span>
            </label>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#0F6E56]" />
            <span>Firma virtual manuscrita e información legal encriptadas.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="signature-form"
              disabled={isSubmitting || !hasReadAndAgreed || !hasDrawnSignature}
              className="w-1/2 sm:w-auto px-6 py-2.5 text-xs font-black text-white bg-[#D85A30] hover:bg-[#F56649] disabled:opacity-50 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando firma...' : 'Firmar y Aceptar POL-EMP-001'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
