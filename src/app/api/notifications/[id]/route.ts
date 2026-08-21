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

    const updated = await prisma.notification.updateMany({
      where: { id, userId: session.id },
      data: { leido: true },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error: any) {
    console.error('Error actualizando notificación:', error);
    return NextResponse.json({ error: 'Error al marcar notificación como leída' }, { status: 500 });
  }
}
