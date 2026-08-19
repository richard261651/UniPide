const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('--- Iniciando Sembrado de Base de Datos Uninorte (UniPide) ---');

  // 1. Zonas del Campus
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
    await prisma.campusZone.upsert({
      where: { codigo: z.codigo },
      update: z,
      create: z,
    });
  }
  console.log('✅ Zonas del campus registradas.');

  // Matriz de distancias
  const codes = zonesData.map((z) => z.codigo);
  for (const orig of codes) {
    for (const dest of codes) {
      const mins = orig === dest ? 3 : 6;
      await prisma.zoneDistance.upsert({
        where: { origenCodigo_destinoCodigo: { origenCodigo: orig, destinoCodigo: dest } },
        update: { minutosTraslado: mins },
        create: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: mins },
      });
    }
  }
  console.log('✅ Matriz de distancias configurada.');

  // 2. Administrador
  const passAdmin = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { correo: 'admin@uninorte.edu.co' },
    update: {},
    create: {
      nombre: 'Administrador Uninorte',
      correo: 'admin@uninorte.edu.co',
      passwordHash: passAdmin,
      rol: 'ADMIN',
      telefono: '3001234567',
    },
  });
  console.log('✅ Cuenta Administrador lista (admin@uninorte.edu.co / admin123).');

  // 3. Negocios y Productos
  const passEmp = await hashPassword('emprendedor123');

  // Burger Lab
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

  const bizBurgers = await prisma.business.upsert({
    where: { slug: 'burger-lab-uninorte' },
    update: { estadoAprobacion: 'APROBADO', activo: true },
    create: {
      userId: userBurgers.id,
      nombre: 'Burger Lab Uninorte 🍔',
      slug: 'burger-lab-uninorte',
      categoria: 'Comida Rápida',
      descripcion: 'Hamburguesas artesanales smash, sándwiches gourmet y papas rústicas preparados al instante.',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
      ubicacionCampus: 'Zona de Emprendimientos - Kiosco 03 (Frente a Bloque F)',
      zonaCampusCodigo: 'ZONA_EMPRENDIMIENTOS',
      tiempoBasePrepMin: 12,
      estadoAprobacion: 'APROBADO',
      activo: true,
    },
  });

  const burgerProds = [
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
  ];

  for (const p of burgerProds) {
    const existing = await prisma.product.findFirst({ where: { businessId: p.businessId, nombre: p.nombre } });
    if (!existing) await prisma.product.create({ data: p });
  }

  // Sweet Bites
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

  const bizSweet = await prisma.business.upsert({
    where: { slug: 'sweet-bites-bakery' },
    update: { estadoAprobacion: 'APROBADO', activo: true },
    create: {
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

  const sweetProds = [
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
  ];

  for (const p of sweetProds) {
    const existing = await prisma.product.findFirst({ where: { businessId: p.businessId, nombre: p.nombre } });
    if (!existing) await prisma.product.create({ data: p });
  }

  // Campus Merch
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

  const bizMerch = await prisma.business.upsert({
    where: { slug: 'campus-craft-stickers' },
    update: { estadoAprobacion: 'APROBADO', activo: true },
    create: {
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

  const merchProds = [
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
  ];

  for (const p of merchProds) {
    const existing = await prisma.product.findFirst({ where: { businessId: p.businessId, nombre: p.nombre } });
    if (!existing) await prisma.product.create({ data: p });
  }

  console.log('🎉 ¡Base de datos poblada al 100% con éxito en Neon PostgreSQL!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
