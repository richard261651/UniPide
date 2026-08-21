import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado: solo administradores' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const q = searchParams.get('q');

    const where: any = {};

    if (rol && rol !== 'TODOS') {
      where.rol = rol;
    }

    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { correo: { contains: q, mode: 'insensitive' } },
        { telefono: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        telefono: true,
        foto: true,
        activo: true,
        fechaRegistro: true,
        businesses: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            categoria: true,
            estadoAprobacion: true,
            activo: true,
          },
        },
        _count: {
          select: {
            orders: true,
            ratings: true,
          },
        },
      },
      orderBy: { fechaRegistro: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error listando usuarios:', error);
    return NextResponse.json({ error: 'Error al consultar usuarios' }, { status: 500 });
  }
}
