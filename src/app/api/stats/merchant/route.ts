import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || (session.rol !== 'EMPRENDEDOR' && session.rol !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let businessId = searchParams.get('businessId') || session.businessId;

    if (!businessId) {
      const biz = await prisma.business.findFirst({
        where: { userId: session.id },
      });
      if (!biz) {
        return NextResponse.json({
          stats: {
            totalRevenue: 0,
            todayRevenue: 0,
            activeOrdersCount: 0,
            totalOrdersCount: 0,
            avgRating: 4.8,
            topProducts: [],
          },
        });
      }
      businessId = biz.id;
    }

    // 1. Todos los pedidos del negocio
    const allOrders = await prisma.order.findMany({
      where: { businessId },
      include: { items: true },
    });

    const totalOrdersCount = allOrders.length;
    const deliveredOrders = allOrders.filter((o) => o.estado === 'ENTREGADO');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

    // 2. Pedidos de Hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter((o) => new Date(o.fechaCreacion) >= today);
    const todayRevenue = todayOrders
      .filter((o) => o.estado === 'ENTREGADO')
      .reduce((sum, o) => sum + o.total, 0);

    // 3. Pedidos Activos
    const activeOrdersCount = allOrders.filter(
      (o) => o.estado === 'RECIBIDO' || o.estado === 'EN_PREPARACION' || o.estado === 'EN_CAMINO'
    ).length;

    // 4. Promedio de calificaciones
    const ratings = await prisma.rating.findMany({
      where: { businessId },
      select: { puntuacion: true },
    });
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.puntuacion, 0) / ratings.length
        : 4.8;

    // 5. Productos más vendidos
    const productSalesMap: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const key = item.productId || item.nombreProducto;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            nombre: item.nombreProducto,
            cantidad: 0,
            total: 0,
          };
        }
        productSalesMap[key].cantidad += item.cantidad;
        productSalesMap[key].total += item.cantidad * item.precioUnitario;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalRevenue,
        todayRevenue,
        todayOrdersCount: todayOrders.length,
        activeOrdersCount,
        totalOrdersCount,
        avgRating,
        ratingsCount: ratings.length,
        topProducts,
      },
    });
  } catch (error: any) {
    console.error('Error calculando estadísticas de emprendedor:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del negocio' },
      { status: 500 }
    );
  }
}
