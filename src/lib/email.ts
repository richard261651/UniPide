import nodemailer from 'nodemailer';

export interface EmailAttachment {
  contentType?: string;
  filename: string;
  base64Content: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Envío directo vía Nodemailer / Gmail SMTP (smtp.gmail.com)
 * Garantiza 100% de entrega directa en la Bandeja de Entrada Principal al usar App Password de Google.
 */
export async function sendEmailViaNodemailer({
  to,
  subject,
  html,
  replyTo = 'richardbb839@gmail.com',
  attachments = [],
}: SendEmailParams): Promise<{ sent: boolean; error?: string }> {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER || 'richardbb839@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!pass) {
    return { sent: false, error: 'Falta GMAIL_APP_PASSWORD o SMTP_PASS en variables de entorno.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions: any = {
      from: `UniPide Administrador <${user}>`,
      to,
      replyTo,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.base64Content, 'base64'),
        contentType: att.contentType,
      }));
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(` 📧 [EMAIL GMAIL SMTP ENVIADO EXITOSAMENTE] ID: ${info.messageId} | Para: ${to} | Asunto: "${subject}"`);
    return { sent: true };
  } catch (err: any) {
    console.error(' ❌ [ERROR GMAIL SMTP NODEMAILER]', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Envío vía Mailjet API v3.1
 */
export async function sendEmailViaMailjet({
  to,
  subject,
  html,
  replyTo = 'richardbb839@gmail.com',
  attachments = [],
}: SendEmailParams): Promise<{ sent: boolean; error?: string }> {
  const mailjetApiKey = process.env.MAILJET_API_KEY;
  const mailjetApiSecret = process.env.MAILJET_API_SECRET;

  if (!mailjetApiKey || !mailjetApiSecret) {
    return { sent: false, error: 'Faltan MAILJET_API_KEY o MAILJET_API_SECRET en variables de entorno.' };
  }

  const fromRaw = process.env.MAILJET_FROM_EMAIL || 'UniPide Marketplace <richardbb839@gmail.com>';
  const match = fromRaw.match(/^(.*?)\s*<([^>]+)>$/);
  const fromName = match ? match[1].trim() : 'UniPide';
  const fromEmail = match ? match[2].trim() : fromRaw.trim();

  const authHeader = 'Basic ' + Buffer.from(`${mailjetApiKey}:${mailjetApiSecret}`).toString('base64');

  const mailjetPayload: any = {
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName,
        },
        To: [
          {
            Email: to,
          },
        ],
        ReplyTo: replyTo ? { Email: replyTo } : undefined,
        Subject: subject,
        HTMLPart: html,
      },
    ],
  };

  if (attachments && attachments.length > 0) {
    mailjetPayload.Messages[0].Attachments = attachments.map((att) => ({
      ContentType: att.contentType || 'application/pdf',
      Filename: att.filename,
      Base64Content: att.base64Content,
    }));
  }

  try {
    const res = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(mailjetPayload),
    });

    const data = await res.json().catch(() => ({}));
    const firstMsg = data.Messages?.[0];

    if (res.ok && firstMsg && firstMsg.Status === 'success') {
      console.log(` [EMAIL MAILJET ENVIADO EXITOSAMENTE] Remitente: ${fromEmail} | Destino: ${to} | Asunto: "${subject}" | Adjuntos: ${attachments.length}`);
      return { sent: true };
    } else {
      const errorMsg =
        firstMsg?.Errors?.[0]?.ErrorMessage ||
        data.ErrorMessage ||
        `Error Mailjet (Status: ${firstMsg?.Status || res.status})`;
      console.error(` [ERROR MAILJET API ${res.status}]`, errorMsg, JSON.stringify(data));
      return { sent: false, error: errorMsg };
    }
  } catch (err: any) {
    console.error(' [ERROR EXCEPCIÓN MAILJET]', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Envío vía Resend API
 */
export async function sendEmailViaResend({
  to,
  subject,
  html,
  replyTo = 'richardbb839@gmail.com',
  attachments = [],
}: SendEmailParams): Promise<{ sent: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return { sent: false, error: 'Falta RESEND_API_KEY en variables de entorno.' };
  }

  let fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide <onboarding@resend.dev>';
  if (fromEmail.includes('@gmail.com')) {
    fromEmail = 'UniPide Administrador <onboarding@resend.dev>';
  }

  try {
    const payload: any = {
      from: fromEmail,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.base64Content,
      }));
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(` [EMAIL RESEND ENVIADO] Remitente: ${fromEmail} | Destino: ${to} | Asunto: "${subject}" | Adjuntos: ${attachments.length}`);
      return { sent: true };
    } else {
      const errBody = await res.json().catch(() => ({}));
      console.error(` [ERROR RESEND ${res.status}]`, errBody);
      return { sent: false, error: errBody.message || `Error HTTP ${res.status} desde Resend` };
    }
  } catch (err: any) {
    console.error(' [ERROR ENVIANDO CORREO VÍA RESEND]', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Servicio Centralizado Inteligente de Correos.
 * Preferencia: Gmail SMTP (Nodemailer) > Mailjet > Resend > Simulación Consola.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ sent: boolean; provider: string; error?: string }> {
  // 1. Probar Gmail SMTP si está configurada la Contraseña de Aplicación de Google (GMAIL_APP_PASSWORD o SMTP_PASS)
  if (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS) {
    const res = await sendEmailViaNodemailer(params);
    if (res.sent) return { sent: true, provider: 'Gmail SMTP (Nodemailer)' };
    console.warn('⚠️ [FALLBACK SMTP -> MAILJET] Falló el envío con Gmail SMTP, intentando Mailjet...', res.error);
  }

  // 2. Probar Mailjet si están configuradas sus llaves
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
    const res = await sendEmailViaMailjet(params);
    if (res.sent) return { sent: true, provider: 'Mailjet' };
    console.warn('⚠️ [FALLBACK MAILJET -> RESEND] Falló el envío con Mailjet, intentando Resend...', res.error);
  }

  // 3. Probar Resend si está configurada su llave
  if (process.env.RESEND_API_KEY) {
    const res = await sendEmailViaResend(params);
    if (res.sent) return { sent: true, provider: 'Resend' };
    console.warn('⚠️ [FALLBACK RESEND -> CONSOLE] Falló el envío con Resend, simulando en consola...', res.error);
  }

  // 4. Fallback a consola si no hay proveedores configurados
  console.warn('⚠️ [EMAIL NO ENVIADO EN PRODUCCIÓN] Falta configurar GMAIL_APP_PASSWORD, MAILJET_API_KEY o RESEND_API_KEY en .env');
  console.log(` 📧 [EMAIL SIMULADO EN CONSOLA] Para: ${params.to} | Asunto: "${params.subject}" | Adjuntos: ${params.attachments?.length || 0}`);
  return { sent: false, provider: 'Console', error: 'Sin llaves de API configuradas' };
}

/**
 * Envía el Código de Verificación de Recuperación de Contraseña
 */
export async function sendRecoveryEmail(
  toEmail: string,
  code: string
): Promise<{ sent: boolean; provider: string; error?: string }> {
  const subject = 'Código de verificación de contraseña - UniPide';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #000000; letter-spacing: -0.5px;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 11px; color: #888; margin-top: 2px;">Marketplace Universitario Uninorte</p>
      </div>

      <h3 style="font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; text-align: center;">Recuperación de Contraseña</h3>
      <p style="font-size: 13px; color: #555; line-height: 1.5; text-align: center;">
        Has solicitado restablecer tu contraseña en <strong>UniPide</strong>. Utiliza el siguiente código de verificación:
      </p>

      <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; text-align: center; padding: 18px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #D85A30; font-family: monospace;">${code}</span>
      </div>

      <p style="font-size: 11px; color: #777; text-align: center; line-height: 1.4;">
        Este código expira en <strong>15 minutos</strong>.
      </p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html });
}

/**
 * Envía el Código de Verificación de Correo Gmail al Emprendedor al registrarse
 */
export async function sendEmailVerificationCode(data: {
  toEmail: string;
  nombre: string;
  code: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const subject = `Código de Verificación de Correo Gmail - UniPide (${data.code})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background-color: #ffffff; text-align: center;">
      <div style="margin-bottom: 18px;">
        <span style="font-size: 26px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Marketplace Universitario Uninorte</p>
      </div>

      <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Verificación de tu Correo Gmail</h3>
      <p style="font-size: 13px; color: #334155; line-height: 1.5; text-align: justify; margin-bottom: 20px;">
        Hola <strong>${data.nombre}</strong>, para completar tu registro de emprendedor en <strong>UniPide</strong> y activar tu cuenta, ingresa el siguiente código de verificación de 6 dígitos:
      </p>

      <div style="background-color: #FAF8F5; border: 2px border-dashed #D85A30; border-radius: 14px; text-align: center; padding: 20px; margin: 20px 0;">
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #D85A30; font-family: monospace;">${data.code}</span>
      </div>

      <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.4;">
        Este código es personal e intransferible. Si no realizaste este registro, puedes ignorar este correo.
      </p>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 14px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla</p>
      </div>
    </div>
  `;

  return sendEmail({ to: data.toEmail, subject, html });
}

/**
 * Envía el Contrato Digital Firmado (POL-EMP-001) adjunto en formato de archivo al Emprendedor con botones de descarga
 */
export async function sendSignedContractEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
  documentoFirmante: string;
  fechaFirma: Date;
  contractFileName: string;
  contractHtmlContent: string;
  businessId?: string;
  driveUrl?: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const downloadLink = data.businessId
    ? `https://unipide.com/api/businesses/${data.businessId}/contract?download=true`
    : data.driveUrl || '#';

  const viewLink = data.businessId
    ? `https://unipide.com/api/businesses/${data.businessId}/contract`
    : data.driveUrl || '#';

  const subject = `[CONTRATO FIRMADO] Copia de tu Política POL-EMP-001 v1.0 - ${data.nombreNegocio}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 26px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 26px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Marketplace Universitario Uninorte</p>
      </div>

      <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-align: center;">Confirmación de Firma de Contrato Digital</h3>
      <p style="font-size: 13px; color: #334155; line-height: 1.5; text-align: justify;">
        Hola <strong>${data.nombreEmprendedor}</strong>, confirmamos que has firmado digitalmente la Política de Higiene y Buenas Prácticas <strong>POL-EMP-001 v1.0</strong> para tu emprendimiento <strong>${data.nombreNegocio}</strong>.
      </p>

      <div style="background-color: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 14px; padding: 16px; margin: 20px 0;">
        <p style="margin: 3px 0; font-size: 12px; color: #166534;"><strong>Firmante Responsable:</strong> ${data.nombreEmprendedor} (${data.documentoFirmante})</p>
        <p style="margin: 3px 0; font-size: 12px; color: #166534;"><strong>Fecha y Hora de Firma:</strong> ${data.fechaFirma.toLocaleString('es-CO')}</p>
        <p style="margin: 3px 0; font-size: 12px; color: #166534;"><strong>Estado:</strong> Firmado, Sellado Criptográficamente y Guardado en Google Drive</p>
      </div>

      <!-- Botones Principales de Descargar y Ver Contrato -->
      <div style="text-align: center; margin: 24px 0;">
        <a href="${downloadLink}" target="_blank" rel="noopener noreferrer" style="background-color: #D85A30; color: #ffffff; padding: 12px 22px; border-radius: 12px; font-weight: 800; font-size: 12.5px; text-decoration: none; display: inline-block; margin: 5px;">
          📥 Descargar Contrato POL-EMP-001 (HTML/PDF)
        </a>
        <a href="${viewLink}" target="_blank" rel="noopener noreferrer" style="background-color: #0f172a; color: #ffffff; padding: 12px 22px; border-radius: 12px; font-weight: 800; font-size: 12.5px; text-decoration: none; display: inline-block; margin: 5px;">
          🔍 Ver en Navegador
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
        📎 Además, adjunto a este correo encontrarás el archivo ejecutable/documento oficial de tu contrato firmado para tus archivos personales.
      </p>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 14px; text-align: center;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla, Colombia</p>
      </div>
    </div>
  `;

  const base64Contract = Buffer.from(data.contractHtmlContent, 'utf-8').toString('base64');

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
    attachments: [
      {
        contentType: 'text/html',
        filename: data.contractFileName,
        base64Content: base64Contract,
      },
    ],
  });
}

/**
 * Notifica al Administrador que hay un nuevo negocio pendiente de Aprobación
 */
export async function sendAdminNewPendingBusinessEmail(data: {
  adminEmail: string;
  nombreNegocio: string;
  nombreEmprendedor: string;
}) {
  const subject = `[ADMIN ALERT] Nuevo Emprendimiento Pendiente de Aprobación: ${data.nombreNegocio}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 14px;">
      <h3 style="color: #1e293b; margin-top: 0;">Solicitud de Emprendimiento</h3>
      <p style="font-size: 13px; color: #475569;">El emprendimiento <strong>${data.nombreNegocio}</strong> (Responsable: ${data.nombreEmprendedor}) ha completado su registro y firma legal POL-EMP-001.</p>
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 12px; margin: 15px 0;">
        <p style="margin: 3px 0; color: #0F6E56;"><strong>Firma POL-EMP-001:</strong> Registrada</p>
      </div>
      <p style="font-size: 12px; color: #64748b;">Por favor ingresa al portal de administración en <strong>/admin/solicitudes</strong> para autorizar la apertura.</p>
    </div>
  `;

  return sendEmail({ to: data.adminEmail, subject, html });
}

/**
 * Notifica al Emprendedor que su emprendimiento ha sido APROBADO Y ABIERTO,
 * incluyendo enlaces de descarga en PDF/HTML del Contrato POL-EMP-001.
 */
export async function sendBusinessApprovedEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
  businessId?: string;
  contractHtmlContent?: string;
  contractFileName?: string;
}) {
  const contractDownloadUrl = data.businessId
    ? `https://unipide.com/api/businesses/${data.businessId}/contract?download=true`
    : '#';

  const subject = `¡Aprobación Confirmada! Tu emprendimiento ${data.nombreNegocio} ha sido ABIERTO en UniPide`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; text-align: center;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 26px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Marketplace Universitario Uninorte</p>
      </div>

      <h2 style="color: #0F6E56; margin-top: 0; font-size: 20px; font-weight: 800;">¡Negocio Aprobado y Tienda Abierta, ${data.nombreEmprendedor}!</h2>
      
      <p style="font-size: 13.5px; color: #334155; line-height: 1.6; text-align: justify; margin-top: 14px;">
        El Administrador de <strong>UniPide</strong> ha verificado exitosamente tu registro y ha <strong>APROBADO Y ACTIVADO</strong> tu emprendimiento <strong>${data.nombreNegocio}</strong> de forma 100% gratuita.
      </p>

      <div style="background-color: #F0FDF4; border: 2px border-dashed #4ADE80; padding: 18px; border-radius: 16px; margin: 24px 0; text-align: left;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #166534; font-weight: 800;">
          Estado del Negocio: ABIERTO Y OPERATIVO EN CAMPUS UNINORTE
        </p>
        <p style="margin: 0; font-size: 12px; color: #15803D; line-height: 1.5;">
          • Registro verificado y aprobado por la administración.<br />
          • Catálogo de productos visible para estudiantes en campus Uninorte.<br />
          • Recepción de pedidos en tiempo real activada.
        </p>
      </div>

      <!-- Botones de Descarga en PDF/HTML para el Contrato -->
      <div style="background-color: #FAF8F5; border: 1px solid #FBC6BB; border-radius: 16px; padding: 18px; margin: 24px 0; text-align: center;">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: 800;">📄 Descarga de Documentos Oficiales en PDF / HTML</h4>
        <p style="font-size: 11.5px; color: #64748b; margin-bottom: 14px;">Puedes descargar o imprimir en formato PDF tu contrato firmado:</p>
        
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <a href="${contractDownloadUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #D85A30; color: #ffffff; padding: 11px 18px; border-radius: 12px; font-weight: 800; font-size: 12px; text-decoration: none; display: inline-block; margin: 4px;">
            📜 Descargar Contrato POL-EMP-001 (PDF/HTML)
          </a>
        </div>
      </div>

      <div style="margin-top: 24px;">
        <a href="https://unipide.app/login" style="background-color: #0f172a; color: #ffffff; padding: 13px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-block;">
          Ingresar al Portal del Emprendedor
        </a>
      </div>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 16px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla, Colombia</p>
      </div>
    </div>
  `;

  const attachments: EmailAttachment[] = [];
  if (data.contractHtmlContent && data.contractFileName) {
    attachments.push({
      contentType: 'text/html',
      filename: data.contractFileName,
      base64Content: Buffer.from(data.contractHtmlContent, 'utf-8').toString('base64'),
    });
  }

  return sendEmail({ to: data.toEmail, subject, html, attachments });
}
