import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        cliente: { select: { id: true, nombre: true, correo: true } },
        business: { select: { id: true, nombre: true, logo: true } },
        order: { select: { id: true, codigoPedido: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return NextResponse.json({ ratings });
  } catch (error: any) {
    console.error('Error obteniendo reseñas en admin:', error);
    return NextResponse.json(
      { error: 'Error al consultar las reseñas' },
      { status: 500 }
    );
  }
}
