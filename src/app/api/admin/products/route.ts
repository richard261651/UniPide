import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        business: {
          select: { id: true, nombre: true, logo: true, ubicacionCampus: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error al obtener productos en admin:', error);
    return NextResponse.json(
      { error: 'Error al consultar productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      nombre,
      descripcion,
      precio,
      foto,
      stock,
      categoria,
      disponible,
      esOferta,
      precioOferta,
      descripcionOferta,
    } = body;

    if (!businessId || !nombre || !precio) {
      return NextResponse.json(
        { error: 'Emprendimiento, nombre y precio son obligatorios' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        businessId,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: Number(precio),
        foto: foto || null,
        stock: stock !== undefined ? Number(stock) : 20,
        categoria: categoria ? categoria.trim() : null,
        disponible: disponible !== undefined ? Boolean(disponible) : true,
        esOferta: Boolean(esOferta),
        precioOferta: esOferta && precioOferta ? Number(precioOferta) : null,
        descripcionOferta: esOferta && descripcionOferta ? descripcionOferta.trim() : null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error al crear producto desde admin:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}
