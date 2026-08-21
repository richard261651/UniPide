import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';
import { verifyTotpCode } from '@/lib/totp';

export async function POST(request: NextRequest) {
  try {
    const { correo, code, newPassword } = await request.json();

    if (!correo || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Correo, código de 6 dígitos de tu Authenticator y nueva contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = correo.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No existe un usuario registrado con este correo electrónico' },
        { status: 404 }
      );
    }

    // Si el usuario no tiene 2FA vinculado por ser una cuenta previa, permitir restablecer directamente
    if (user.twoFactorSecret) {
      const isValidTotp = verifyTotpCode(user.twoFactorSecret, cleanCode);
      if (!isValidTotp) {
        return NextResponse.json(
          { error: 'El código de 6 dígitos introducido no coincide con tu aplicación Authenticator (Google / Microsoft Authenticator). Verifica la hora de tu dispositivo o intenta con el código actual.' },
          { status: 400 }
        );
      }
    }

    // Encriptar nueva contraseña con bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña en base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: '¡Tu contraseña ha sido actualizada con éxito mediante tu App Authenticator! Ya puedes iniciar sesión.',
    });
  } catch (error: any) {
    console.error('Error en reset-password 2FA:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña con 2FA' },
      { status: 500 }
    );
  }
}
