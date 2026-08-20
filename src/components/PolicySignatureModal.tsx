'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, X, AlertCircle, ScrollText, UserCheck } from 'lucide-react';

interface PolicySignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (data: { nombreFirmante: string; documentoFirmante: string }) => void;
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

  if (!isOpen) return null;

  const handleSubmitSignature = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreFirmante.trim()) {
      setError('Por favor ingresa tu Nombre Completo como emprendedor responsable');
      return;
    }

    if (!documentoFirmante.trim()) {
      setError('Por favor ingresa tu Documento de Identidad o Código de Estudiante Uninorte');
      return;
    }

    if (!hasReadAndAgreed) {
      setError('Debes marcar la casilla declarando haber leído y aceptado la Política POL-EMP-001');
      return;
    }

    onSign({
      nombreFirmante: nombreFirmante.trim(),
      documentoFirmante: documentoFirmante.trim(),
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
                  Firma Digital Obligatoria
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

          {/* Texto Oficial de la Política */}
          <div className="space-y-4 text-slate-700 bg-white p-4 sm:p-6 rounded-2xl border border-slate-150 shadow-inner">
            <div>
              <h3 className="font-extrabold text-[#1F222E] text-sm sm:text-base border-b border-slate-200 pb-1 mb-2">
                1. Objetivo
              </h3>
              <p>
                Establecer las condiciones, responsabilidades y procedimientos que deben cumplir los emprendimientos afiliados a la plataforma para garantizar la calidad, higiene y seguridad de los productos que ofrecen a los usuarios, delimitando claramente que dicha responsabilidad recae en el emprendedor, y definiendo el rol de la plataforma como intermediario tecnológico no productor.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-[#1F222E] text-sm sm:text-base border-b border-slate-200 pb-1 mb-2">
                2. Alcance
              </h3>
              <p>Esta política aplica a:</p>
              <ul className="list-disc pl-5 space-y-1 pt-1">
                <li>Todos los emprendimientos que soliciten afiliación o se encuentren afiliados a la plataforma, especialmente aquellos que comercialicen alimentos y bebidas.</li>
                <li>El equipo administrador de la plataforma, en cuanto a los procesos de aprobación, supervisión y respuesta ante incidentes.</li>
                <li>Los usuarios/clientes, en cuanto a los canales disponibles para reportar incidentes relacionados con calidad o higiene.</li>
              </ul>
              <p className="pt-1 italic text-slate-500">
                No aplica a la elaboración, producción o manipulación física de los productos, actividad que es responsabilidad exclusiva de cada emprendimiento.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-[#1F222E] text-sm sm:text-base border-b border-slate-200 pb-1 mb-2">
                3. Definiciones
              </h3>
              <ul className="space-y-2">
                <li><strong>Emprendimiento afiliado:</strong> Persona natural o grupo de estudiantes que ofrece productos o servicios a través de la plataforma, previa aprobación del administrador.</li>
                <li><strong>Plataforma:</strong> El sistema tecnológico (web/app) que actúa como intermediario entre emprendimientos y clientes, sin participar en la producción, preparación o manipulación de los productos.</li>
                <li><strong>Incidente de calidad o higiene:</strong> Cualquier situación reportada por un cliente relacionada con intoxicación, contaminación, mal estado del producto, o incumplimiento evidente de condiciones básicas de higiene.</li>
                <li><strong>Declaración de buenas prácticas:</strong> Documento firmado digitalmente por el emprendedor al momento de su registro, en el cual declara cumplir con condiciones mínimas de manipulación segura de alimentos.</li>
                <li><strong>Suspensión preventiva:</strong> Medida temporal que desactiva la visibilidad y operación de un emprendimiento en la plataforma mientras se investiga un incidente reportado.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-[#1F222E] text-sm sm:text-base border-b border-slate-200 pb-1 mb-2">
                4. Directrices
              </h3>
              
              <h4 className="font-bold text-[#D85A30] pt-1">4.1 Responsabilidad del emprendimiento</h4>
              <p>El emprendimiento es el único responsable de la calidad, higiene, seguridad y legalidad de los productos que ofrece. Debe cumplir con la normativa vigente aplicable a la manipulación de alimentos, cuando su actividad lo requiera, y aceptar expresamente la exención de responsabilidad para la plataforma.</p>

              <h4 className="font-bold text-[#D85A30] pt-2">4.2 Requisitos de ingreso a la plataforma</h4>
              <p>Todo emprendimiento debe firmar digitalmente la Declaración de Buenas Prácticas antes de ser aprobado. La plataforma no realiza inspecciones físicas como condición de ingreso; la aprobación se basa en la declaración juramentada.</p>

              <h4 className="font-bold text-[#D85A30] pt-2">4.3 Gestión de incidentes reportados</h4>
              <p>Ante un reporte grave de higiene (ej. sospecha de intoxicación), el administrador aplicará suspensión preventiva en un máximo de 24 horas para investigación.</p>

              <h4 className="font-bold text-[#D85A30] pt-2">4.4 Exclusión de responsabilidad de la plataforma</h4>
              <p>La plataforma no participa en la preparación, manipulación o entrega física de los productos y, por lo tanto, no asume responsabilidad legal por daños derivados de la calidad de los mismos.</p>

              <h4 className="font-bold text-[#D85A30] pt-2">4.5 Consecuencias por incumplimiento</h4>
              <p>Incidentes comprobados resultan en suspensión o desactivación permanente. La plataforma no cubrirá gastos médicos ni indemnizaciones; estos son responsabilidad exclusiva del emprendimiento.</p>
            </div>

            <div>
              <h3 className="font-extrabold text-[#1F222E] text-sm sm:text-base border-b border-slate-200 pb-1 mb-2">
                5. Roles y responsabilidades
              </h3>
              <ul className="space-y-1.5">
                <li><strong>Emprendedor:</strong> Cumplir normas de higiene aplicables, firmar la declaración de buenas prácticas, responder ante incidentes relacionados con sus productos, aceptar Términos y Condiciones.</li>
                <li><strong>Administrador de la plataforma:</strong> Aprobar/rechazar emprendimientos, gestionar el canal de reportes, aplicar suspensiones preventivas, documentar incidentes.</li>
                <li><strong>Cliente:</strong> Reportar incidentes de forma oportuna y veraz.</li>
                <li><strong>Equipo legal / CEO:</strong> Validar periódicamente la redacción y validez jurídica frente a la normativa colombiana (CEO Richard Francisco Guzmán Guzmán).</li>
              </ul>
            </div>
          </div>

          {/* Formulario de Firma Digital Juramentada */}
          <form onSubmit={handleSubmitSignature} id="signature-form" className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#D85A30]/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#D85A30] uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-[#D85A30]" />
              <span>Diligenciamiento de Firma Digital Legal</span>
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
                  Documento de Identidad / Código Estudiantil *
                </label>
                <input
                  type="text"
                  required
                  value={documentoFirmante}
                  onChange={(e) => setDocumentoFirmante(e.target.value)}
                  placeholder="Ej. CC 1032456789 / Cod. 200123456"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#D85A30] outline-none font-medium text-slate-900 bg-white"
                />
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
            <span>Firma digital encriptada con registro de IP y Timestamp.</span>
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
              disabled={isSubmitting || !hasReadAndAgreed}
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
