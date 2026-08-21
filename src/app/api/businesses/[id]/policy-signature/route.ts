import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { generateDigitalContractDocument } from '@/lib/contractGenerator';
import { uploadContractToGoogleDrive } from '@/lib/googleDrive';

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
    const { nombreFirmante, documentoFirmante, firmaVirtualBase64 } = body;

    if (!nombreFirmante || !documentoFirmante) {
      return NextResponse.json(
        { error: 'El nombre completo y documento del firmante son obligatorios' },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id },
      include: { user: true },
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

    const now = new Date();

    // 1. Generar Documento Legal de Contrato POL-EMP-001 con la firma manuscrita
    const contractDoc = await generateDigitalContractDocument({
      nombreNegocio: business.nombre,
      nombreFirmante: nombreFirmante.trim(),
      documentoFirmante: documentoFirmante.trim(),
      correo: business.user?.correo || session.correo,
      fechaFirma: now,
      firmaVirtualBase64: firmaVirtualBase64 || null,
    });

    // 2. Subir / Sincronizar archivo en Google Drive (richardbb839@gmail.com)
    const driveResult = await uploadContractToGoogleDrive({
      filePath: contractDoc.filePath,
      fileName: contractDoc.fileName,
      nombreNegocio: business.nombre,
      documentoFirmante: documentoFirmante.trim(),
    });

    // 3. Actualizar la base de datos con los datos de firma y la imagen de firma manuscrita
    const updated = await prisma.business.update({
      where: { id },
      data: {
        firmaPoliticaHigiene: true,
        fechaFirmaPolitica: now,
        versionPolitica: 'POL-EMP-001 v1.0',
        nombreFirmante: nombreFirmante.trim(),
        documentoFirmante: documentoFirmante.trim(),
        firmaVirtualBase64: firmaVirtualBase64 || null,
        contratoDriveUrl: driveResult.driveUrl,
        contratoDriveId: driveResult.fileId,
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Firma digital registrada exitosamente y contrato guardado en Google Drive en la carpeta "contratos emprendimientos unipide".',
      contratoDriveUrl: driveResult.driveUrl,
      business: updated,
    });
  } catch (error: any) {
    console.error('Error registrando firma digital de política:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar firma digital y sincronizar con Google Drive' },
      { status: 500 }
    );
  }
}
