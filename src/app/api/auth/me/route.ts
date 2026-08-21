import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Consultar estado fresco del usuario en DB
    const freshUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        businesses: {
          select: { id: true, nombre: true, slug: true, estadoAprobacion: true, pagoVerificado: true, activo: true },
        },
      },
    });

    if (!freshUser || !freshUser.activo) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const primaryBusiness =
      freshUser.businesses && freshUser.businesses.length > 0
        ? freshUser.businesses[0]
        : null;

    const userSession = {
      id: freshUser.id,
      nombre: freshUser.nombre,
      correo: freshUser.correo,
      correoPersonal: freshUser.correoPersonal,
      rol: freshUser.rol as any,
      telefono: freshUser.telefono,
      foto: freshUser.foto,
      businessId: primaryBusiness?.id || null,
      businessSlug: primaryBusiness?.slug || null,
      businessName: primaryBusiness?.nombre || null,
      businessEstadoAprobacion: primaryBusiness?.estadoAprobacion || null,
      businessPagoVerificado: primaryBusiness?.pagoVerificado || false,
      businessActivo: primaryBusiness?.activo || false,
    };

    return NextResponse.json({ user: userSession }, { status: 200 });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
