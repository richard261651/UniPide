import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generar secreto Base32 aleatorio de 16 caracteres
export function generateTotpSecret(length = 16): string {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

// Decodificar cadena Base32 a Buffer
function base32Decode(base32Str: string): Buffer {
  const cleanStr = base32Str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const output = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const charIndex = BASE32_CHARS.indexOf(cleanStr[i]);
    if (charIndex === -1) continue;

    value = (value << 5) | charIndex;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

// Generar código TOTP de 6 dígitos para un time-step
export function generateTotpCode(secret: string, timeStepWindow = 0): string {
  const key = base32Decode(secret);
  let counter = Math.floor(Date.now() / 1000 / 30) + timeStepWindow;

  const buffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter & 0xff;
    counter >>>= 8;
  }

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const codeInt =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (codeInt % 1000000).toString().padStart(6, '0');
  return otp;
}

// Verificar código TOTP tolerando deriva de reloj (-1, 0, +1 ventana de 30 segundos)
export function verifyTotpCode(secret: string, token: string): boolean {
  if (!token || token.trim().length !== 6) return false;
  const cleanToken = token.trim();

  for (let window = -1; window <= 1; window++) {
    const validCode = generateTotpCode(secret, window);
    if (validCode === cleanToken) {
      return true;
    }
  }
  return false;
}

// Generar URI de Authenticator y URL de código QR
export function getTotpAuthUrl(email: string, secret: string, issuer = 'UniPide Uninorte') {
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&period=30&digits=6`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUrl)}`;
  return { otpauthUrl, qrImageUrl };
}
