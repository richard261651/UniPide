import { NextRequest, NextResponse } from 'next/server';
import { generateTotpSecret, getTotpAuthUrl, verifyTotpCode } from '@/lib/totp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, action, secret, token } = body;

    if (!correo) {
      return NextResponse.json({ error: 'El correo es obligatorio' }, { status: 400 });
    }

    const cleanEmail = correo.trim().toLowerCase();

    // Acción 1: Generar secreto 2FA y QR Code
    if (action === 'generate') {
      const totpSecret = generateTotpSecret(16);
      const { otpauthUrl, qrImageUrl } = getTotpAuthUrl(cleanEmail, totpSecret);

      return NextResponse.json({
        success: true,
        secret: totpSecret,
        otpauthUrl,
        qrImageUrl,
      });
    }

    // Acción 2: Verificar token de 6 dígitos introducido por el usuario desde la App Authenticator
    if (action === 'verify') {
      if (!secret || !token) {
        return NextResponse.json({ error: 'Secreto y código de 6 dígitos son requeridos' }, { status: 400 });
      }

      const isValid = verifyTotpCode(secret, token);

      if (!isValid) {
        return NextResponse.json(
          { error: 'El código de 6 dígitos introducido no coincide con tu aplicación Authenticator. Verifica la hora de tu celular o intenta con el código actual.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '¡Doble factor de autenticación (2FA) vinculado exitosamente!',
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en setup 2FA:', error);
    return NextResponse.json({ error: 'Error al configurar autenticación de doble factor' }, { status: 500 });
  }
}
