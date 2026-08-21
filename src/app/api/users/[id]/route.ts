import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado: solo administradores' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { rol, activo, nombre, telefono } = body;

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // No permitir que un admin se desactive a sí mismo
    if (session.id === id && activo === false) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propia cuenta de administrador' },
        { status: 400 }
      );
    }

    const validRoles = ['CLIENTE', 'EMPRENDEDOR', 'ADMIN'];
    if (rol && !validRoles.includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(rol && { rol }),
        ...(activo !== undefined && { activo }),
        ...(nombre && { nombre }),
        ...(telefono !== undefined && { telefono }),
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        telefono: true,
        activo: true,
        fechaRegistro: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado: solo administradores' }, { status: 403 });
    }

    const { id } = params;

    // No permitir eliminarse a uno mismo
    if (session.id === id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de administrador' },
        { status: 400 }
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: { businesses: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 1. Eliminar ratings hechos por el usuario
    await prisma.rating.deleteMany({
      where: { clienteId: id },
    });

    // 2. Si el usuario tiene negocios, limpiar sus negocios, productos y pedidos asociados
    for (const biz of userToDelete.businesses) {
      await prisma.rating.deleteMany({
        where: { businessId: biz.id },
      });

      const bizOrders = await prisma.order.findMany({
        where: { businessId: biz.id },
        select: { id: true },
      });
      const bizOrderIds = bizOrders.map((o) => o.id);

      if (bizOrderIds.length > 0) {
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: bizOrderIds } },
        });
        await prisma.order.deleteMany({
          where: { id: { in: bizOrderIds } },
        });
      }

      await prisma.product.deleteMany({
        where: { businessId: biz.id },
      });

      await prisma.business.delete({
        where: { id: biz.id },
      });
    }

    // 3. Eliminar pedidos hechos por este usuario como cliente
    const clientOrders = await prisma.order.findMany({
      where: { clienteId: id },
      select: { id: true },
    });
    const clientOrderIds = clientOrders.map((o) => o.id);

    if (clientOrderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: clientOrderIds } },
      });
      await prisma.order.deleteMany({
        where: { id: { in: clientOrderIds } },
      });
    }

    // 4. Eliminar el usuario
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Cuenta de usuario eliminada correctamente' });
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar la cuenta de usuario' },
      { status: 500 }
    );
  }
}
