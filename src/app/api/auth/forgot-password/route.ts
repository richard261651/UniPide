import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu correo electrónico registrado' },
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

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { correo: cleanEmail },
          { correoPersonal: cleanEmail },
        ],
      },
      select: { id: true, nombre: true, correo: true, correoPersonal: true, activo: true, twoFactorSecret: true, twoFactorEnabled: true },
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

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      nombreUsuario: user.nombre,
      requires2FA: true,
      has2FA: Boolean(user.twoFactorSecret),
    });
  } catch (error: any) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de recuperación' },
      { status: 500 }
    );
  }
}
