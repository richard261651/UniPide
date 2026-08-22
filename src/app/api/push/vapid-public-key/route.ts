import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/webpush';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    return NextResponse.json({ publicKey });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al obtener la clave pública VAPID' },
      { status: 500 }
    );
  }
}
