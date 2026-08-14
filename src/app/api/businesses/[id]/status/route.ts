import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden realizar esta acción' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { estadoAprobacion, activo } = body;

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(estadoAprobacion && { estadoAprobacion }),
        ...(activo !== undefined && { activo }),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error actualizando estado de negocio' }, { status: 500 });
  }
}
