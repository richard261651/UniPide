import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmailVerificationCode } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, code, action = 'verify' } = body;

    if (!correo) {
      return NextResponse.json({ error: 'El correo electrónico es obligatorio' }, { status: 400 });
    }

    const cleanEmail = correo.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { correo: cleanEmail },
          { correoPersonal: cleanEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Reenviar un nuevo código de verificación
    if (action === 'resend') {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tokenVerificacionCorreo: newCode,
          correoVerificado: false,
        },
      });

      const targetEmail = user.correoPersonal || user.correo;
      await sendEmailVerificationCode({
        toEmail: targetEmail,
        nombre: user.nombre,
        code: newCode,
        correoInstitucional: user.correo,
      });

      return NextResponse.json({
        success: true,
        mensaje: `Se ha reenviado un nuevo código de verificación a tu correo personal (${targetEmail}).`,
      });
    }

    // Verificar el código ingresado por el usuario
    if (!code || code.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Por favor ingresa el código de 6 dígitos enviado a tu correo' },
        { status: 400 }
      );
    }

    if (user.correoVerificado) {
      return NextResponse.json({
        success: true,
        mensaje: 'Tu cuenta ya se encuentra verificada.',
        correoVerificado: true,
      });
    }

    if (user.tokenVerificacionCorreo !== code.trim()) {
      return NextResponse.json(
        { error: 'El código de verificación ingresado es incorrecto. Revisa tu bandeja de entrada o spam.' },
        { status: 400 }
      );
    }

    // Actualizar usuario a verificado
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        correoVerificado: true,
        tokenVerificacionCorreo: null,
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: '¡Excelente! Tu cuenta ha sido verificada con éxito.',
      correoVerificado: true,
      user: {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        correo: updatedUser.correo,
        correoPersonal: updatedUser.correoPersonal,
        correoVerificado: true,
      },
    });
  } catch (error: any) {
    console.error('Error en verificación de correo:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la verificación de correo' },
      { status: 500 }
    );
  }
}
