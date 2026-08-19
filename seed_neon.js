const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('--- Iniciando Sembrado de Base de Datos Uninorte (UniPide) ---');

  // 1. Zonas del Campus Oficiales
  const zonesData = [
    { codigo: 'BLOQUE_A', nombre: 'Bloque A' },
    { codigo: 'BLOQUE_B', nombre: 'Bloque B' },
    { codigo: 'BLOQUE_C', nombre: 'Bloque C' },
    { codigo: 'BLOQUE_D', nombre: 'Bloque D' },
    { codigo: 'BLOQUE_E', nombre: 'Bloque E' },
    { codigo: 'BLOQUE_F', nombre: 'Bloque F' },
    { codigo: 'BLOQUE_G', nombre: 'Bloque G' },
    { codigo: 'BLOQUE_I', nombre: 'Bloque I' },
    { codigo: 'BLOQUE_J', nombre: 'Bloque J' },
    { codigo: 'BLOQUE_K', nombre: 'Bloque K' },
    { codigo: 'BLOQUE_L', nombre: 'Bloque L' },
    { codigo: 'BLOQUE_M', nombre: 'Bloque M' },
    { codigo: 'BAMBU_1', nombre: 'B1: Bambú 1' },
    { codigo: 'BAMBU_2', nombre: 'B2: Bambú 2' },
    { codigo: 'FUENTE', nombre: 'F: Fuente' },
    { codigo: 'COLISEO', nombre: 'C: Coliseo' },
    { codigo: 'AUDITORIO', nombre: 'A: Auditorio' },
    { codigo: 'BIBLIOTECA', nombre: 'BKC: Biblioteca' },
    { codigo: 'CASA_ESTUDIO', nombre: 'CE: Casa Estudio' },
    { codigo: 'CENTRO_MEDICO', nombre: 'CM: Centro Médico' },
    { codigo: 'CENTRO_DEPORTIVO', nombre: 'CD: Centro Deportivo' },
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
      const mins = orig === dest ? 3 : 5;
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
      descripcion: 'Hamburguesas artesanales smash, sándwiches gourmet y papas rústicas.',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
      ubicacionCampus: 'Bloque F',
      zonaCampusCodigo: 'BLOQUE_F',
      tiempoBasePrepMin: 0,
      estadoAprobacion: 'APROBADO',
      activo: true,
    },
  });

  const burgerProds = [
    {
      businessId: bizBurgers.id,
      nombre: 'Smash Burger Doble Queso',
      descripcion: 'Dos carnes de 90g smash, doble cheddar americano y tocineta crujiente en pan brioche.',
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
      descripcion: 'Pechuga de pollo apanada ultra crujiente, pepinillos dulces y coleslaw.',
      precio: 16000,
      foto: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
      stock: 18,
      disponible: true,
      categoria: 'Sándwiches',
    },
  ];

  for (const p of burgerProds) {
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
