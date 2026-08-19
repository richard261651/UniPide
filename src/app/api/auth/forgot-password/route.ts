import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';

// Mapa en memoria para tokens/códigos temporales de recuperación en desarrollo
const recoveryTokens = new Map<string, { code: string; expiresAt: number }>();

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

    // Guardar en mapa
    recoveryTokens.set(cleanEmail, { code: resetCode, expiresAt });

    return NextResponse.json({
      success: true,
      message: 'Código de recuperación generado correctamente.',
      resetCode, // Retornado para facilitar pruebas rápidas en interfaz demo
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

export { recoveryTokens };
