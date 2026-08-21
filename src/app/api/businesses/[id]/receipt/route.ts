import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const fechaPago = business.fechaPagoVerificado
      ? new Date(business.fechaPagoVerificado)
      : business.fechaUltimoPago
      ? new Date(business.fechaUltimoPago)
      : new Date();

    const fechaStr = fechaPago.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const monto = business.suscripcionMonto || (business.esFundador ? 19900 : 29900);
    const estadoTexto = business.pagoVerificado ? 'PAGADO Y VERIFICADO POR ADMIN' : 'PENDIENTE DE VERIFICACIÓN';
    const estadoColor = business.pagoVerificado ? '#15803D' : '#B45309';

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Constancia de Pago UniPide - ${business.nombre}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; max-width: 700px; margin: 30px auto; padding: 30px; border: 2px solid #e2e8f0; border-radius: 24px; background: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-size: 30px; font-weight: 900; color: #0f172a; }
    .logo span { color: #D85A30; }
    .sub { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: bold; text-transform: uppercase; tracking: 1px; }
    .receipt-card { background-color: #FAF8F5; border: 1px solid #FBC6BB; border-radius: 18px; padding: 20px; margin-bottom: 25px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #475569; font-weight: 600; }
    .val { color: #0f172a; font-weight: 800; }
    .amount-box { background: #1e293b; color: #ffffff; border-radius: 16px; padding: 20px; text-align: center; margin: 25px 0; }
    .amount-title { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .amount { font-size: 34px; font-weight: 900; color: #F56649; margin-top: 4px; }
    .status-badge { display: inline-block; background-color: ${business.pagoVerificado ? '#F0FDF4' : '#FEF3C7'}; color: ${estadoColor}; border: 1.5px solid ${business.pagoVerificado ? '#86EFAC' : '#FDE68A'}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 900; margin-top: 10px; }
    .btn-print { display: block; width: 100%; text-align: center; padding: 14px; background: #D85A30; color: white; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; margin-top: 30px; cursor: pointer; border: none; }
    @media print { .btn-print { display: none; } body { border: none; margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Uni<span>Pide</span></div>
    <div class="sub">Universidad del Norte — Constancia Oficial de Pago & Afiliación</div>
    <div class="status-badge">${estadoTexto}</div>
  </div>

  <div class="receipt-card">
    <div class="row">
      <span class="label">Emprendimiento Afiliado:</span>
      <span class="val">${business.nombre}</span>
    </div>
    <div class="row">
      <span class="label">Estudiante Responsable:</span>
      <span class="val">${business.user?.nombre || business.nombreFirmante || 'Estudiante Uninorte'}</span>
    </div>
    <div class="row">
      <span class="label">Correo Registrado:</span>
      <span class="val">${business.user?.correo || 'N/A'}</span>
    </div>
    <div class="row">
      <span class="label">Fecha de Verificación:</span>
      <span class="val">${fechaStr}</span>
    </div>
    <div class="row">
      <span class="label">Plan de Suscripción:</span>
      <span class="val">${business.esFundador ? 'Plan Fundador UniPide (33% OFF)' : 'Plan Estándar UniPide'}</span>
    </div>
    <div class="row">
      <span class="label">Contrato Digital Asociado:</span>
      <span class="val">POL-EMP-001 v1.0</span>
    </div>
  </div>

  <div class="amount-box">
    <div class="amount-title">Monto Total Abonado</div>
    <div class="amount">$${monto.toLocaleString('es-CO')} COP</div>
  </div>

  <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
    Este documento sirve como comprobante y constancia oficial de pago de suscripción en la plataforma UniPide de la Universidad del Norte.<br />
    Emisión: Administración UniPide (Richard Francisco Guzmán Guzmán)
  </p>

  <button onclick="window.print()" class="btn-print">Imprimir / Guardar Constancia como PDF</button>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error generando constancia de pago:', error);
    return NextResponse.json({ error: 'Error al generar constancia de pago' }, { status: 500 });
  }
}
