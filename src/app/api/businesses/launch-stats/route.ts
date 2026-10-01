import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalCupos: 100,
    cuposOcupados: 0,
    cuposDisponibles: 100,
    promocionActiva: false,
    gratuito: true,
  });
}
