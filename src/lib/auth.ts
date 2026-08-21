import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { UserSession } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'uninorte-marketplace-jwt-secret-key-2026-super-secure';
const TOKEN_COOKIE_NAME = 'uninorte_session_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export function getSessionFromCookies(): UserSession | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwtToken(token);
  } catch (error) {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): UserSession | null {
  try {
    // 1. Check Bearer Authorization Header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyJwtToken(token);
      if (decoded) return decoded;
    }

    // 2. Check Cookie
    const tokenCookie = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (tokenCookie) {
      return verifyJwtToken(tokenCookie);
    }

    return null;
  } catch (error) {
    return null;
  }
}

export { TOKEN_COOKIE_NAME };
