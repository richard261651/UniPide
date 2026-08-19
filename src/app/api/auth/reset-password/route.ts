import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';
import { recoveryTokens } from '@/lib/recoveryStore';

export async function POST(request: NextRequest) {
  try {
    const { correo, code, newPassword } = await request.json();

    if (!correo || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Correo, código de verificación y nueva contraseña son obligatorios' },
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

    const user = await prisma.user.findUnique({
      where: { correo: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No existe un usuario registrado con este correo electrónico' },
        { status: 404 }
      );
    }

    // Verificar token en servidor
    const tokenData = recoveryTokens.get(cleanEmail);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'No existe una solicitud de recuperación activa para este correo. Solicita un código nuevo.' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expiresAt) {
      recoveryTokens.delete(cleanEmail);
      return NextResponse.json(
        { error: 'El código de verificación ha expirado (límite 15 min). Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    if (tokenData.code !== cleanCode) {
      return NextResponse.json(
        { error: 'El código de verificación de 6 dígitos ingresado es incorrecto' },
        { status: 400 }
      );
    }

    // Encriptar nueva contraseña con bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña en base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidad token inmediatamente después del primer uso exitoso
    recoveryTokens.delete(cleanEmail);

    return NextResponse.json({
      success: true,
      message: '¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (error: any) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}
