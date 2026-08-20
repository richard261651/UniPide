import crypto from 'crypto';

export const WOMPI_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_Q5y18gNotmB2ZsW12fefc2ec2e';

export const WOMPI_INTEGRITY_SECRET =
  process.env.WOMPI_INTEGRITY_SECRET || 'prod_integrity_secret_uninorte_2026';

export const WOMPI_EVENTS_SECRET =
  process.env.WOMPI_EVENTS_SECRET || 'prod_events_secret_uninorte_2026';

export const WOMPI_API_BASE =
  process.env.WOMPI_ENVIRONMENT === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

/**
 * Calcula la firma de integridad SHA-256 exigida por Wompi Colombia
 * Cadena a encriptar: referencia + montoEnCentavos + moneda + secretoIntegridad
 */
export function calculateWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = 'COP'
): string {
  const rawString = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * Consulta el estado real de una transacción en las APIs oficiales de Wompi
 */
export async function fetchWompiTransaction(transactionId: string) {
  try {
    const res = await fetch(`${WOMPI_API_BASE}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
      },
    });

    if (!res.ok) {
      return { success: false, status: 'ERROR', error: 'No se pudo consultar Wompi API' };
    }

    const data = await res.json();
    return {
      success: true,
      status: data.data?.status || 'UNKNOWN',
      reference: data.data?.reference,
      amountInCents: data.data?.amount_in_cents,
      paymentMethodType: data.data?.payment_method_type,
      data: data.data,
    };
  } catch (err: any) {
    console.error('Error en fetchWompiTransaction:', err);
    return { success: false, status: 'ERROR', error: err.message };
  }
}
