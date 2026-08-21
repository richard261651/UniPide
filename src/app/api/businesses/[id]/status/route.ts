import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { sendBusinessApprovedEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

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

    const currentBusiness = await prisma.business.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentBusiness) {
      return NextResponse.json({ error: 'Emprendimiento no encontrado' }, { status: 404 });
    }

    const updateData: any = {};

    if (activo !== undefined) {
      updateData.activo = activo;
    }

    if (estadoAprobacion) {
      updateData.estadoAprobacion = estadoAprobacion;

      // Si se está aprobando por primera vez (o pasa a APROBADO desde PENDIENTE)
      if (estadoAprobacion === 'APROBADO') {
        const now = new Date();
        updateData.fechaAprobacion = now;
        updateData.pagoVerificado = true;
        updateData.fechaPagoVerificado = now;
        updateData.activo = true;
        updateData.suscripcionEstado = 'ACTIVA';

        // Verificar cupos de lanzamiento (máximo 10)
        const founderCount = await prisma.business.count({
          where: {
            esFundador: true,
            estadoAprobacion: { in: ['APROBADO', 'PENDIENTE'] },
            id: { not: id },
          },
        });

        if (founderCount < 10) {
          const threeMonthsLater = new Date(now);
          threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

          updateData.esFundador = true;
          updateData.fechaInicioPromocion = now;
          updateData.fechaFinPromocion = threeMonthsLater;
          updateData.suscripcionMonto = 19900;
        } else {
          updateData.esFundador = false;
          updateData.suscripcionMonto = 29900;
        }
      }
    }

    const updated = await prisma.business.update({
      where: { id },
      data: updateData,
    });

    // Si fue APROBADO por el Administrador, enviar correo de confirmación de pago y crear notificación in-app
    if (estadoAprobacion === 'APROBADO' && currentBusiness.estadoAprobacion !== 'APROBADO') {
      await sendBusinessApprovedEmail({
        toEmail: currentBusiness.user.correoPersonal || currentBusiness.user.correo,
        nombreEmprendedor: currentBusiness.user.nombre,
        nombreNegocio: currentBusiness.nombre,
      });

      await createNotification({
        userId: currentBusiness.userId,
        titulo: '✅ ¡Pago Confirmado y Negocio Abierto!',
        mensaje: `Tu emprendimiento "${currentBusiness.nombre}" ha sido verificado y aprobado. Ya se encuentra abierto y activo en UniPide.`,
        tipo: 'APROBACION_NEGOCIO',
        url: '/emprendedor/suscripcion',
      });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error actualizando estado de negocio' }, { status: 500 });
  }
}
