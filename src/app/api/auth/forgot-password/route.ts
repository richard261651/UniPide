import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';
import { recoveryTokens } from '@/lib/recoveryStore';
import { sendRecoveryEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu correo electrónico' },
        { status: 400 }
      );
    }

    const cleanEmail = correo.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { correo: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No encontramos ninguna cuenta registrada con este correo electrónico' },
        { status: 404 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido desactivada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Generar un código aleatorio de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Expira en 15 minutos

    // Guardar en almacenamiento seguro del servidor
    recoveryTokens.set(cleanEmail, { code: resetCode, expiresAt });

    // Enviar código vía servicio seguro de correo
    await sendRecoveryEmail(cleanEmail, resetCode);

    // Retorno seguro (SIN exponer el resetCode en la respuesta HTTP pública)
    return NextResponse.json({
      success: true,
      message: 'Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.',
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de recuperación' },
      { status: 500 }
    );
  }
}
