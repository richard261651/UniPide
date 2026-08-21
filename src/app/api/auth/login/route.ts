import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signJwtToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu correo y contraseña' },
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
      include: {
        businesses: {
          select: { id: true, nombre: true, slug: true, estadoAprobacion: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido desactivada. Comunícate con el administrador de Uninorte.' },
        { status: 403 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    const primaryBusiness = user.businesses && user.businesses.length > 0 ? user.businesses[0] : null;

    const userSession = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol as any,
      telefono: user.telefono,
      foto: user.foto,
      businessId: primaryBusiness?.id || null,
      businessSlug: primaryBusiness?.slug || null,
      businessName: primaryBusiness?.nombre || null,
    };

    const token = signJwtToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
    });

    // Guardar cookie HttpOnly
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al iniciar sesión' },
      { status: 500 }
    );
  }
}
