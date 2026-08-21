import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
 console.log('Iniciando carga de datos de prueba para Marketplace Uninorte...');

 // 1. Limpiar base de datos existente
 await prisma.rating.deleteMany();
 await prisma.orderItem.deleteMany();
 await prisma.order.deleteMany();
 await prisma.product.deleteMany();
 await prisma.business.deleteMany();
 await prisma.zoneDistance.deleteMany();
 await prisma.campusZone.deleteMany();
 await prisma.user.deleteMany();

 // 2. Crear Zonas del Campus Uninorte
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
 nombre: 'Bloque K (Edificio de Posgrados & Tecnología)',
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

 // 3. Crear matriz de distancias en campus (minutos de desplazamiento a pie)
 const zoneCodes = zonesData.map((z) => z.codigo);
 for (const orig of zoneCodes) {
 for (const dest of zoneCodes) {
 if (orig === dest) {
 await prisma.zoneDistance.create({
 data: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: 3 },
 });
 } else {
 // Cálculo de distancia euclidiana aproximada según coordenadas
 const zOrig = zonesData.find((z) => z.codigo === orig)!;
 const zDest = zonesData.find((z) => z.codigo === dest)!;
 const dx = (zOrig.coordenadaRefX || 50) - (zDest.coordenadaRefX || 50);
 const dy = (zOrig.coordenadaRefY || 50) - (zDest.coordenadaRefY || 50);
 const dist = Math.sqrt(dx * dx + dy * dy);
 // Escalar distancia (rango de 4 a 12 minutos a pie en campus)
 const mins = Math.max(4, Math.min(14, Math.round(dist * 0.18 + 3)));

 await prisma.zoneDistance.create({
 data: { origenCodigo: orig, destinoCodigo: dest, minutosTraslado: mins },
 });
 }
 }
 }

 // 4. Crear Usuarios con Contraseñas Encriptadas
 const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
 const hashedPasswordEmprendedor = await bcrypt.hash('emprendedor123', 10);
 const hashedPasswordCliente = await bcrypt.hash('estudiante123', 10);

 // Admin
 const adminUser = await prisma.user.create({
 data: {
 nombre: 'Administrador Uninorte',
 correo: 'admin@uninorte.edu.co',
 passwordHash: hashedPasswordAdmin,
 rol: 'ADMIN',
 telefono: '3001234567',
 foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
 },
 });

 // Emprendedor 1 - Hamburguesas & Sandwiches
 const userBurgers = await prisma.user.create({
 data: {
 nombre: 'Carlos Mendoza (Ing. Industrial)',
 correo: 'burgers@uninorte.edu.co',
 passwordHash: hashedPasswordEmprendedor,
 rol: 'EMPRENDEDOR',
 telefono: '3015551234',
 foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
 },
 });

 // Emprendedor 2 - Repostería & Postres
 const userSweet = await prisma.user.create({
 data: {
 nombre: 'Valentina Restrepo (Adm. Empresas)',
 correo: 'sweet@uninorte.edu.co',
 passwordHash: hashedPasswordEmprendedor,
 rol: 'EMPRENDEDOR',
 telefono: '3024449876',
 foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
 },
 });

 // Emprendedor 3 - Merch, Stickers & Papelería
 const userMerch = await prisma.user.create({
 data: {
 nombre: 'Andrés Camargo (Diseño Gráfico)',
 correo: 'merch@uninorte.edu.co',
 passwordHash: hashedPasswordEmprendedor,
 rol: 'EMPRENDEDOR',
 telefono: '3048883456',
 foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
 },
 });

 // Emprendedor 4 - Bebidas & Smoothies (PENDIENTE para pruebas del Admin)
 const userSmoothies = await prisma.user.create({
 data: {
 nombre: 'Camila Villalba (Medicina)',
 correo: 'smoothies@uninorte.edu.co',
 passwordHash: hashedPasswordEmprendedor,
 rol: 'EMPRENDEDOR',
 telefono: '3109998877',
 foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
 },
 });

 // Clientes
 const cliente1 = await prisma.user.create({
 data: {
 nombre: 'Sebastián Torres (Estudiante)',
 correo: 'estudiante@uninorte.edu.co',
 passwordHash: hashedPasswordCliente,
 rol: 'CLIENTE',
 telefono: '3007771122',
 foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
 },
 });

 const cliente2 = await prisma.user.create({
 data: {
 nombre: 'María Paula Gómez (Estudiante)',
 correo: 'maria.gomez@uninorte.edu.co',
 passwordHash: hashedPasswordCliente,
 rol: 'CLIENTE',
 telefono: '3153334455',
 foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
 },
 });

 // 5. Crear Emprendimientos (Businesses)
 const bizBurgers = await prisma.business.create({
 data: {
 userId: userBurgers.id,
 nombre: 'Burger Lab Uninorte ',
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

 const bizSweet = await prisma.business.create({
 data: {
 userId: userSweet.id,
 nombre: 'Sweet Bites Bakery ',
 slug: 'sweet-bites-bakery',
 categoria: 'Postres & Dulces',
 descripcion: 'Brownies melcochudos, galletas rellenas estilo New York, postres de tres leches y cheesecakes caseros para endulzar tus clases.',
 logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
 banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
 ubicacionCampus: 'Bloque F - Pasillo Central Piso 1',
 zonaCampusCodigo: 'BLOQUE_F',
 tiempoBasePrepMin: 8,
 estadoAprobacion: 'APROBADO',
 activo: true,
 },
 });

 const bizMerch = await prisma.business.create({
 data: {
 userId: userMerch.id,
 nombre: 'Campus Craft & Stickers ',
 slug: 'campus-craft-stickers',
 categoria: 'Accesorios & Merch',
 descripcion: 'Stickers resistentes al agua de Uninorte y cultura pop, pines metálicos, tote bags ilustradas y libretas personalizadas para tus materias.',
 logo: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&auto=format&fit=crop&q=80',
 banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80',
 ubicacionCampus: 'Venta Móvil / Entrega en Campus',
 zonaCampusCodigo: 'ZONA_EMPRENDIMIENTOS',
 tiempoBasePrepMin: 0,
 estadoAprobacion: 'APROBADO',
 activo: true,
 },
 });

 // Emprendedor 5 - Tecnología & Gadgets
 const userTech = await prisma.user.create({
 data: {
 nombre: 'Mateo Morales (Ing. Sistemas)',
 correo: 'tech@uninorte.edu.co',
 passwordHash: hashedPasswordEmprendedor,
 rol: 'EMPRENDEDOR',
 telefono: '3051112233',
 foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
 },
 });

 const bizTech = await prisma.business.create({
 data: {
 userId: userTech.id,
 nombre: 'TechStore Uninorte ',
 slug: 'techstore-uninorte',
 categoria: 'Tecnología & Gadgets',
 descripcion: 'Cargadores ultrarrápidos, cables tipo C y Lightning de alto rendimiento, powerbanks portátiles y gadgets de soporte urgente en campus.',
 logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
 banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
 ubicacionCampus: 'Venta Móvil / Entrega en Campus',
 zonaCampusCodigo: 'ZONA_EMPRENDIMIENTOS',
 tiempoBasePrepMin: 0,
 estadoAprobacion: 'APROBADO',
 activo: true,
 },
 });

 const bizSmoothies = await prisma.business.create({
 data: {
 userId: userSmoothies.id,
 nombre: 'Fruity & Fresh Uninorte ',
 slug: 'fruity-fresh-uninorte',
 categoria: 'Bebidas & Café',
 descripcion: 'Batidos de fruta 100% natural, bowls de açaí, café frío cold brew y limonadas saborizadas para refrescarte del calor de Barranquilla.',
 logo: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
 banner: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1200&auto=format&fit=crop&q=80',
 ubicacionCampus: 'Plaza de la Paz - Junto a la Fuente Central',
 zonaCampusCodigo: 'FUENTE_CENTRAL',
 tiempoBasePrepMin: 7,
 estadoAprobacion: 'PENDIENTE', // Para que el Admin pueda aprobarlo o rechazarlo
 activo: true,
 },
 });

 // 6. Crear Productos para cada Negocio
 // Productos Burger Lab
 const prodBurger1 = await prisma.product.create({
 data: {
 businessId: bizBurgers.id,
 nombre: 'Smash Burger Doble Queso',
 descripcion: 'Dos carnes de 90g smash, doble queso cheddar americano, tocineta crujiente, cebolla caramelizada y salsa especial de la casa en pan brioche artesanal.',
 precio: 18000,
 foto: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
 stock: 25,
 disponible: true,
 categoria: 'Hamburguesas',
 esOferta: true,
 precioOferta: 15500,
 descripcionOferta: '¡Oferta especial almuerzo universitario!',
 },
 });

 const prodBurger2 = await prisma.product.create({
 data: {
 businessId: bizBurgers.id,
 nombre: 'Sándwich Crispy Chicken',
 descripcion: 'Pechuga de pollo apanada ultra crujiente, pepinillos dulces, ensalada coleslaw fresca y mayonesa de ajo ahumado en pan brioche tostado.',
 precio: 16000,
 foto: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
 stock: 18,
 disponible: true,
 categoria: 'Sándwiches',
 esOferta: false,
 },
 });

 const prodBurger3 = await prisma.product.create({
 data: {
 businessId: bizBurgers.id,
 nombre: 'Papas Rústicas Cheddar & Bacon',
 descripcion: 'Porción generosa de papas fritas naturales con piel, bañadas en salsa de queso cheddar fundido y trocitos de tocineta crujiente.',
 precio: 8500,
 foto: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
 stock: 30,
 disponible: true,
 categoria: 'Acompañamientos',
 esOferta: false,
 },
 });

 const prodBurger4 = await prisma.product.create({
 data: {
 businessId: bizBurgers.id,
 nombre: 'Té Helado de Frutos Rojos',
 descripcion: 'Vaso de 16oz de té negro infusionado con frutos rojos naturales, limón y hierbabuena.',
 precio: 4500,
 foto: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
 stock: 40,
 disponible: true,
 categoria: 'Bebidas',
 esOferta: false,
 },
 });

 // Productos Sweet Bites Bakery
 const prodSweet1 = await prisma.product.create({
 data: {
 businessId: bizSweet.id,
 nombre: 'Cookie NYC Red Velvet & Nutella',
 descripcion: 'Galleta gigante recién horneada crujiente por fuera y rellena de abundante Nutella derretida por dentro.',
 precio: 6500,
 foto: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
 stock: 20,
 disponible: true,
 categoria: 'Galletas',
 esOferta: true,
 precioOferta: 5000,
 descripcionOferta: 'Promo 2x1 en la segunda unidad',
 },
 });

 const prodSweet2 = await prisma.product.create({
 data: {
 businessId: bizSweet.id,
 nombre: 'Brownie Melcochudo con Arequipe',
 descripcion: 'Brownie de chocolate semi-amargo 70% cacao con centro súper suave y vetas de arequipe casero.',
 precio: 5500,
 foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
 stock: 15,
 disponible: true,
 categoria: 'Brownies',
 esOferta: false,
 },
 });

 const prodSweet3 = await prisma.product.create({
 data: {
 businessId: bizSweet.id,
 nombre: 'Vaso Tres Leches Tradicional',
 descripcion: 'Bizcochuelo esponjoso empapado en nuestra mezcla secreta de tres leches y coronado con canela y chantilly.',
 precio: 7000,
 foto: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
 stock: 0,
 disponible: false, // "Agotado hoy" para probar el filtro
 categoria: 'Postres en Vaso',
 esOferta: false,
 },
 });

 // Productos Campus Craft & Stickers
 const prodMerch1 = await prisma.product.create({
 data: {
 businessId: bizMerch.id,
 nombre: 'Pack 5 Stickers Uninorte & Barranquilla',
 descripcion: 'Stickers de vinilo laminado de alta duración resistentes al agua, termos y portátiles. Diseños de Iguanas Uninorte, Caimán y Bloques.',
 precio: 7500,
 foto: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&auto=format&fit=crop&q=80',
 stock: 50,
 disponible: true,
 categoria: 'Stickers',
 esOferta: true,
 precioOferta: 6000,
 descripcionOferta: 'Pack universitario exclusivo',
 },
 });

 const prodMerch2 = await prisma.product.create({
 data: {
 businessId: bizMerch.id,
 nombre: 'Tote Bag Universitaria en Dril 100%',
 descripcion: 'Bolsa ecológica de tela gruesa con bolsillo interno para celular y carnet, estampada en serigrafía.',
 precio: 25000,
 foto: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
 stock: 12,
 disponible: true,
 categoria: 'Moda & Accesorios',
 esOferta: false,
 },
 });

 // Productos TechStore
 await prisma.product.create({
 data: {
 businessId: bizTech.id,
 nombre: 'Cargador Carga Rápida 20W USB-C',
 descripcion: 'Cubo cargador compacto de alta velocidad compatible con iPhone y Android, ideal para recargar en salones de clase.',
 precio: 28000,
 foto: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
 stock: 15,
 disponible: true,
 categoria: 'Cargadores',
 esOferta: true,
 precioOferta: 24000,
 descripcionOferta: '¡Descuento urgente para parciales!',
 },
 });

 await prisma.product.create({
 data: {
 businessId: bizTech.id,
 nombre: 'Cable Trensado USB-C a USB-C (2 Metros)',
 descripcion: 'Cable ultra resistente en nylon trenzado anti-enredos con soporte para carga rápida 60W y transferencia de datos.',
 precio: 15000,
 foto: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
 stock: 20,
 disponible: true,
 categoria: 'Cables',
 esOferta: false,
 },
 });

 // Productos Fruity Fresh (Para cuando el admin lo apruebe)
 await prisma.product.create({
 data: {
 businessId: bizSmoothies.id,
 nombre: 'Smoothie Mango & Maracuyá 16oz',
 descripcion: 'Frappé refrescante de pulpa natural sin azúcar añadida, con semillas de chía y hierbabuena.',
 precio: 7000,
 foto: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&auto=format&fit=crop&q=80',
 stock: 25,
 disponible: true,
 categoria: 'Smoothies',
 esOferta: false,
 },
 });

 // 7. Crear Pedidos de Muestra para probar estados e historial
 // Pedido 1: ENTREGADO (con calificación)
 const order1 = await prisma.order.create({
 data: {
 codigoPedido: 'ORD-1001',
 clienteId: cliente1.id,
 businessId: bizBurgers.id,
 estado: 'ENTREGADO',
 subtotal: 24000,
 total: 24000,
 zonaEntregaCodigo: 'BLOQUE_K',
 zonaEntregaNombre: 'Bloque K (Edificio de Posgrados & Tecnología)',
 detalleUbicacion: 'Piso 2, Sala de Estudio 204',
 tiempoEstimadoMin: 22,
 instrucciones: 'Llamar al llegar al lobby del Bloque K',
 metodoPago: 'Nequi / Transferencia',
 items: {
 create: [
 {
 productId: prodBurger1.id,
 nombreProducto: 'Smash Burger Doble Queso',
 cantidad: 1,
 precioUnitario: 15500,
 notas: 'Sin cebolla por favor',
 },
 {
 productId: prodBurger3.id,
 nombreProducto: 'Papas Rústicas Cheddar & Bacon',
 cantidad: 1,
 precioUnitario: 8500,
 },
 ],
 },
 },
 });

 await prisma.rating.create({
 data: {
 orderId: order1.id,
 clienteId: cliente1.id,
 businessId: bizBurgers.id,
 puntuacion: 5,
 comentario: '¡Excelente sabor y llegó calientita la hamburguesa hasta el Bloque K! Recomendadísimo.',
 },
 });

 // Pedido 2: EN_PREPARACION (Para ver en vivo en el portal del emprendedor)
 await prisma.order.create({
 data: {
 codigoPedido: 'ORD-1002',
 clienteId: cliente2.id,
 businessId: bizBurgers.id,
 estado: 'EN_PREPARACION',
 subtotal: 20500,
 total: 20500,
 zonaEntregaCodigo: 'BLOQUE_F',
 zonaEntregaNombre: 'Bloque F (Aulas de Clase)',
 detalleUbicacion: 'Piso 3, salón 302',
 tiempoEstimadoMin: 18,
 instrucciones: 'Entregar afuera del salón 302',
 metodoPago: 'Efectivo contraentrega',
 items: {
 create: [
 {
 productId: prodBurger2.id,
 nombreProducto: 'Sándwich Crispy Chicken',
 cantidad: 1,
 precioUnitario: 16000,
 },
 {
 productId: prodBurger4.id,
 nombreProducto: 'Té Helado de Frutos Rojos',
 cantidad: 1,
 precioUnitario: 4500,
 },
 ],
 },
 },
 });

 // Pedido 3: RECIBIDO (Nuevo pedido pendiente de aceptar)
 await prisma.order.create({
 data: {
 codigoPedido: 'ORD-1003',
 clienteId: cliente1.id,
 businessId: bizSweet.id,
 estado: 'RECIBIDO',
 subtotal: 10500,
 total: 10500,
 zonaEntregaCodigo: 'BIBLIOTECA_PARRISH',
 zonaEntregaNombre: 'Biblioteca Karl C. Parrish Jr.',
 detalleUbicacion: 'Mesas del primer piso cerca a la entrada',
 tiempoEstimadoMin: 14,
 instrucciones: 'Estaré con camisa azul',
 metodoPago: 'Daviplata',
 items: {
 create: [
 {
 productId: prodSweet1.id,
 nombreProducto: 'Cookie NYC Red Velvet & Nutella',
 cantidad: 1,
 precioUnitario: 5000,
 },
 {
 productId: prodSweet2.id,
 nombreProducto: 'Brownie Melcochudo con Arequipe',
 cantidad: 1,
 precioUnitario: 5500,
 },
 ],
 },
 },
 });

 console.log('¡Base de datos de Marketplace Uninorte poblada con éxito!');
 console.log('---------------------------------------------------------');
 console.log('CUENTAS DE PRUEBA CREADAS:');
 console.log('1. Administrador: admin@uninorte.edu.co / admin123');
 console.log('2. Emprendedor Comida: burgers@uninorte.edu.co / emprendedor123');
 console.log('3. Emprendedor Postres: sweet@uninorte.edu.co / emprendedor123');
 console.log('4. Emprendedor Merch: merch@uninorte.edu.co / emprendedor123');
 console.log('5. Emprendedor Pendiente: smoothies@uninorte.edu.co / emprendedor123');
 console.log('6. Cliente Estudiante: estudiante@uninorte.edu.co / estudiante123');
 console.log('---------------------------------------------------------');
}

main()
 .catch((e) => {
 console.error('Error poblando la base de datos:', e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
