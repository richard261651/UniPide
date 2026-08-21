import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada con éxito con zonas del campus y usuario administrador.',
    });
  } catch (error: any) {
    console.error('Error inicializando base de datos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
