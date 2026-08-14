import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Zonas del Campus Uninorte
    const existingZones = await prisma.campusZone.count();
    if (existingZones === 0) {
      const zonesData = [
        {
          codigo: 'ZONA_EMPRENDIMIENTOS',
          nombre: 'Zona de Emprendimientos (Pasillo Ágora Central)',
          descripcion: 'Corredor comercial estudiantil junto a la fuente central',
          coordenadaRefX: 50,
          coordenadaRefY: 50,
        },
        {
          codigo: 'BLOQUE_A',
          nombre: 'Bloque A (Ingenierías & Laboratorios)',
          descripcion: 'Edificio principal de Ingenierías',
          coordenadaRefX: 30,
          coordenadaRefY: 40,
        },
        {
          codigo: 'BLOQUE_B',
          nombre: 'Bloque B (Ciencias Básicas & Matemáticas)',
          descripcion: 'Facultad de Ciencias Básicas',
          coordenadaRefX: 40,
          coordenadaRefY: 35,
        },
        {
          codigo: 'BLOQUE_C',
          nombre: 'Bloque C (Humanidades & Idiomas)',
          descripcion: 'Instituto de Idiomas y Humanidades',
          coordenadaRefX: 60,
          coordenadaRefY: 35,
        },
        {
          codigo: 'BLOQUE_F',
          nombre: 'Bloque F (Aulas de Clase & Auditorios)',
          descripcion: 'Edificio de salones múltiples y auditorios principales',
          coordenadaRefX: 35,
          coordenadaRefY: 65,
        },
        {
          codigo: 'BLOQUE_G',
          nombre: 'Bloque G (Arquitectura, Arte y Diseño)',
          descripcion: 'Talleres de diseño, maquetas y arquitectura',
          coordenadaRefX: 20,
          coordenadaRefY: 70,
        },
        {
          codigo: 'BLOQUE_K',
          nombre: 'Bloque K (Edificio de Posgrados & Innovación)',
          descripcion: 'Nuevo edificio de Posgrados e Innovación',
          coordenadaRefX: 75,
          coordenadaRefY: 60,
        },
        {
          codigo: 'CAFETERIA_CENTRAL',
          nombre: 'Cafetería Central / Du Nord',
          descripcion: 'Zona de comidas principal del campus',
          coordenadaRefX: 55,
          coordenadaRefY: 45,
        },
        {
          codigo: 'BIBLIOTECA_PARRISH',
          nombre: 'Biblioteca Karl C. Parrish Jr.',
          descripcion: 'Edificio de la biblioteca central y salas de estudio',
          coordenadaRefX: 45,
          coordenadaRefY: 55,
        },
        {
          codigo: 'COLISEO_FUNDADORES',
          nombre: 'Coliseo Los Fundadores & Canchas',
          descripcion: 'Complejo deportivo y coliseo de eventos',
          coordenadaRefX: 80,
          coordenadaRefY: 30,
        },
        {
          codigo: 'FUENTE_CENTRAL',
          nombre: 'Plaza de la Paz & Fuente Central',
          descripcion: 'Punto de encuentro central al aire libre',
          coordenadaRefX: 50,
          coordenadaRefY: 48,
        },
        {
          codigo: 'BIENESTAR_ESTUDIANTIL',
          nombre: 'Edificio de Bienestar & Centro Médico',
          descripcion: 'Salud estudiantil, cultura y deportes',
          coordenadaRefX: 70,
          coordenadaRefY: 45,
        },
      ];

      for (const z of zonesData) {
        await prisma.campusZone.create({ data: z });
      }

      // Matriz de distancias
      const codes = zonesData.map((z) => z.codigo);
      for (const orig of codes) {
        for (const dest of codes) {
          if (orig === dest) {
            await prisma.zoneDistance.create({
              data: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: 3 },
            });
          } else {
            const zOrig = zonesData.find((z) => z.codigo === orig)!;
            const zDest = zonesData.find((z) => z.codigo === dest)!;
            const dx = (zOrig.coordenadaRefX || 50) - (zDest.coordenadaRefX || 50);
            const dy = (zOrig.coordenadaRefY || 50) - (zDest.coordenadaRefY || 50);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mins = Math.max(4, Math.min(14, Math.round(dist * 0.18 + 3)));

            await prisma.zoneDistance.create({
              data: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: mins },
            });
          }
        }
      }
    }

    // 2. Administrador
    const adminExists = await prisma.user.findFirst({ where: { rol: 'ADMIN' } });
    if (!adminExists) {
      const passwordHash = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          nombre: 'Administrador Uninorte',
          correo: 'admin@uninorte.edu.co',
          passwordHash,
          rol: 'ADMIN',
          telefono: '3001234567',
        },
      });
    }

    // 3. Emprendimientos y Productos Iniciales si no hay ninguno
    const totalBiz = await prisma.business.count();
    if (totalBiz === 0) {
      const passEmprendedor = await hashPassword('emprendedor123');

      // Emprendedor 1: Burger Lab
      const userBurgers = await prisma.user.create({
        data: {
          nombre: 'Carlos Mendoza (Ing. Industrial)',
          correo: 'burgers@uninorte.edu.co',
          passwordHash: passEmprendedor,
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
            descripcion: 'Dos carnes de 90g smash, doble cheddar, tocineta crujiente y salsa especial de la casa en pan brioche.',
            precio: 18000,
            foto: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
            stock: 25,
            disponible: true,
            categoria: 'Hamburguesas',
            esOferta: true,
            precioOferta: 15500,
            descripcionOferta: '¡Oferta almuerzo universitario!',
          },
          {
            businessId: bizBurgers.id,
            nombre: 'Sándwich Crispy Chicken',
            descripcion: 'Pechuga apanada extra crujiente, pepinillos dulces y coleslaw en pan brioche tostado.',
            precio: 16000,
            foto: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
            stock: 18,
            disponible: true,
            categoria: 'Sándwiches',
          },
          {
            businessId: bizBurgers.id,
            nombre: 'Papas Rústicas Cheddar & Bacon',
            descripcion: 'Papas naturales fritas bañadas en salsa de queso cheddar fundido y trocitos de tocineta.',
            precio: 8500,
            foto: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
            stock: 30,
            disponible: true,
            categoria: 'Acompañamientos',
          },
        ],
      });

      // Emprendedor 2: Sweet Bites Bakery
      const userSweet = await prisma.user.create({
        data: {
          nombre: 'Valentina Restrepo (Adm. Empresas)',
          correo: 'sweet@uninorte.edu.co',
          passwordHash: passEmprendedor,
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
          descripcion: 'Brownies melcochudos, galletas rellenas estilo NYC, postres tres leches y cheesecakes caseros para endulzar tus clases.',
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
            descripcion: 'Brownie de chocolate semi-amargo 70% cacao con centro suave y vetas de arequipe casero.',
            precio: 5500,
            foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
            stock: 15,
            disponible: true,
            categoria: 'Brownies',
          },
        ],
      });

      // Emprendedor 3: Campus Craft & Stickers
      const userMerch = await prisma.user.create({
        data: {
          nombre: 'Andrés Camargo (Diseño Gráfico)',
          correo: 'merch@uninorte.edu.co',
          passwordHash: passEmprendedor,
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
          descripcion: 'Stickers resistentes al agua de Uninorte y cultura pop, pines metálicos, tote bags ilustradas y libretas personalizadas.',
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
            descripcion: 'Stickers de vinilo laminado resistentes al agua, termos y portátiles. Diseños de Iguanas Uninorte y Bloques.',
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
            nombre: 'Tote Bag Universitaria 100% Dril',
            descripcion: 'Bolsa ecológica gruesa con bolsillo interno para celular y carnet, estampada en serigrafía.',
            precio: 25000,
            foto: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
            stock: 12,
            disponible: true,
            categoria: 'Moda & Accesorios',
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada con éxito con zonas, emprendimientos y productos reales de Uninorte.',
    });
  } catch (error: any) {
    console.error('Error inicializando base de datos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
