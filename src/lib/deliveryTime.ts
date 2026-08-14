import prisma from './prisma';
import { DeliveryEstimateResult } from '@/types';

// Tiempos de desplazamiento por defecto (minutos a pie en campus Uninorte) si no están en DB
const DEFAULT_CAMPUS_DISTANCES: Record<string, Record<string, number>> = {
  ZONA_EMPRENDIMIENTOS: {
    ZONA_EMPRENDIMIENTOS: 3,
    BLOQUE_A: 6,
    BLOQUE_B: 5,
    BLOQUE_C: 5,
    BLOQUE_F: 4,
    BLOQUE_G: 7,
    BLOQUE_K: 8,
    CAFETERIA_CENTRAL: 4,
    BIBLIOTECA_PARRISH: 5,
    COLISEO_FUNDADORES: 10,
    FUENTE_CENTRAL: 3,
    BIENESTAR_ESTUDIANTIL: 7,
  },
  BLOQUE_F: {
    ZONA_EMPRENDIMIENTOS: 4,
    BLOQUE_A: 7,
    BLOQUE_B: 6,
    BLOQUE_C: 7,
    BLOQUE_F: 3,
    BLOQUE_G: 5,
    BLOQUE_K: 9,
    CAFETERIA_CENTRAL: 5,
    BIBLIOTECA_PARRISH: 5,
    COLISEO_FUNDADORES: 11,
    FUENTE_CENTRAL: 4,
    BIENESTAR_ESTUDIANTIL: 8,
  },
  BLOQUE_G: {
    ZONA_EMPRENDIMIENTOS: 7,
    BLOQUE_A: 9,
    BLOQUE_B: 8,
    BLOQUE_C: 9,
    BLOQUE_F: 5,
    BLOQUE_G: 3,
    BLOQUE_K: 12,
    CAFETERIA_CENTRAL: 8,
    BIBLIOTECA_PARRISH: 7,
    COLISEO_FUNDADORES: 14,
    FUENTE_CENTRAL: 7,
    BIENESTAR_ESTUDIANTIL: 10,
  },
  FUENTE_CENTRAL: {
    ZONA_EMPRENDIMIENTOS: 3,
    BLOQUE_A: 5,
    BLOQUE_B: 4,
    BLOQUE_C: 4,
    BLOQUE_F: 4,
    BLOQUE_G: 7,
    BLOQUE_K: 7,
    CAFETERIA_CENTRAL: 3,
    BIBLIOTECA_PARRISH: 4,
    COLISEO_FUNDADORES: 9,
    FUENTE_CENTRAL: 3,
    BIENESTAR_ESTUDIANTIL: 6,
  },
};

export async function calculateEstimatedDeliveryTime(
  origenCodigo: string,
  destinoCodigo: string,
  tiempoBasePrepMin: number = 15
): Promise<DeliveryEstimateResult> {
  let tiempoTrasladoMin = 6; // Valor por defecto estimado dentro de Uninorte

  try {
    if (origenCodigo === destinoCodigo) {
      tiempoTrasladoMin = 3;
    } else {
      const distance = await prisma.zoneDistance.findUnique({
        where: {
          origenCodigo_destinoCodigo: {
            origenCodigo,
            destinoCodigo,
          },
        },
      });

      if (distance) {
        tiempoTrasladoMin = distance.minutosTraslado;
      } else if (
        DEFAULT_CAMPUS_DISTANCES[origenCodigo] &&
        DEFAULT_CAMPUS_DISTANCES[origenCodigo][destinoCodigo]
      ) {
        tiempoTrasladoMin = DEFAULT_CAMPUS_DISTANCES[origenCodigo][destinoCodigo];
      }
    }
  } catch (error) {
    console.error('Error calculando distancia en campus:', error);
  }

  const tiempoTotalMin = tiempoBasePrepMin + tiempoTrasladoMin;
  const minRange = Math.max(5, tiempoTotalMin - 2);
  const maxRange = tiempoTotalMin + 4;

  const origenZone = await prisma.campusZone.findUnique({
    where: { codigo: origenCodigo },
  }).catch(() => null);

  const destinoZone = await prisma.campusZone.findUnique({
    where: { codigo: destinoCodigo },
  }).catch(() => null);

  return {
    tiempoTotalMin,
    tiempoBasePrepMin,
    tiempoTrasladoMin,
    rangoTexto: `${minRange} - ${maxRange} min`,
    origenNombre: origenZone?.nombre || origenCodigo,
    destinoNombre: destinoZone?.nombre || destinoCodigo,
  };
}
