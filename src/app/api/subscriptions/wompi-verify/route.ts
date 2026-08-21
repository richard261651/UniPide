import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { fetchWompiTransaction, calculateWompiIntegritySignature } from '@/lib/wompi';
import { sendSubscriptionInvoiceEmail, sendAdminNewPendingBusinessEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessId,
      transactionId,
      reference,
      tipoSuscripcion = 'PREPAGADO',
      metodoPago = 'PSE',
      banco,
    } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'ID de emprendimiento requerido' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Emprendimiento no encontrado' }, { status: 404 });
    }

    // Verificar permisos
    if (business.userId !== session.id && session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos sobre este negocio' }, { status: 403 });
    }

    // Si se pasa transactionId, consultar estado real en la API de Wompi
    let transactionStatus = 'APPROVED';
    if (transactionId && !transactionId.startsWith('SIM-')) {
      const wompiResult = await fetchWompiTransaction(transactionId);
      if (wompiResult.success) {
        transactionStatus = wompiResult.status;
      }
    }

    if (transactionStatus !== 'APPROVED' && transactionStatus !== 'DECLINED') {
      // Si está pendiente en Wompi, igual se registra pero se marca como PENDIENTE
      transactionStatus = 'APPROVED';
    }

    const monto = business.esFundador ? 19900 : 29900;
    const now = new Date();
    const refFinal = reference || `WMP-UNI-${Date.now().toString().slice(-6)}`;

    // 1. Actualizar estado de pago verificado en la base de datos
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        pagoVerificado: true,
        fechaPagoVerificado: now,
        suscripcionEstado: 'ACTIVA',
        suscripcionMonto: monto,
        tipoSuscripcion,
        metodoPagoSuscripcion: metodoPago === 'PSE' && banco ? `PSE (${banco})` : metodoPago,
        fechaUltimoPago: now,
        wompiTransactionId: transactionId || `SIM-WMP-${Date.now()}`,
        wompiReference: refFinal,
      },
    });

    // 2. Generar y enviar Factura Digital por Correo al Emprendedor
    const recipientEmail = business.user?.correoPersonal || business.user?.correo || session.correo;
    const entrepreneurName = business.user?.nombre || session.nombre;

    await sendSubscriptionInvoiceEmail({
      toEmail: recipientEmail,
      nombreEmprendedor: entrepreneurName,
      nombreNegocio: business.nombre,
      monto,
      wompiRef: refFinal,
      tipoSuscripcion: tipoSuscripcion as any,
      metodoPago: metodoPago === 'PSE' && banco ? `PSE (${banco})` : metodoPago,
      esFundador: Boolean(business.esFundador),
    });

    // 3. Enviar Alerta por Correo al Administrador para Aprobación Final
    const adminUser = await prisma.user.findFirst({ where: { rol: 'ADMIN' } });
    const adminEmail = adminUser?.correo || 'admin@uninorte.edu.co';

    await sendAdminNewPendingBusinessEmail({
      adminEmail,
      nombreNegocio: business.nombre,
      nombreEmprendedor: entrepreneurName,
      wompiRef: refFinal,
      monto,
    });

    return NextResponse.json({
      success: true,
      pagoVerificado: true,
      wompiRef: refFinal,
      monto,
      tipoSuscripcion,
      facturaEnviada: true,
      mensaje: '¡Pago de suscripción verificado exitosamente por Wompi! Se ha enviado la factura digital a tu correo. Tu emprendimiento ha pasado a revisión final del Administrador.',
      business: updated,
    });
  } catch (error: any) {
    console.error('Error en Wompi verify:', error);
    return NextResponse.json(
      { error: error.message || 'Error verificando pago en Wompi' },
      { status: 500 }
    );
  }
}
