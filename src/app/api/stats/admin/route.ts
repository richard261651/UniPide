import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores tienen acceso' }, { status: 403 });
    }

    const [
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      approvedBusinesses,
      totalOrders,
      orders,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.business.count({ where: { estadoAprobacion: 'PENDIENTE' } }),
      prisma.business.count({ where: { estadoAprobacion: 'APROBADO', activo: true } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { estado: 'ENTREGADO' },
        select: { total: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { fechaRegistro: 'desc' },
        select: { id: true, nombre: true, correo: true, rol: true, fechaRegistro: true },
      }),
    ]);

    const platformRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBusinesses,
        pendingBusinesses,
        approvedBusinesses,
        totalOrders,
        platformRevenue,
        recentUsers,
      },
    });
  } catch (error: any) {
    console.error('Error cargando métricas globales de admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas de administrador' },
      { status: 500 }
    );
  }
}
