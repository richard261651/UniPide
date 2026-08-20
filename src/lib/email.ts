export async function sendRecoveryEmail(
  toEmail: string,
  code: string
): Promise<{ sent: boolean; provider: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide <onboarding@resend.dev>';

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: '🔒 Código de verificación de contraseña - UniPide',
          html: `
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
                ⏱️ Este código expira en <strong>15 minutos</strong>.
              </p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'Resend' };
      }
    } catch (err: any) {
      console.error('Error enviando correo de recuperación:', err);
    }
  }

  console.log(`🔒 [UNIPIDE RECOVERY] Código para ${toEmail}: ${code}`);
  return { sent: false, provider: 'Console' };
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const fechaActual = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `🧾 Factura Digital UniPide - Recibo de Suscripción (${data.wompiRef})`;
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-b: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="font-size: 26px; font-weight: 900; color: #1e293b;">Uni<span style="color: #D85A30;">Pide</span></span>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Factura Digital de Suscripción & Afiliación</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px border-dashed #cbd5e1; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 800;">Detalles del Recibo</h4>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Cliente:</strong> ${data.nombreEmprendedor}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Emprendimiento:</strong> ${data.nombreNegocio}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Ref. Wompi:</strong> <span font-family: monospace; color: #D85A30;">${data.wompiRef}</span></p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Fecha:</strong> ${fechaActual}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Modalidad:</strong> ${data.tipoSuscripcion === 'DEBITO_AUTOMATICO' ? 'Débito Automático Recurrente Wompi' : 'Prepagado Mensual (PSE / Nequi)'}</p>
        <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Método:</strong> ${data.metodoPago}</p>
      </div>

      <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <span style="font-size: 11px; font-weight: 700; color: #991B1B; text-transform: uppercase; tracking-wider: 1px;">Monto Total Cobrado</span>
        <h2 style="margin: 4px 0 0 0; font-size: 32px; font-weight: 900; color: #D85A30;">$${data.monto.toLocaleString('es-CO')} COP</h2>
        <p style="font-size: 11px; color: #0F6E56; margin-top: 4px; font-weight: 700;">
          ${data.esFundador ? '⭐ Incluye Descuento del 33% (Tarifa Fundador UniPide por 3 meses)' : 'Tarifa Estándar Mensual'}
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px;">
        <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.5;">
          ✅ <strong>Estado del Pago:</strong> Verificado por Wompi Colombia.<br />
          ⏳ <strong>Próximo Paso:</strong> Tu emprendimiento ha sido notificado al equipo Administrador de UniPide para su autorización final de publicación en el campus.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; pt-16; text-align: center; margin-top: 20px;">
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">UniPide — Universidad del Norte, Barranquilla</p>
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide Facturación <onboarding@resend.dev>';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: fromEmail, to: [data.toEmail], subject, html: htmlContent }),
      });
      console.log(`[FACTURA ENVIADA] Factura enviada a ${data.toEmail} (${data.wompiRef})`);
    } catch (e) {
      console.error('Error enviando factura por Resend:', e);
    }
  }

  console.log(`🧾 [FACTURA DIGITAL] Para ${data.toEmail}: Monto $${data.monto} COP | Ref: ${data.wompiRef}`);
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const subject = `🔔 [ADMIN ALERT] Nuevo Emprendimiento Pendiente de Aprobación: ${data.nombreNegocio}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 14px;">
      <h3 style="color: #1e293b; margin-top: 0;">Solicitud de Emprendimiento con Pago Verificado</h3>
      <p style="font-size: 13px; color: #475569;">El emprendimiento <strong>${data.nombreNegocio}</strong> (Responsable: ${data.nombreEmprendedor}) ha completado su firma legal POL-EMP-001 y verificado su pago de suscripción con Wompi.</p>
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 12px; margin: 15px 0;">
        <p style="margin: 3px 0;"><strong>Ref. Wompi:</strong> ${data.wompiRef}</p>
        <p style="margin: 3px 0;"><strong>Monto Pagado:</strong> $${data.monto.toLocaleString('es-CO')} COP</p>
        <p style="margin: 3px 0; color: #0F6E56;"><strong>Firma POL-EMP-001:</strong> Registrada ✅</p>
      </div>
      <p style="font-size: 12px; color: #64748b;">Por favor ingresa al portal de administración en <strong>/admin/solicitudes</strong> para dar la autorización final.</p>
    </div>
  `;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide Admin Alert <onboarding@resend.dev>';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: fromEmail, to: [data.adminEmail], subject, html: htmlContent }),
      });
    } catch (e) {
      console.error('Error enviando alerta admin:', e);
    }
  }

  console.log(`🔔 [ADMIN NOTIFICATION] Alerta a ${data.adminEmail} para aprobar ${data.nombreNegocio}`);
}

/**
 * Notifica al Emprendedor que su emprendimiento ha sido APROBADO por el Admin y ya está visible
 */
export async function sendBusinessApprovedEmail(data: {
  toEmail: string;
  nombreEmprendedor: string;
  nombreNegocio: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const subject = `🎉 ¡Tu emprendimiento ${data.nombreNegocio} ha sido APROBADO en UniPide!`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
      <h2 style="color: #0F6E56; margin-top: 0;">¡Felicitaciones, ${data.nombreEmprendedor}! 🎉</h2>
      <p style="font-size: 14px; color: #334155; line-height: 1.5;">
        El administrador ha revisado y <strong>APROBADO</strong> tu emprendimiento <strong>${data.nombreNegocio}</strong>.
      </p>
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 700;">
          🚀 Tu tienda ya es visible para miles de estudiantes en el campus Uninorte.
        </p>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        Ya puedes ingresar a tu portal de emprendedor para agregar tus productos, promociones y gestionar tus pedidos en tiempo real.
      </p>
    </div>
  `;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide <onboarding@resend.dev>';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: fromEmail, to: [data.toEmail], subject, html: htmlContent }),
      });
    } catch (e) {
      console.error('Error enviando correo de aprobación:', e);
    }
  }

  console.log(`🎉 [BUSINESS APPROVED] Correo enviado a ${data.toEmail} para ${data.nombreNegocio}`);
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const subject = `⚠️ [ALERTA] Tu suscripción de UniPide para ${data.nombreNegocio} vence en ${data.diasRestantes} días`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #fbc6bb; border-radius: 16px; background: #fff8f6;">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 900; color: #D85A30;">UniPide Alerta de Suscripción</span>
      </div>

      <h3 style="color: #991B1B; margin-top: 0; text-align: center;">⏱️ Tu Suscripción caduca pronto</h3>

      <p style="font-size: 13px; color: #334155; line-height: 1.5;">
        Hola <strong>${data.nombreEmprendedor}</strong>, te recordamos que la suscripción activa de tu negocio <strong>${data.nombreNegocio}</strong> vence el <strong>${data.fechaFin}</strong> (en ${data.diasRestantes} días).
      </p>

      <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; margin: 16px 0;">
        <p style="margin: 4px 0; font-size: 12px; color: #475569;"><strong>Monto de Renovación:</strong> $${data.montoRenovacion.toLocaleString('es-CO')} COP</p>
        <p style="margin: 4px 0; font-size: 12px; color: #D85A30;"><strong>Mantén tu beneficio:</strong> Renueva a tiempo para conservar tu posición destacada de primero en tu categoría.</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://unipide.app/emprendedor/suscripcion" style="background-color: #D85A30; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; text-decoration: none; display: inline-block;">
          Renovar Suscripción Ahora por PSE / Nequi
        </a>
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniPide Recordatorios <onboarding@resend.dev>';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: fromEmail, to: [data.toEmail], subject, html: htmlContent }),
      });
    } catch (e) {
      console.error('Error enviando notificación de expiración:', e);
    }
  }

  console.log(`⚠️ [SUBSCRIPTION EXPIRING ALERT] Notificado ${data.toEmail} (${data.nombreNegocio}): vence en ${data.diasRestantes} días.`);
}
