import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { respuesta, estado } = body;

    const pqrs = await prisma.pQRS.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!pqrs) {
      return NextResponse.json({ error: 'PQRS no encontrado' }, { status: 404 });
    }

    const isAdmin = session.rol === 'ADMIN';
    const isBusinessOwner = pqrs.business?.userId === session.id;

    if (!isAdmin && !isBusinessOwner) {
      return NextResponse.json({ error: 'No tienes permiso para responder este PQRS' }, { status: 403 });
    }

    const updateData: any = {};
    if (respuesta !== undefined) {
      updateData.respuesta = respuesta.trim();
      updateData.fechaRespuesta = new Date();
      updateData.estado = 'RESUELTO';
    }
    if (estado) {
      updateData.estado = estado;
    }

    const updated = await prisma.pQRS.update({
      where: { id },
      data: updateData,
      include: {
        usuario: { select: { id: true, nombre: true, correo: true } },
        business: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ success: true, pqrs: updated });
  } catch (error: any) {
    console.error('Error respondiendo PQRS:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar PQRS' }, { status: 500 });
  }
}
