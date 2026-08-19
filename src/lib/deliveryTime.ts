import prisma from './prisma';
import { DeliveryEstimateResult } from '@/types';

export async function calculateEstimatedDeliveryTime(
  origenCodigo: string,
  destinoCodigo: string,
  _prepMin: number = 0
): Promise<DeliveryEstimateResult> {
  let tiempoTrasladoMin = 5; // Estimación promedio de caminata en campus (3-7 min)

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
      }
    }
  } catch (error) {
    console.error('Error calculando distancia en campus:', error);
  }

  const tiempoTotalMin = tiempoTrasladoMin;
  const minRange = Math.max(3, tiempoTotalMin - 1);
  const maxRange = tiempoTotalMin + 3;

  const origenZone = await prisma.campusZone.findUnique({
    where: { codigo: origenCodigo },
  }).catch(() => null);

  const destinoZone = await prisma.campusZone.findUnique({
    where: { codigo: destinoCodigo },
  }).catch(() => null);

  return {
    tiempoTotalMin,
    tiempoBasePrepMin: 0,
    tiempoTrasladoMin,
    rangoTexto: `${minRange} - ${maxRange} min`,
    origenNombre: origenZone?.nombre || origenCodigo,
    destinoNombre: destinoZone?.nombre || destinoCodigo,
  };
}
