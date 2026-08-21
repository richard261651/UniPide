import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    const whereClause: any = {};

    if (session.rol === 'ADMIN') {
      // Admin ve todas las PQRS
    } else if (session.rol === 'EMPRENDEDOR') {
      const userBiz = await prisma.business.findFirst({
        where: { userId: session.id },
      });
      if (userBiz) {
        whereClause.businessId = userBiz.id;
      } else {
        return NextResponse.json({ pqrs: [] });
      }
    } else {
      // Cliente ve sus propias PQRS
      whereClause.usuarioId = session.id;
    }

    if (estado && estado !== 'TODOS') {
      whereClause.estado = estado;
    }

    const pqrsList = await prisma.pQRS.findMany({
      where: whereClause,
      include: {
        usuario: { select: { id: true, nombre: true, correo: true, foto: true } },
        business: { select: { id: true, nombre: true, logo: true, slug: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return NextResponse.json({ pqrs: pqrsList });
  } catch (error: any) {
    console.error('Error obteniendo PQRS:', error);
    return NextResponse.json({ error: 'Error al obtener PQRS' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para radicar un PQRS' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, tipo, asunto, mensaje } = body;

    const validTypes = ['QUEJA', 'RECLAMO', 'PETICION', 'SUGERENCIA'];
    if (!tipo || !validTypes.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de PQRS no válido' }, { status: 400 });
    }

    if (!asunto || !asunto.trim() || !mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: 'El asunto y el mensaje son obligatorios' }, { status: 400 });
    }

    const newPqrs = await prisma.pQRS.create({
      data: {
        usuarioId: session.id,
        businessId: businessId || null,
        tipo,
        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
        estado: 'PENDIENTE',
      },
      include: {
        business: true,
      },
    });

    return NextResponse.json({ success: true, pqrs: newPqrs });
  } catch (error: any) {
    console.error('Error radicando PQRS:', error);
    return NextResponse.json({ error: error.message || 'Error al radicar PQRS' }, { status: 500 });
  }
}
