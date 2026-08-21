import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSubscriptionExpiringEmail } from '@/lib/email';
import { formatShortDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Buscar emprendimientos cuya fechaFinPromocion o vencimiento sea en los próximos 7 días
    const expiringBusinesses = await prisma.business.findMany({
      where: {
        estadoAprobacion: 'APROBADO',
        activo: true,
        fechaFinPromocion: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: true,
      },
    });

    let notifiedCount = 0;

    for (const biz of expiringBusinesses) {
      // Evitar spam: solo notificar si no se ha notificado en los últimos 4 días
      const lastNotified = biz.fechaNotificacionExpiracion;
      if (lastNotified) {
        const diffDays = (now.getTime() - new Date(lastNotified).getTime()) / (1000 * 3600 * 24);
        if (diffDays < 4) continue;
      }

      const endDate = new Date(biz.fechaFinPromocion!);
      const diffMs = endDate.getTime() - now.getTime();
      const diasRestantes = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));

      await sendSubscriptionExpiringEmail({
        toEmail: biz.user.correoPersonal || biz.user.correo,
        nombreEmprendedor: biz.user.nombre,
        nombreNegocio: biz.nombre,
        diasRestantes,
        fechaFin: formatShortDate(endDate),
        montoRenovacion: biz.esFundador ? 19900 : 29900,
      });

      await prisma.business.update({
        where: { id: biz.id },
        data: {
          fechaNotificacionExpiracion: now,
        },
      });

      notifiedCount++;
    }

    return NextResponse.json({
      success: true,
      notifiedCount,
      mensaje: `Se verificaron suscripciones y se enviaron ${notifiedCount} alertas de expiración por correo.`,
    });
  } catch (error: any) {
    console.error('Error en cron de expiración de suscripciones:', error);
    return NextResponse.json(
      { error: error.message || 'Error notificando expiración de suscripciones' },
      { status: 500 }
    );
  }
}
