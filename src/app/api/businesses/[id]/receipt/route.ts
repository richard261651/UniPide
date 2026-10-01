import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Subscriptions and receipt payments are disabled (100% free platform)' });
}
