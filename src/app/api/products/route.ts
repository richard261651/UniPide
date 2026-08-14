import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const esOferta = searchParams.get('ofertas') === 'true';
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('q');

    const whereClause: any = {};

    if (businessId) {
      whereClause.businessId = businessId;
    } else {
      // Solo productos de negocios aprobados y activos
      whereClause.business = {
        estadoAprobacion: 'APROBADO',
        activo: true,
      };
    }

    if (esOferta) {
      whereClause.esOferta = true;
    }

    if (categoria && categoria !== 'Todos') {
      whereClause.categoria = categoria;
    }

    if (search) {
      whereClause.OR = [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            ubicacionCampus: true,
            zonaCampusCodigo: true,
            tiempoBasePrepMin: true,
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error buscando productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessId,
      nombre,
      descripcion,
      precio,
      foto,
      stock = 20,
      disponible = true,
      categoria,
      esOferta = false,
      precioOferta,
      descripcionOferta,
    } = body;

    if (!nombre || !precio) {
      return NextResponse.json(
        { error: 'Nombre y precio del producto son obligatorios' },
        { status: 400 }
      );
    }

    // Identificar el negocio del usuario
    let targetBizId = businessId;
    if (!targetBizId) {
      const userBiz = await prisma.business.findFirst({
        where: { userId: session.id },
      });
      if (!userBiz) {
        return NextResponse.json(
          { error: 'No tienes ningún emprendimiento registrado' },
          { status: 400 }
        );
      }
      targetBizId = userBiz.id;
    }

    const product = await prisma.product.create({
      data: {
        businessId: targetBizId,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        precio: Number(precio),
        foto: foto || null,
        stock: Number(stock),
        disponible: Boolean(disponible),
        categoria: categoria?.trim() || null,
        esOferta: Boolean(esOferta),
        precioOferta: precioOferta ? Number(precioOferta) : null,
        descripcionOferta: descripcionOferta?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: error.message || 'Error al crear producto' }, { status: 500 });
  }
}
