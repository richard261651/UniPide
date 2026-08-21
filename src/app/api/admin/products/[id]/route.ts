import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        nombre: body.nombre ? body.nombre.trim() : existing.nombre,
        descripcion: body.descripcion !== undefined ? body.descripcion : existing.descripcion,
        precio: body.precio ? Number(body.precio) : existing.precio,
        foto: body.foto !== undefined ? body.foto : existing.foto,
        stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
        categoria: body.categoria !== undefined ? body.categoria : existing.categoria,
        disponible: body.disponible !== undefined ? Boolean(body.disponible) : existing.disponible,
        esOferta: body.esOferta !== undefined ? Boolean(body.esOferta) : existing.esOferta,
        precioOferta: body.esOferta && body.precioOferta ? Number(body.precioOferta) : null,
        descripcionOferta: body.esOferta && body.descripcionOferta ? body.descripcionOferta : null,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error al editar producto en admin:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente de la base de datos',
    });
  } catch (error: any) {
    console.error('Error al eliminar producto en admin:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
  }
}
