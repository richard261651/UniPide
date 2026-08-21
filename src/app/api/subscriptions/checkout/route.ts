import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para suscribirte' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, metodoPago = 'PSE', banco, celular } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'ID de emprendimiento requerido' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Emprendimiento no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario es dueño del negocio o admin
    if (business.userId !== session.id && session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos sobre este emprendimiento' }, { status: 403 });
    }

    const monto = business.esFundador ? 19900 : 29900;
    const now = new Date();

    // Actualizar datos de pago de suscripción
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        suscripcionEstado: 'ACTIVA',
        suscripcionMonto: monto,
        metodoPagoSuscripcion: metodoPago,
        fechaUltimoPago: now,
      },
    });

    // Código de referencia único para simulación/Wompi PSE
    const refTransaccion = `SUB-UNI-${Date.now().toString().slice(-6)}`;

    return NextResponse.json({
      success: true,
      mensaje: '¡Suscripción procesada exitosamente!',
      refTransaccion,
      monto,
      metodoPago,
      banco: banco || 'Bancolombia / PSE',
      business: updated,
    });
  } catch (error: any) {
    console.error('Error en checkout de suscripción:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la suscripción' },
      { status: 500 }
    );
  }
}
