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

      // 2. Admin
      const pass = await hashPassword('admin123');
      const admin = await prisma.user.upsert({
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

      // 3. Negocio de Comida: Burger Lab
      const passEmp = await hashPassword('emprendedor123');
      const userBurgers = await prisma.user.upsert({
        where: { correo: 'burgers@uninorte.edu.co' },
        update: {},
        create: {
          nombre: 'Carlos Mendoza (Ing. Industrial)',
          correo: 'burgers@uninorte.edu.co',
          passwordHash: passEmp,
          rol: 'EMPRENDEDOR',
          telefono: '3015551234',
        },
      });

      const bizBurgers = await prisma.business.create({
        data: {
          userId: userBurgers.id,
          nombre: 'Burger Lab Uninorte 🍔',
          slug: 'burger-lab-uninorte',
          categoria: 'Comida Rápida',
          descripcion: 'Hamburguesas artesanales smash, sándwiches gourmet y papas rústicas preparados al instante por estudiantes de Ingeniería.',
          logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
          ubicacionCampus: 'Zona de Emprendimientos - Kiosco 03 (Frente a Bloque F)',
          zonaCampusCodigo: 'ZONA_EMPRENDIMIENTOS',
          tiempoBasePrepMin: 12,
          estadoAprobacion: 'APROBADO',
          activo: true,
        },
      });

      await prisma.product.createMany({
        data: [
          {
            businessId: bizBurgers.id,
            nombre: 'Smash Burger Doble Queso',
            descripcion: 'Dos carnes de 90g smash, doble cheddar americano, tocineta crujiente y salsa especial de la casa en pan brioche artesanal.',
            precio: 18000,
            foto: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
            stock: 25,
            disponible: true,
            categoria: 'Hamburguesas',
            esOferta: true,
            precioOferta: 15500,
            descripcionOferta: '¡Oferta especial almuerzo universitario!',
          },
          {
            businessId: bizBurgers.id,
            nombre: 'Sándwich Crispy Chicken',
            descripcion: 'Pechuga de pollo apanada ultra crujiente, pepinillos dulces y coleslaw en pan brioche tostado.',
            precio: 16000,
            foto: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
            stock: 18,
            disponible: true,
            categoria: 'Sándwiches',
          },
          {
            businessId: bizBurgers.id,
            nombre: 'Papas Rústicas Cheddar & Bacon',
            descripcion: 'Papas naturales fritas bañadas en queso cheddar fundido y tocineta crujiente.',
            precio: 8500,
            foto: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
            stock: 30,
            disponible: true,
            categoria: 'Acompañamientos',
          },
        ],
      });

      // 4. Negocio de Postres: Sweet Bites
      const userSweet = await prisma.user.upsert({
        where: { correo: 'sweet@uninorte.edu.co' },
        update: {},
        create: {
          nombre: 'Valentina Restrepo (Adm. Empresas)',
          correo: 'sweet@uninorte.edu.co',
          passwordHash: passEmp,
          rol: 'EMPRENDEDOR',
          telefono: '3024449876',
        },
      });

      const bizSweet = await prisma.business.create({
        data: {
          userId: userSweet.id,
          nombre: 'Sweet Bites Bakery 🍰',
          slug: 'sweet-bites-bakery',
          categoria: 'Postres & Dulces',
          descripcion: 'Brownies melcochudos, galletas rellenas estilo NYC, postres de tres leches y cheesecakes caseros.',
          logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
          ubicacionCampus: 'Bloque F - Pasillo Central Piso 1',
          zonaCampusCodigo: 'BLOQUE_F',
          tiempoBasePrepMin: 8,
          estadoAprobacion: 'APROBADO',
          activo: true,
        },
      });

      await prisma.product.createMany({
        data: [
          {
            businessId: bizSweet.id,
            nombre: 'Cookie NYC Red Velvet & Nutella',
            descripcion: 'Galleta gigante recién horneada crujiente por fuera y rellena de abundante Nutella por dentro.',
            precio: 6500,
            foto: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
            stock: 20,
            disponible: true,
            categoria: 'Galletas',
            esOferta: true,
            precioOferta: 5000,
            descripcionOferta: 'Promo 2x1 en la segunda unidad',
          },
          {
            businessId: bizSweet.id,
            nombre: 'Brownie Melcochudo con Arequipe',
            descripcion: 'Brownie de chocolate semi-amargo 70% cacao con centro suave y vetas de arequipe.',
            precio: 5500,
            foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
            stock: 15,
            disponible: true,
            categoria: 'Brownies',
          },
        ],
      });

      // 5. Negocio de Merch & Stickers
      const userMerch = await prisma.user.upsert({
        where: { correo: 'merch@uninorte.edu.co' },
        update: {},
        create: {
          nombre: 'Andrés Camargo (Diseño Gráfico)',
          correo: 'merch@uninorte.edu.co',
          passwordHash: passEmp,
          rol: 'EMPRENDEDOR',
          telefono: '3048883456',
        },
      });

      const bizMerch = await prisma.business.create({
        data: {
          userId: userMerch.id,
          nombre: 'Campus Craft & Stickers 🎨',
          slug: 'campus-craft-stickers',
          categoria: 'Accesorios & Merch',
          descripcion: 'Stickers resistentes al agua de Uninorte y cultura pop, pines metálicos y libretas personalizadas.',
          logo: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80',
          ubicacionCampus: 'Bloque G (Diseño) - Ágora de Talleres',
          zonaCampusCodigo: 'BLOQUE_G',
          tiempoBasePrepMin: 5,
          estadoAprobacion: 'APROBADO',
          activo: true,
        },
      });

      await prisma.product.createMany({
        data: [
          {
            businessId: bizMerch.id,
            nombre: 'Pack 5 Stickers Uninorte & Barranquilla',
            descripcion: 'Stickers de vinilo laminado resistentes al agua, termos y portátiles con temática Uninorte.',
            precio: 7500,
            foto: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&auto=format&fit=crop&q=80',
            stock: 50,
            disponible: true,
            categoria: 'Stickers',
            esOferta: true,
            precioOferta: 6000,
            descripcionOferta: 'Pack universitario exclusivo',
          },
          {
            businessId: bizMerch.id,
            nombre: 'Tote Bag Universitaria en Dril',
            descripcion: 'Bolsa ecológica gruesa con bolsillo interno para carnet y celular, estampada en serigrafía.',
            precio: 25000,
            foto: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
            stock: 12,
            disponible: true,
            categoria: 'Moda & Accesorios',
          },
        ],
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
        estadoAprobacion: 'APROBADO', // Auto-aprobado para visibilidad inmediata en el campus
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
