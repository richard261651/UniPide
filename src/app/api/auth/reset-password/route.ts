import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';
import { recoveryTokens } from '../forgot-password/route';

export async function POST(request: NextRequest) {
  try {
    const { correo, code, newPassword } = await request.json();

    if (!correo || !newPassword) {
      return NextResponse.json(
        { error: 'Correo y nueva contraseña son obligatorios' },
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
        { error: 'No existe un usuario con este correo electrónico' },
        { status: 404 }
      );
    }

    // Verificar código si está registrado en el mapa en memoria
    const tokenData = recoveryTokens.get(cleanEmail);
    if (tokenData) {
      if (Date.now() > tokenData.expiresAt) {
        recoveryTokens.delete(cleanEmail);
        return NextResponse.json(
          { error: 'El código de recuperación ha expirado. Por favor solicita uno nuevo.' },
          { status: 400 }
        );
      }

      if (code && tokenData.code !== code.trim()) {
        return NextResponse.json(
          { error: 'El código de recuperación ingresado es incorrecto' },
          { status: 400 }
        );
      }
    }

    // Encriptar nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // Actualizar usuario en base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Limpiar token usado
    recoveryTokens.delete(cleanEmail);

    return NextResponse.json({
      success: true,
      message: '¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.',
    });
  } catch (error: any) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}
