import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDigitalContractDocument } from '@/lib/contractGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Emprendimiento no encontrado' }, { status: 404 });
    }

    const fechaFirma = business.fechaFirmaPolitica
      ? new Date(business.fechaFirmaPolitica)
      : new Date(business.fechaCreacion);

    const contractDoc = await generateDigitalContractDocument({
      nombreNegocio: business.nombre,
      nombreFirmante: business.nombreFirmante || business.user?.nombre || 'Estudiante Responsable',
      documentoFirmante: business.documentoFirmante || business.user?.telefono || 'ID Estudiantil Uninorte',
      correo: business.user?.correo || 'correo@uninorte.edu.co',
      fechaFirma,
      versionPolitica: business.versionPolitica || 'POL-EMP-001 v1.0',
      firmaVirtualBase64: business.firmaVirtualBase64,
    });

    const isDownload = request.nextUrl.searchParams.get('download') === 'true';
    const safeName = business.nombre.replace(/[^a-zA-Z0-9]/g, '_');

    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
    };

    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="POL-EMP-001_${safeName}.html"`;
    }

    // Retornar el documento HTML para visualización o descarga en equipo local
    return new NextResponse(contractDoc.htmlDocument, { headers });
  } catch (error: any) {
    console.error('Error generando vista de contrato:', error);
    return NextResponse.json({ error: 'Error al generar vista de contrato' }, { status: 500 });
  }
}
