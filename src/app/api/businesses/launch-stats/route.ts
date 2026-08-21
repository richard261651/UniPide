import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const TOTAL_CUPOS = 10;
    const cuposOcupados = await prisma.business.count({
      where: {
        esFundador: true,
        estadoAprobacion: { in: ['APROBADO', 'PENDIENTE'] },
      },
    });

    const cuposDisponibles = Math.max(0, TOTAL_CUPOS - cuposOcupados);
    const promocionActiva = cuposOcupados < TOTAL_CUPOS;

    return NextResponse.json({
      totalCupos: TOTAL_CUPOS,
      cuposOcupados,
      cuposDisponibles,
      promocionActiva,
    });
  } catch (error: any) {
    console.error('Error obteniendo stats de lanzamiento:', error);
    return NextResponse.json(
      { error: 'Error al consultar disponibilidad de cupos de lanzamiento' },
      { status: 500 }
    );
  }
}
