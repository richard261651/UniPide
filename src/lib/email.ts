/**
 * Servicio Centralizado de Envío de Correos Electrónicos UniPide
 * Soporte Multi-Proveedor: Mailjet (Principal) y Resend (Fallback / Secundario)
 */

export async function sendEmailViaMailjet({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const fromHeader = process.env.MAILJET_FROM_EMAIL || 'UniPide <team@unipide.com>';

  if (!apiKey || !apiSecret) {
    return { sent: false, error: 'Falta MAILJET_API_KEY o MAILJET_API_SECRET en variables de entorno' };
  }

  let fromEmail = 'team@unipide.com';
  let fromName = 'UniPide';
  const match = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    fromName = match[1].trim();
    fromEmail = match[2].trim();
  } else if (fromHeader.includes('@')) {
    fromEmail = fromHeader.trim();
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
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
            Subject: subject,
            HTMLPart: html,
            TextPart: text || subject,
          },
        ],
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.Messages?.[0]?.Status === 'success') {
      console.log(`✅ [MAILJET ENVIADO] De: ${fromEmail} | Para: ${to} | Asunto: "${subject}"`);
      return { sent: true };
    } else {
      console.error(`❌ [MAILJET ERROR ${res.status}]`, data);
      return { sent: false, error: JSON.stringify(data) };
    }
  } catch (err: any) {
    console.error('❌ [MAILJET EXCEPCION]', err);
    return { sent: false, error: err.message };
  }
}

export async function sendEmailViaResend({
  to,
  subject,
  html,
  replyTo = 'team@unipide.com',
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return { sent: false, error: 'Falta RESEND_API_KEY en variables de entorno' };
  }

  let fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide <onboarding@resend.dev>';
  if (fromEmail.includes('@gmail.com')) {
    fromEmail = 'UniPide Administrador <onboarding@resend.dev>';
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`✅ [RESEND ENVIADO] Remitente: ${fromEmail} | Destino: ${to} | Asunto: "${subject}"`);
      return { sent: true };
    } else {
      const errBody = await res.json().catch(() => ({}));
      console.error(`❌ [RESEND ERROR ${res.status}]`, errBody);
      return { sent: false, error: errBody.message || `Error HTTP ${res.status} desde Resend` };
    }
  } catch (err: any) {
    console.error('❌ [RESEND EXCEPCION]', err);
    return { sent: false, error: err.message };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
    const mjRes = await sendEmailViaMailjet({ to, subject, html, text });
    if (mjRes.sent) {
      return { sent: true, provider: 'Mailjet' };
    }
    console.warn('⚠️ Mailjet no pudo enviar, probando con Resend...');
  }

  if (process.env.RESEND_API_KEY) {
    const resendRes = await sendEmailViaResend({ to, subject, html });
    if (resendRes.sent) {
      return { sent: true, provider: 'Resend' };
    }
  }

  console.warn(`⚠️ [MODO CONSOLA] Para: ${to} | Asunto: "${subject}"`);
  return { sent: false, provider: 'Console', error: 'No hay servicio de correo activo' };
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

 const result = await sendEmail({ to: toEmail, subject, html, text: `Tu código de recuperación es: ${code}` });
 return { sent: result.sent, provider: result.provider, error: result.error };
}

/**
 * Envía el Código de Verificación de Correo Gmail al Emprendedor al registrarse
 */
export async function sendEmailVerificationCode(data: {
  toEmail: string;
  nombre: string;
  code: string;
  correoInstitucional?: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const subject = `UniPide — Código de Verificación (${data.code})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; text-align: center;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 28px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Marketplace Oficial Emprendimientos Uninorte</p>
      </div>

      <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">¡Verifica tu Cuenta en UniPide!</h3>
      <p style="font-size: 14px; color: #334155; line-height: 1.6; text-align: justify; margin-bottom: 20px;">
        Hola <strong>${data.nombre}</strong>, hemos validado tu identidad institucional${data.correoInstitucional ? ` (<strong>${data.correoInstitucional}</strong>)` : ''}. Para activar tu cuenta de forma segura, ingresa el siguiente código de 6 dígitos:
      </p>

      <div style="background-color: #FFF5F2; border: 2px dashed #D85A30; border-radius: 16px; text-align: center; padding: 20px; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #D85A30; font-family: monospace;">${data.code}</span>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.4;">
        Este código es personal y expira en 15 minutos.
      </p>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla, Colombia</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.toEmail,
    subject,
    html,
    text: `Tu código de confirmación UniPide es: ${data.code}`,
  });
}

interface InvoiceEmailData {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
  monto: number;
  wompiRef: string;
  tipoSuscripcion: 'PREPAGADO' | 'DEBITO_AUTOMATICO';
  metodoPago: string;
  esFundador: boolean;
}

/**
 * Envía la Factura Digital y Recibo de Pago de Suscripción al Emprendedor
 */
export async function sendSubscriptionInvoiceEmail(data: InvoiceEmailData) {
  const fechaActual = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Factura Digital UniPide - Recibo de Suscripción (${data.wompiRef})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="font-size: 26px; font-weight: 900; color: #1e293b;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Factura Digital de Suscripción & Afiliación</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 800;">Detalles del Recibo</h4>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Cliente:</strong> ${data.nombreEmprendedor}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Emprendimiento:</strong> ${data.nombreNegocio}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Fecha:</strong> ${fechaActual}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Método:</strong> ${data.metodoPago}</p>
      </div>

      <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <span style="font-size: 11px; font-weight: 700; color: #991B1B; text-transform: uppercase;">Monto Total Cobrado</span>
        <h2 style="margin: 4px 0 0 0; font-size: 32px; font-weight: 900; color: #D85A30;">$${data.monto.toLocaleString('es-CO')} COP</h2>
        <p style="font-size: 11px; color: #0F6E56; margin-top: 4px; font-weight: 700;">
          ${data.esFundador ? 'Incluye Descuento del 33% (Tarifa Fundador UniPide por 3 meses)' : 'Tarifa Estándar Mensual'}
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px;">
        <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.5;">
          <strong>Estado del Pago:</strong> Verificado por la administración.<br />
          <strong>Próximo Paso:</strong> Tu emprendimiento ha sido notificado al equipo Administrador de UniPide para la apertura de tu tienda.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; text-align: center; margin-top: 20px; padding-top: 12px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla</p>
      </div>
    </div>
  `;

  return await sendEmail({ to: data.toEmail, subject, html });
}

/**
 * Notifica al Administrador que hay un nuevo negocio con Pago Verificado listo para Aprobación
 */
export async function sendAdminNewPendingBusinessEmail(data: {
  adminEmail: string;
  nombreNegocio: string;
  nombreEmprendedor: string;
  wompiRef: string;
  monto: number;
}) {
  const subject = `[ADMIN ALERT] Nuevo Emprendimiento Pendiente de Aprobación: ${data.nombreNegocio}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 14px;">
      <h3 style="color: #1e293b; margin-top: 0;">Solicitud de Emprendimiento con Pago Verificado</h3>
      <p style="font-size: 13px; color: #475569;">El emprendimiento <strong>${data.nombreNegocio}</strong> (Responsable: ${data.nombreEmprendedor}) ha completado su firma legal POL-EMP-001 y verificado su pago de suscripción.</p>
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 12px; margin: 15px 0;">
        <p style="margin: 3px 0;"><strong>Monto Pagado:</strong> $${data.monto.toLocaleString('es-CO')} COP</p>
        <p style="margin: 3px 0; color: #0F6E56;"><strong>Firma POL-EMP-001:</strong> Registrada</p>
      </div>
      <p style="font-size: 12px; color: #64748b;">Por favor ingresa al portal de administración en <strong>/admin/solicitudes</strong> para dar la autorización final.</p>
    </div>
  `;

  return await sendEmail({ to: data.adminEmail, subject, html });
}

/**
 * Notifica al Emprendedor que su pago ha sido verificado por el Administrador y su emprendimiento ha sido APROBADO Y ABIERTO
 */
export async function sendBusinessApprovedEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
}) {
  const subject = `¡Pago Confirmado! Tu emprendimiento ${data.nombreNegocio} ha sido APROBADO y ABIERTO en UniPide`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; text-align: center;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 26px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Marketplace Universitario Uninorte</p>
      </div>

      <h2 style="color: #0F6E56; margin-top: 0; font-size: 20px; font-weight: 800;">¡Pago Confirmado y Tienda Abierta, ${data.nombreEmprendedor}!</h2>
      
      <p style="font-size: 13.5px; color: #334155; line-height: 1.6; text-align: justify; margin-top: 14px;">
        El Administrador de <strong>UniPide</strong> ha verificado exitosamente tu pago de afiliación y ha <strong>APROBADO Y ACTIVADO</strong> tu emprendimiento <strong>${data.nombreNegocio}</strong>.
      </p>

      <div style="background-color: #F0FDF4; border: 2px border-dashed #4ADE80; padding: 18px; border-radius: 16px; margin: 24px 0; text-align: left;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #166534; font-weight: 800;">
          Estado del Negocio: ABIERTO Y OPERATIVO
        </p>
        <p style="margin: 0; font-size: 12px; color: #15803D; line-height: 1.5;">
          • Pago verificado manualmente por la administración.<br />
          • Catálogo de productos visible para estudiantes en campus Uninorte.<br />
          • Recepción de pedidos en tiempo real activada.
        </p>
      </div>

      <p style="font-size: 12.5px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
        Ya puedes ingresar a tu portal con tu correo (<strong>${data.toEmail}</strong>) para publicar tus productos, combos y gestionar tus pedidos.
      </p>

      <div style="margin-top: 20px;">
        <a href="https://unipide.app/login" style="background-color: #D85A30; color: #ffffff; padding: 13px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-block;">
          Ingresar al Portal del Emprendedor
        </a>
      </div>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 16px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla, Colombia</p>
      </div>
    </div>
  `;

  return await sendEmail({ to: data.toEmail, subject, html });
}

/**
 * Notifica al Emprendimiento que su suscripción o periodo de promoción está por caducar
 */
export async function sendSubscriptionExpiringEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
  diasRestantes: number;
  fechaFin: string;
  montoRenovacion: number;
}) {
  const subject = `[ALERTA] Tu suscripción de UniPide para ${data.nombreNegocio} vence en ${data.diasRestantes} días`;
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #fbc6bb; border-radius: 16px; background: #fff8f6;">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 900; color: #D85A30;">UniPide Alerta de Suscripción</span>
      </div>

      <h3 style="color: #991B1B; margin-top: 0; text-align: center;">Tu Suscripción caduca pronto</h3>

      <p style="font-size: 13px; color: #334155; line-height: 1.5;">
        Hola <strong>${data.nombreEmprendedor}</strong>, te recordamos que la suscripción activa de tu negocio <strong>${data.nombreNegocio}</strong> vence el <strong>${data.fechaFin}</strong> (en ${data.diasRestantes} días).
      </p>

      <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; margin: 16px 0;">
        <p style="margin: 4px 0; font-size: 12px; color: #475569;"><strong>Monto de Renovación:</strong> $${data.montoRenovacion.toLocaleString('es-CO')} COP</p>
        <p style="margin: 4px 0; font-size: 12px; color: #D85A30;"><strong>Mantén tu beneficio:</strong> Renueva a tiempo para conservar tu posición destacada de primero en tu categoría.</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://unipide.app/emprendedor/suscripcion" style="background-color: #D85A30; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
          Renovar Suscripción Ahora
        </a>
      </div>
    </div>
  `;

  return await sendEmail({ to: data.toEmail, subject, html });
}

/**
 * Envía el correo formal "Gracias por aceptar nuestros términos y contrato" al Emprendedor
 */
export async function sendContractAcceptedEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
  nombreFirmante: string;
  documentoFirmante: string;
  correoInstitucional: string;
  contratoUrl?: string | null;
  businessId?: string;
}) {
  const fechaActual = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `UniPide — Gracias por aceptar nuestros términos y contrato (${data.nombreNegocio})`;
  const contractLink = data.contratoUrl || `https://unipide.com/emprendedor/suscripcion`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="font-size: 28px; font-weight: 900; color: #000000;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Marketplace Oficial Emprendimientos Uninorte</p>
      </div>

      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-align: center;">¡Gracias por aceptar nuestros términos y contrato!</h2>
      
      <p style="font-size: 14px; color: #334155; line-height: 1.6; text-align: justify; margin-bottom: 20px;">
        Hola <strong>${data.nombreEmprendedor}</strong>, te confirmamos que hemos recibido satisfactoriamente el registro de tu emprendimiento <strong>${data.nombreNegocio}</strong> y la firma digital de la <strong>Política de Calidad e Higiene POL-EMP-001 (Versión 1.0)</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Resumen del Contrato y Registro Legal</h4>
        <p style="margin: 5px 0; font-size: 12px; color: #334155;"><strong>Emprendimiento:</strong> ${data.nombreNegocio}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #334155;"><strong>Firmante Autorizado:</strong> ${data.nombreFirmante}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #334155;"><strong>Cédula / Documento:</strong> ${data.documentoFirmante}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #334155;"><strong>Correo Institucional Uninorte:</strong> ${data.correoInstitucional}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #334155;"><strong>Fecha de Firma:</strong> ${fechaActual}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #0F6E56;"><strong>Documento Aceptado:</strong> Política Institucional POL-EMP-001 v1.0</p>
      </div>

      <div style="background-color: #FFF5F2; border: 1px dashed #D85A30; border-radius: 14px; padding: 16px; margin: 20px 0; text-align: center;">
        <p style="font-size: 12.5px; color: #9A3412; margin: 0 0 12px 0; line-height: 1.5;">
          Tu copia digital del contrato legal ha sido archivada y firmada electrónicamente. Puedes consultarla o descargarla en cualquier momento:
        </p>
        <a href="${contractLink}" style="background-color: #D85A30; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 12.5px; text-decoration: none; display: inline-block;">
          Ver Mi Contrato Firmado POL-EMP-001
        </a>
      </div>

      <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px;">
        <p style="font-size: 11.5px; color: #475569; margin: 0; line-height: 1.5;">
          <strong>Siguiente Paso:</strong> Ingresa a tu panel de emprendedor para completar la activación de tu tienda y comenzar a vender en el campus Uninorte.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; text-align: center; margin-top: 24px; padding-top: 14px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla, Colombia</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.toEmail,
    subject,
    html,
    text: `Gracias por aceptar nuestros términos. Tu emprendimiento ${data.nombreNegocio} y contrato POL-EMP-001 han sido registrados exitosamente.`,
  });
}
