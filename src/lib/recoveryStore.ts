// Mapa en memoria para tokens/códigos temporales de recuperación de contraseña
export const recoveryTokens = new Map<string, { code: string; expiresAt: number }>();
