import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateEstimatedDeliveryTime } from '@/lib/deliveryTime';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origen = searchParams.get('origen');
    const destino = searchParams.get('destino');
    const prepMin = Number(searchParams.get('prepMin')) || 15;

    // Si se pasan origen y destino, calcular el tiempo estimado
    if (origen && destino) {
      const estimate = await calculateEstimatedDeliveryTime(origen, destino, prepMin);
      return NextResponse.json({ estimate });
    }

    // De lo contrario, retornar todas las zonas del campus Uninorte
    const zones = await prisma.campusZone.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({ zones });
  } catch (error: any) {
    console.error('Error en /api/zones:', error);
    return NextResponse.json({ error: 'Error al consultar zonas del campus' }, { status: 500 });
  }
}
