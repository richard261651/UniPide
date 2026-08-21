import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';
import { calculateEstimatedDeliveryTime } from '@/lib/deliveryTime';
import { createNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const estado = searchParams.get('estado');

    const whereClause: any = {};

    if (session.rol === 'EMPRENDEDOR' || businessId) {
      if (businessId) {
        whereClause.businessId = businessId;
      } else {
        const userBiz = await prisma.business.findFirst({
          where: { userId: session.id },
        });
        if (userBiz) {
          whereClause.businessId = userBiz.id;
        } else {
          return NextResponse.json({ orders: [] });
        }
      }
    } else if (session.rol === 'ADMIN' && searchParams.get('all') === 'true') {
      // Admin ve todos
    } else {
      // Cliente ve sus pedidos
      whereClause.clienteId = session.id;
    }

    if (estado && estado !== 'TODOS') {
      whereClause.estado = estado;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        cliente: { select: { id: true, nombre: true, correo: true, telefono: true, foto: true } },
        business: { select: { id: true, nombre: true, slug: true, logo: true, ubicacionCampus: true, zonaCampusCodigo: true } },
        items: {
          include: {
            product: { select: { id: true, nombre: true, foto: true } },
          },
        },
        rating: true,
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error buscando pedidos:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para realizar un pedido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessId,
      items,
      zonaEntregaCodigo,
      zonaEntregaNombre,
      detalleUbicacion,
      instrucciones,
      metodoPago = 'Efectivo / Nequi / Daviplata al entregar',
    } = body;

    if (!businessId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido no contiene productos o falta el negocio' },
        { status: 400 }
      );
    }

    if (!zonaEntregaCodigo) {
      return NextResponse.json(
        { error: 'Por favor selecciona la zona de entrega dentro del campus' },
        { status: 400 }
      );
    }

    // Obtener información del negocio
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || !business.activo || business.estadoAprobacion !== 'APROBADO') {
      return NextResponse.json(
        { error: 'Este emprendimiento no está disponible para recibir pedidos actualmente' },
        { status: 400 }
      );
    }

    // Validar productos y calcular subtotal
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.disponible) {
        return NextResponse.json(
          { error: `El producto "${product?.nombre || 'desconocido'}" no está disponible` },
          { status: 400 }
        );
      }

      const precioUnitario =
        product.esOferta && product.precioOferta ? product.precioOferta : product.precio;

      const cantidad = Math.max(1, Number(item.cantidad) || 1);
      subtotal += precioUnitario * cantidad;

      orderItemsData.push({
        productId: product.id,
        nombreProducto: product.nombre,
        cantidad,
        precioUnitario,
        opcionesSeleccionadas: item.opcionesSeleccionadas || null,
        notas: item.notas?.trim() || null,
      });
    }

    const total = subtotal; // Sin costos ocultos de envío inicial

    // Calcular tiempo estimado de entrega en campus
    const estimate = await calculateEstimatedDeliveryTime(
      business.zonaCampusCodigo,
      zonaEntregaCodigo,
      business.tiempoBasePrepMin
    );

    // Generar código único de pedido
    let codigoPedido = generateOrderCode();
    while (await prisma.order.findUnique({ where: { codigoPedido } })) {
      codigoPedido = generateOrderCode();
    }

    const newOrder = await prisma.order.create({
      data: {
        codigoPedido,
        clienteId: session.id,
        businessId: business.id,
        estado: 'RECIBIDO',
        subtotal,
        total,
        zonaEntregaCodigo,
        zonaEntregaNombre: zonaEntregaNombre || estimate.destinoNombre,
        detalleUbicacion: detalleUbicacion?.trim() || null,
        tiempoEstimadoMin: estimate.tiempoTotalMin,
        instrucciones: instrucciones?.trim() || null,
        metodoPago,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        business: true,
      },
    });

    // Notificación In-App para el Emprendedor Responsable
    await createNotification({
      userId: business.userId,
      titulo: `🛒 ¡Nuevo Pedido #${newOrder.codigoPedido}!`,
      mensaje: `Has recibido un nuevo pedido de ${session.nombre} por $${total.toLocaleString('es-CO')} en ${zonaEntregaNombre || estimate.destinoNombre}.`,
      tipo: 'NUEVO_PEDIDO',
      url: '/emprendedor/pedidos',
    });

    // Notificación In-App para el Cliente
    await createNotification({
      userId: session.id,
      titulo: `📦 Pedido #${newOrder.codigoPedido} Registrado`,
      mensaje: `Tu pedido en "${business.nombre}" ha sido recibido. Tiempo estimado de entrega: ${estimate.tiempoTotalMin} min.`,
      tipo: 'ESTADO_PEDIDO',
      url: `/pedidos/${newOrder.id}`,
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      estimate,
    });
  } catch (error: any) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pedido' },
      { status: 500 }
    );
  }
}
