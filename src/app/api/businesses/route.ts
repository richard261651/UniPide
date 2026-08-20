import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/utils';

// Función para poblar datos iniciales si la base de datos está vacía
async function ensureInitialData() {
  try {
    const count = await prisma.business.count();
    if (count === 0) {
      // 1. Zonas del Campus
      const zonesCount = await prisma.campusZone.count();
      if (zonesCount === 0) {
        const zonesData = [
          { codigo: 'ZONA_EMPRENDIMIENTOS', nombre: 'Zona de Emprendimientos (Pasillo Ágora Central)', descripcion: 'Corredor comercial estudiantil', coordenadaRefX: 50, coordenadaRefY: 50 },
          { codigo: 'BLOQUE_A', nombre: 'Bloque A (Ingenierías & Laboratorios)', descripcion: 'Edificio principal de Ingenierías', coordenadaRefX: 30, coordenadaRefY: 40 },
          { codigo: 'BLOQUE_B', nombre: 'Bloque B (Ciencias Básicas & Matemáticas)', descripcion: 'Facultad de Ciencias Básicas', coordenadaRefX: 40, coordenadaRefY: 35 },
          { codigo: 'BLOQUE_C', nombre: 'Bloque C (Humanidades & Idiomas)', descripcion: 'Instituto de Idiomas y Humanidades', coordenadaRefX: 60, coordenadaRefY: 35 },
          { codigo: 'BLOQUE_F', nombre: 'Bloque F (Aulas de Clase & Auditorios)', descripcion: 'Edificio de salones múltiples', coordenadaRefX: 35, coordenadaRefY: 65 },
          { codigo: 'BLOQUE_G', nombre: 'Bloque G (Arquitectura, Arte y Diseño)', descripcion: 'Talleres de diseño', coordenadaRefX: 20, coordenadaRefY: 70 },
          { codigo: 'BLOQUE_K', nombre: 'Bloque K (Edificio de Posgrados & Innovación)', descripcion: 'Nuevo edificio de Posgrados', coordenadaRefX: 75, coordenadaRefY: 60 },
          { codigo: 'CAFETERIA_CENTRAL', nombre: 'Cafetería Central / Du Nord', descripcion: 'Zona de comidas principal', coordenadaRefX: 55, coordenadaRefY: 45 },
          { codigo: 'BIBLIOTECA_PARRISH', nombre: 'Biblioteca Karl C. Parrish Jr.', descripcion: 'Biblioteca central y salas de estudio', coordenadaRefX: 45, coordenadaRefY: 55 },
          { codigo: 'COLISEO_FUNDADORES', nombre: 'Coliseo Los Fundadores & Canchas', descripcion: 'Complejo deportivo', coordenadaRefX: 80, coordenadaRefY: 30 },
          { codigo: 'FUENTE_CENTRAL', nombre: 'Plaza de la Paz & Fuente Central', descripcion: 'Punto de encuentro central', coordenadaRefX: 50, coordenadaRefY: 48 },
          { codigo: 'BIENESTAR_ESTUDIANTIL', nombre: 'Edificio de Bienestar & Centro Médico', descripcion: 'Salud y bienestar', coordenadaRefX: 70, coordenadaRefY: 45 },
        ];

        for (const z of zonesData) {
          await prisma.campusZone.create({ data: z }).catch(() => {});
        }

        const codes = zonesData.map((z) => z.codigo);
        for (const orig of codes) {
          for (const dest of codes) {
            await prisma.zoneDistance.create({
              data: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: orig === dest ? 3 : 6 },
            }).catch(() => {});
          }
        }
      }

      // 2. Admin Principal
      const pass = await hashPassword('admin123');
      await prisma.user.upsert({
        where: { correo: 'admin@uninorte.edu.co' },
        update: {},
        create: {
          nombre: 'Administrador Uninorte',
          correo: 'admin@uninorte.edu.co',
          passwordHash: pass,
          rol: 'ADMIN',
          telefono: '3001234567',
        },
      });
    }
  } catch (err) {
    console.error('Error en ensureInitialData:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialData();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('categoria');
    const search = searchParams.get('q');
    const includeAll = searchParams.get('all') === 'true';

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
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { ubicacionCampus: { contains: search, mode: 'insensitive' } },
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
      orderBy: [
        { esFundador: 'desc' },
        { fechaAprobacion: 'desc' },
        { fechaCreacion: 'desc' },
      ],
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

    const founderCount = await prisma.business.count({
      where: { esFundador: true, estadoAprobacion: 'APROBADO' },
    });
    const isFounder = founderCount < 10;
    const now = new Date();
    const threeMonths = new Date(now);
    threeMonths.setMonth(threeMonths.getMonth() + 3);

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
        estadoAprobacion: 'APROBADO', // Auto-aprobado para visibilidad inmediata en el campus
        activo: true,
        esFundador: isFounder,
        fechaAprobacion: now,
        fechaInicioPromocion: isFounder ? now : null,
        fechaFinPromocion: isFounder ? threeMonths : null,
        suscripcionMonto: isFounder ? 19900 : 29900,
        suscripcionEstado: 'ACTIVA',
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
