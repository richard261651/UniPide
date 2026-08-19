export async function sendRecoveryEmail(toEmail: string, code: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'UniPide Security <seguridad@unipide.com>',
          to: [toEmail],
          subject: '🔒 Código de verificación de contraseña - UniPide',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: 900; color: #000000; letter-spacing: -0.5px;">Uni<span style="color: #C8102E;">Pide</span></span>
                <p style="font-size: 11px; color: #888; margin-top: 2px;">Marketplace Universitario Uninorte</p>
              </div>

              <h3 style="font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; text-align: center;">Recuperación de Contraseña</h3>
              <p style="font-size: 13px; color: #555; line-height: 1.5; text-align: center;">
                Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación de 6 dígitos:
              </p>

              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; text-align: center; padding: 18px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #C8102E; font-family: monospace;">${code}</span>
              </div>

              <p style="font-size: 11px; color: #777; text-align: center; line-height: 1.4;">
                ⏱️ Este código expira en <strong>15 minutos</strong>.<br />
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
              </p>

              <div style="border-top: 1px solid #eee; margin-top: 24px; padding-top: 16px; text-align: center;">
                <p style="font-size: 10px; color: #aaa;">© ${new Date().getFullYear()} UniPide — Universidad del Norte, Barranquilla</p>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL SENT] Código enviado a ${toEmail} vía Resend API`);
        return true;
      } else {
        const errorData = await res.json();
        console.error('[EMAIL ERROR] Error enviando con Resend:', errorData);
      }
    } catch (err) {
      console.error('[EMAIL ERROR] Excepción en servicio de correo:', err);
    }
  }

  // Fallback seguro en consola de servidor para entornos local / desarrollo
  console.log(`\n======================================================`);
  console.log(`🔒 [UNIPIDE SEGURIDAD] CÓDIGO DE RECUPERACIÓN GENERADO`);
  console.log(`Destinatario: ${toEmail}`);
  console.log(`Código de Verificación: ${code}`);
  console.log(`Válido durante: 15 Minutos`);
  console.log(`======================================================\n`);
  return true;
}
