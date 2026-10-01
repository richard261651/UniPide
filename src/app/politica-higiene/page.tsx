'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Printer, ArrowLeft, FileText, CheckCircle2, Lock } from 'lucide-react';

export default function PoliticaHigienePage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:w-full print:space-y-4">
        
        {/* Barra superior de navegación y acciones (oculta al imprimir) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a UniPide</span>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D85A30]" />
                <span>Política POL-EMP-001 v1.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Lectura Oficial e Institucional del Contrato</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <Link
              href="/register"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Ir a Registrar y Firmar</span>
            </Link>
          </div>
        </div>

        {/* Documento Legal Oficial Completo */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-0">
          
          {/* Header Formal */}
          <div className="text-center border-b-2 border-slate-200 pb-6 mb-8 print:pb-4 print:mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-slate-900 border border-amber-300 font-black text-xs uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-[#D85A30]" />
              <span>Documento Legal Institucional — POL-EMP-001 v1.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Política Institucional de Responsabilidad, Higiene y Calidad de Productos
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 font-mono mt-1">
              Plataforma UniPide — Universidad del Norte, Barranquilla, Colombia
            </p>
          </div>

          {/* Ficha Metadatos */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-700 print:bg-white print:border-slate-300">
            <div>
              <strong className="text-slate-900">CÓDIGO NORMA:</strong> POL-EMP-001
            </div>
            <div>
              <strong className="text-slate-900">VERSIÓN VIGENTE:</strong> 1.0 (Oficial)
            </div>
            <div>
              <strong className="text-slate-900">FECHA EMISIÓN:</strong> 18 de agosto de 2026
            </div>
            <div>
              <strong className="text-slate-900">APROBACIÓN LEGAL:</strong> CEO Richard Francisco Guzmán Guzmán
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
              Aplica a todos los emprendimientos afiliados y usuarios vendedores dentro del campus UniNorte.
            </div>
          </div>

          {/* Cláusulas Oficiales Completas */}
          <div className="space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
            
            {/* Cláusula 1 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>1. OBJETIVO INSTITUCIONAL</span>
              </h3>
              <p className="text-justify text-slate-700">
                Establecer las condiciones, responsabilidades y procedimientos que deben cumplir los emprendimientos afiliados a la plataforma UniPide para garantizar la calidad, higiene y seguridad de los productos y servicios ofrecidos a la comunidad universitaria, delimitando claramente que dicha responsabilidad recae de forma exclusiva en el emprendedor, y definiendo el rol de la plataforma como intermediario tecnológico no productor.
              </p>
            </div>

            {/* Cláusula 2 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>2. ALCANCE Y CAMPO DE APLICACIÓN</span>
              </h3>
              <p className="text-justify text-slate-700">
                Esta política aplica a todos los emprendimientos estudiantiles que soliciten afiliación o se encuentren afiliados a la plataforma UniPide en la Universidad del Norte, especialmente aquellos que comercialicen alimentos, bebidas, ropa, accesorios, productos manufacturados o presten servicios dentro del campus universitario.
              </p>
            </div>

            {/* Cláusula 3 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>3. DEFINICIONES OPERATIVAS</span>
              </h3>
              <ul className="space-y-2 list-disc pl-5 text-slate-700">
                <li>
                  <strong className="text-slate-900">Emprendimiento Afiliado:</strong> Persona natural o grupo de estudiantes inscritos que ofrecen bienes o servicios a través de la plataforma UniPide.
                </li>
                <li>
                  <strong className="text-slate-900">Plataforma (UniPide):</strong> Canal digital que facilita el contacto, catálogo y recepción de pedidos entre estudiantes usuarios y emprendimientos de Uninorte.
                </li>
                <li>
                  <strong className="text-slate-900">Buenas Prácticas de Manufactura (BPM):</strong> Principios básicos y prácticas de higiene en la manipulación, almacenamiento y preparación de alimentos y artículos comercializados.
                </li>
              </ul>
            </div>

            {/* Cláusula 4 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>4. DIRECTRICES Y EXENCIÓN TOTAL DE RESPONSABILIDAD LEGAL</span>
              </h3>
              <p className="text-justify text-slate-700">
                El emprendedor afiliado asume la <strong className="text-slate-900 font-bold">responsabilidad total y exclusiva</strong> de la inocuidad, frescura, vigencia de fechas de vencimiento, etiquetado, empaque y calidad de sus productos. La plataforma UniPide, su equipo directivo y su representante legal Richard Francisco Guzmán Guzmán (CEO), actúan únicamente como un canal de intermediación tecnológica y no ejercen labores de producción, preparación, empaque ni distribución directa de los bienes comercializados, quedando exentos de responsabilidad sanitaria, civil, penal o administrativa.
              </p>
            </div>

            {/* Cláusula 5 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>5. BUENAS PRÁCTICAS EN LA PREPARACIÓN Y ENTREGA EN CAMPUS</span>
              </h3>
              <p className="text-slate-700">
                Los emprendimientos afiliados se comprometen expresamente a:
              </p>
              <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                <li>Utilizar insumos frescos, utensilios limpios y empaques debidamente sellados que protejan el contenido de contaminación externa.</li>
                <li>Mantener la cadena de frío y temperaturas adecuadas de conservación para productos perecederos durante su transporte y entrega en Uninorte.</li>
                <li>Abstenerse strictly de vender productos vencidos, alterados, deteriorados o no autorizados por el reglamento del campus.</li>
              </ul>
            </div>

            {/* Cláusula 6 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>6. AUTONOMÍA E INDEPENDENCIA OPERATIVA</span>
              </h3>
              <p className="text-justify text-slate-700">
                La afiliación a UniPide no constituye relación laboral, subordinación de empleo, representación mercantil ni sociedad comercial entre el emprendedor y UniPide. Cada emprendedor opera como comerciante independiente bajo su propio riesgo y gestión.
              </p>
            </div>

            {/* Cláusula 7 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>7. DERECHO DE SUSPENSIÓN Y RETIRO DE LA PLATAFORMA</span>
              </h3>
              <p className="text-justify text-slate-700">
                UniPide se reserva la facultad de suspender o retirar de forma definitiva la tienda virtual de cualquier emprendimiento que registre quejas reiteradas o graves sobre calidad, higiene o violaciones al reglamento institucional.
              </p>
            </div>

            {/* Cláusula 8 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[#D85A30] text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <span>8. DECLARACIÓN JURAMENTADA Y VINCULACIÓN LEGAL</span>
              </h3>
              <p className="text-justify text-slate-700">
                Al diligenciar los datos requeridos y trazar la firma manuscrita en el formulario de registro o panel de emprendedor, el estudiante o representante legal declara bajo gravedad de juramento haber leído, comprendido y aceptado en su totalidad las cláusulas de esta Política POL-EMP-001 v1.0.
              </p>
            </div>

          </div>

          {/* Pie de Página Formal */}
          <div className="mt-12 pt-6 border-t-2 border-slate-200 text-center text-xs text-slate-500 font-mono space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-700 font-bold">
              <Lock className="w-4 h-4 text-[#0F6E56]" />
              <span>UniPide — Marketplace Estudiantil de la Universidad del Norte</span>
            </div>
            <p>Barranquilla, Colombia | Documento Norma POL-EMP-001 Versión 1.0 (Vigente 2026)</p>
          </div>

        </div>
      </div>
    </div>
  );
}
