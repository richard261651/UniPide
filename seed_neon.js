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
 console.log(' Zonas del campus registradas.');

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
 console.log(' Matriz de distancias configurada.');

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
 console.log(' Cuenta Administrador lista (admin@uninorte.edu.co / admin123).');

 console.log(' ¡Base de datos poblada exitosamente con zonas y cuenta de administrador!');
}

main()
 .catch((e) => {
 console.error(e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
