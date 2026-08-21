import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        user: {
          select: { nombre: true, correo: true, telefono: true },
        },
        products: {
          orderBy: { fechaCreacion: 'desc' },
        },
        ratings: {
          include: {
            cliente: { select: { nombre: true, foto: true } },
          },
          orderBy: { fechaCreacion: 'desc' },
          take: 10,
        },
        _count: {
          select: { products: true, ratings: true, orders: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Emprendimiento no encontrado' },
        { status: 404 }
      );
    }

    const totalRatings = business.ratings.length;
    const sumRatings = business.ratings.reduce((acc, r) => acc + r.puntuacion, 0);
    const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 4.8;

    return NextResponse.json({
      business: {
        ...business,
        avgRating,
      },
    });
  } catch (error: any) {
    console.error('Error buscando negocio por slug:', error);
    return NextResponse.json(
      { error: 'Error al cargar los datos del emprendimiento' },
      { status: 500 }
    );
  }
}
