import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { sendBusinessApprovedEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { generateDigitalContractDocument } from '@/lib/contractGenerator';

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
        updateData.activo = true;
      }
    }

    const updated = await prisma.business.update({
      where: { id },
      data: updateData,
    });

    // Si fue APROBADO por el Administrador, enviar correo de confirmación y contrato con adjuntos
    if (estadoAprobacion === 'APROBADO' && currentBusiness.estadoAprobacion !== 'APROBADO') {
      const now = new Date();
      const contractDoc = await generateDigitalContractDocument({
        nombreNegocio: currentBusiness.nombre,
        nombreFirmante: currentBusiness.nombreFirmante || currentBusiness.user?.nombre || 'Estudiante Responsable',
        documentoFirmante: currentBusiness.documentoFirmante || 'Cédula Estudiantil',
        correo: currentBusiness.user?.correo || session.correo,
        fechaFirma: currentBusiness.fechaFirmaPolitica ? new Date(currentBusiness.fechaFirmaPolitica) : now,
        versionPolitica: currentBusiness.versionPolitica || 'POL-EMP-001 v1.0',
        firmaVirtualBase64: currentBusiness.firmaVirtualBase64 || null,
      });

      await sendBusinessApprovedEmail({
        toEmail: currentBusiness.user.correo,
        nombreEmprendedor: currentBusiness.user.nombre,
        nombreNegocio: currentBusiness.nombre,
        businessId: currentBusiness.id,
        contractHtmlContent: contractDoc.htmlDocument,
        contractFileName: contractDoc.fileName,
      }).catch((err) => console.error('⚠️ [Aviso] Error enviando correo de aprobación:', err));

      await createNotification({
        userId: currentBusiness.userId,
        titulo: '✅ ¡Emprendimiento Aprobado y Tienda Abierta!',
        mensaje: `Tu emprendimiento "${currentBusiness.nombre}" ha sido revisado y aprobado. Ya se encuentra abierto y activo en UniPide.`,
        tipo: 'APROBACION_NEGOCIO',
        url: '/emprendedor',
      });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error actualizando estado de negocio' }, { status: 500 });
  }
}
