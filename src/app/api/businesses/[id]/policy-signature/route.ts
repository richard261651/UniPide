import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(
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
    const { nombreFirmante, documentoFirmante } = body;

    if (!nombreFirmante || !documentoFirmante) {
      return NextResponse.json(
        { error: 'El nombre completo y documento del firmante son obligatorios' },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Emprendimiento no encontrado' }, { status: 404 });
    }

    if (business.userId !== session.id && session.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes autorización sobre este emprendimiento' },
        { status: 403 }
      );
    }

    const updated = await prisma.business.update({
      where: { id },
      data: {
        firmaPoliticaHigiene: true,
        fechaFirmaPolitica: new Date(),
        versionPolitica: 'POL-EMP-001 v1.0',
        nombreFirmante: nombreFirmante.trim(),
        documentoFirmante: documentoFirmante.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Firma digital de Política POL-EMP-001 registrada con éxito',
      business: updated,
    });
  } catch (error: any) {
    console.error('Error registrando firma digital de política:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar firma digital' },
      { status: 500 }
    );
  }
}
