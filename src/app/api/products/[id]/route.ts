import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(
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
    const {
      nombre,
      descripcion,
      precio,
      foto,
      fotos,
      stock,
      disponible,
      categoria,
      esOferta,
      precioOferta,
      descripcionOferta,
      tieneTallas,
      tallasDisponibles,
      tieneColores,
      coloresDisponibles,
      tieneVariaciones,
      nombreVariaciones,
      opcionesVariaciones,
    } = body;

    const updateData: any = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(descripcion !== undefined && { descripcion: descripcion.trim() }),
      ...(precio !== undefined && { precio: Number(precio) }),
      ...(foto !== undefined && { foto }),
      ...(fotos !== undefined && { fotos: Array.isArray(fotos) ? fotos : [] }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(disponible !== undefined && { disponible: Boolean(disponible) }),
      ...(categoria !== undefined && { categoria: categoria?.trim() || null }),
      ...(esOferta !== undefined && { esOferta: Boolean(esOferta) }),
      ...(precioOferta !== undefined && { precioOferta: precioOferta ? Number(precioOferta) : null }),
      ...(descripcionOferta !== undefined && { descripcionOferta: descripcionOferta?.trim() || null }),
      ...(tieneTallas !== undefined && { tieneTallas: Boolean(tieneTallas) }),
      ...(tallasDisponibles !== undefined && { tallasDisponibles: Array.isArray(tallasDisponibles) ? tallasDisponibles : [] }),
      ...(tieneColores !== undefined && { tieneColores: Boolean(tieneColores) }),
      ...(coloresDisponibles !== undefined && { coloresDisponibles: Array.isArray(coloresDisponibles) ? coloresDisponibles : [] }),
      ...(tieneVariaciones !== undefined && { tieneVariaciones: Boolean(tieneVariaciones) }),
      ...(nombreVariaciones !== undefined && { nombreVariaciones: nombreVariaciones?.trim() || null }),
      ...(opcionesVariaciones !== undefined && { opcionesVariaciones: Array.isArray(opcionesVariaciones) ? opcionesVariaciones : [] }),
    };

    // Si se enviaron fotos en el array pero no foto principal, asignar la primera
    if (fotos && Array.isArray(fotos) && fotos.length > 0 && !updateData.foto) {
      updateData.foto = fotos[0];
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { disponible, stock } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(disponible !== undefined && { disponible: Boolean(disponible) }),
        ...(stock !== undefined && { stock: Number(stock) }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al cambiar estado de disponibilidad' }, { status: 500 });
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

    const { id } = params;

    // 1. Desvincular de OrderItem para preservar el historial de estadísticas (nombreProducto, precioUnitario, cantidad permanecen intactos)
    try {
      await prisma.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null },
      });
    } catch (unlinkErr) {
      console.warn('Advertencia al desvincular orderItems:', unlinkErr);
    }

    // 2. Borrar permanentemente el producto de la tabla Product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Producto eliminado definitivamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
}
