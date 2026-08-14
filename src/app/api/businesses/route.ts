import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('categoria');
    const search = searchParams.get('q');
    const includeAll = searchParams.get('all') === 'true'; // For admin

    const session = getSessionFromRequest(request);
    const isAdmin = session?.rol === 'ADMIN';

    const whereClause: any = {};

    if (!isAdmin || !includeAll) {
      whereClause.estadoAprobacion = 'APROBADO';
      whereClause.activo = true;
    }

    if (category && category !== 'Todos') {
      whereClause.categoria = category;
    }

    if (search) {
      whereClause.OR = [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
        { ubicacionCampus: { contains: search } },
      ];
    }

    const businesses = await prisma.business.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true, ratings: true, orders: true },
        },
        ratings: {
          select: { puntuacion: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    const formatted = businesses.map((b) => {
      const totalRatings = b.ratings.length;
      const sumRatings = b.ratings.reduce((acc, r) => acc + r.puntuacion, 0);
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 4.8;

      return {
        ...b,
        avgRating,
      };
    });

    return NextResponse.json({ businesses: formatted });
  } catch (error: any) {
    console.error('Error obteniendo negocios:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de emprendimientos' },
      { status: 500 }
    );
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
      nombre,
      categoria,
      descripcion,
      logo,
      banner,
      ubicacionCampus,
      zonaCampusCodigo = 'ZONA_EMPRENDIMIENTOS',
      tiempoBasePrepMin = 15,
    } = body;

    if (!nombre || !categoria || !ubicacionCampus) {
      return NextResponse.json(
        { error: 'Nombre, categoría y ubicación en campus son requeridos' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(nombre);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    const business = await prisma.business.create({
      data: {
        userId: session.id,
        nombre: nombre.trim(),
        slug: uniqueSlug,
        categoria,
        descripcion: descripcion?.trim() || `Emprendimiento de ${nombre}`,
        logo: logo || null,
        banner: banner || null,
        ubicacionCampus: ubicacionCampus.trim(),
        zonaCampusCodigo,
        tiempoBasePrepMin: Number(tiempoBasePrepMin) || 15,
        estadoAprobacion: 'PENDIENTE',
        activo: true,
      },
    });

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    console.error('Error creando negocio:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar el emprendimiento' },
      { status: 500 }
    );
  }
}
