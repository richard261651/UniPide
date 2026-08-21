import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

interface ContractData {
 nombreNegocio: string;
 nombreFirmante: string;
 documentoFirmante: string;
 correo: string;
 fechaFirma: Date;
 versionPolitica?: string;
 firmaVirtualBase64?: string | null;
}

/**
 * Genera el documento HTML/PDF formal del contrato POL-EMP-001 firmado digitalmente
 */
export async function generateDigitalContractDocument(data: ContractData) {
 const fechaStr = data.fechaFirma.toLocaleString('es-CO', {
 dateStyle: 'full',
 timeStyle: 'medium',
 });

 const version = data.versionPolitica || 'POL-EMP-001 v1.0';
 const rawSignatureData = `${data.nombreNegocio}|${data.nombreFirmante}|${data.documentoFirmante}|${data.fechaFirma.toISOString()}`;
 const digitalHash = crypto.createHash('sha256').update(rawSignatureData).digest('hex').toUpperCase();

 const htmlDocument = `<!DOCTYPE html>
<html lang="es">
<head>
 <meta charset="UTF-8">
 <title>Contrato Digital ${version} - ${data.nombreNegocio}</title>
 <style>
 body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 30px; border: 2px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; }
 .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px; }
 .brand { font-size: 28px; font-weight: 900; color: #0f172a; }
 .brand-accent { color: #D85A30; }
 .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: bold; }
 .badge { display: inline-block; background-color: #FEEBE7; color: #D85A30; border: 1px solid #FBC6BB; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; margin-top: 8px; }
 .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 25px; font-size: 13px; }
 .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
 .section-title { font-size: 15px; font-weight: 800; color: #0f172a; border-left: 4px solid #D85A30; padding-left: 10px; margin-top: 25px; margin-bottom: 10px; }
 p { font-size: 12.5px; text-align: justify; color: #334155; }
 ul { font-size: 12.5px; color: #334155; padding-left: 20px; }
 .stamp-box { background-color: #F0FDF4; border: 2px border-dashed #4ADE80; border-radius: 14px; padding: 20px; margin-top: 35px; text-align: center; }
 .hash { font-family: monospace; font-size: 11px; color: #166534; word-break: break-all; margin-top: 8px; font-weight: bold; }
 .footer { font-size: 10px; text-align: center; color: #94a3b8; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
 </style>
</head>
<body>
 <div class="header">
 <div class="brand">Uni<span class="brand-accent">Pide</span></div>
 <div class="subtitle">UNIVERSIDAD DEL NORTE — MARKETPLACE ESTUDIANTIL</div>
 <div class="badge">DOCUMENTO LEGAL FIRMADO DIGITALMENTE — POL-EMP-001 v1.0</div>
 </div>

 <div class="meta-box">
 <div class="meta-row"><strong>Documento Norma:</strong> <span>Política POL-EMP-001 v1.0</span></div>
 <div class="meta-row"><strong>Emprendimiento Afiliado:</strong> <span>${data.nombreNegocio}</span></div>
 <div class="meta-row"><strong>Estudiante Responsable / Firmante:</strong> <span>${data.nombreFirmante}</span></div>
 <div class="meta-row"><strong>Documento de Identidad / Código:</strong> <span>${data.documentoFirmante}</span></div>
 <div class="meta-row"><strong>Correo Electrónico Registrado:</strong> <span>${data.correo}</span></div>
 <div class="meta-row"><strong>Fecha y Hora de Firma Digital:</strong> <span>${fechaStr}</span></div>
 <div class="meta-row"><strong>Representante Plataforma UniPide:</strong> <span>Richard Francisco Guzmán Guzmán (CEO)</span></div>
 </div>

 <h3 class="section-title">1. OBJETIVO</h3>
 <p>Establecer las condiciones, responsabilidades y procedimientos que deben cumplir los emprendimientos afiliados a la plataforma UniPide para garantizar la calidad, higiene y seguridad de los productos que ofrecen a los usuarios universitarios, delimitando claramente que dicha responsabilidad recae de forma exclusiva en el emprendedor, y definiendo el rol de la plataforma como intermediario tecnológico no productor.</p>

 <h3 class="section-title">2. ALCANCE</h3>
 <p>Esta política aplica a todos los emprendimientos estudiantiles que soliciten afiliación o se encuentren afiliados a la plataforma UniPide en la Universidad del Norte, especialmente aquellos que comercialicen alimentos, bebidas y productos manufacturados.</p>

 <h3 class="section-title">3. DEFINICIONES</h3>
 <ul>
 <li><strong>Emprendimiento Afiliado:</strong> Persona natural o grupo de estudiantes inscritos que ofrecen bienes a través de la plataforma.</li>
 <li><strong>Plataforma (UniPide):</strong> Canal digital que facilita el contacto, catálogo y pedido entre usuarios y emprendimientos de Uninorte.</li>
 <li><strong>Buenas Prácticas de Manufactura (BPM):</strong> Principios básicos y prácticas de higiene en la manipulación y preparación de alimentos.</li>
 </ul>

 <h3 class="section-title">4. DIRECTRICES Y RESPONSABILIDAD EXCLUSIVA</h3>
 <p>El emprendedor afiliado asume la responsabilidad total de la inocuidad, frescura, etiquetado y calidad de sus productos. La plataforma UniPide, representada por Richard Francisco Guzmán Guzmán (CEO), actúa únicamente como facilitador tecnológico y no ejerce labores de producción ni empaque directo.</p>

 <h3 class="section-title">5. DECLARACIÓN JURAMENTADA DE ACEPTACIÓN</h3>
 <p>Yo, <strong>${data.nombreFirmante}</strong>, identificado con documento/código <strong>${data.documentoFirmante}</strong>, en calidad de representante de <strong>${data.nombreNegocio}</strong>, declaro juramentadamente haber leído, entendido y aceptado de manera voluntaria los términos de la Política POL-EMP-001 v1.0 emitida el 18 de agosto de 2026.</p>

  <div class="stamp-box">
    <div style="font-size: 14px; font-weight: 800; color: #15803D;">FIRMADO LEGALMENTE Y VERIFICADO DIGITALMENTE</div>
    ${
      data.firmaVirtualBase64
        ? `<div style="margin: 15px 0; text-align: center;">
            <p style="font-size: 10px; color: #475569; font-weight: bold; margin-bottom: 6px;">FIRMA VIRTUAL MANUSCRITA TRAZADA:</p>
            <img src="${data.firmaVirtualBase64}" alt="Firma Manuscrita Virtual" style="max-height: 80px; max-width: 280px; margin: 0 auto; display: block; border-bottom: 1.5px solid #0f172a;" />
          </div>`
        : ''
    }
    <div style="font-size: 11px; color: #166534; margin-top: 4px;">Estampa de Firma Digital Criptográfica (SHA-256):</div>
    <div class="hash">${digitalHash}</div>
  </div>

 <div class="footer">
 UniPide — Universidad del Norte, Barranquilla, Colombia | Documento generado automáticamente el ${fechaStr}
 </div>
</body>
</html>`;

  const safeBizName = data.nombreNegocio.replace(/[^a-zA-Z0-9]/g, '_');
  const safeDoc = data.documentoFirmante.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `POL-EMP-001_${safeBizName}_${safeDoc}.html`;
  let filePath = path.join(os.tmpdir(), fileName);

  try {
    const storageDir = path.join(os.tmpdir(), 'unipide-contratos');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    filePath = path.join(storageDir, fileName);
    fs.writeFileSync(filePath, htmlDocument, 'utf8');
  } catch (fsErr: any) {
    console.warn('📁 [AVISO DISCO SERVERLESS] No se pudo escribir archivo físico en disco, continuando en memoria:', fsErr.message);
  }

  return {
    fileName,
    filePath,
    htmlDocument,
    digitalHash,
  };
}
