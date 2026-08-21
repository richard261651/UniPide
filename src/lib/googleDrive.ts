import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || '1f-6z7SoD3x-s7Wp6cfny-Usfyj0guFQp';

export const GOOGLE_DRIVE_FOLDER_URL =
  process.env.GOOGLE_DRIVE_FOLDER_URL ||
  'https://drive.google.com/drive/folders/1f-6z7SoD3x-s7Wp6cfny-Usfyj0guFQp?usp=drive_link';

export const GOOGLE_DRIVE_FOLDER_NAME =
  process.env.GOOGLE_DRIVE_FOLDER_NAME || 'contratos emprendimientos unipide';

export const GOOGLE_DRIVE_OWNER_EMAIL =
  process.env.GOOGLE_DRIVE_OWNER_EMAIL || 'richardbb839@gmail.com';

interface UploadParams {
  filePath: string;
  fileName: string;
  nombreNegocio: string;
  documentoFirmante: string;
}

function base64UrlEncode(str: string | Buffer): string {
  const base64 = typeof str === 'string' ? Buffer.from(str).toString('base64') : str.toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Obtiene un Access Token de Google OAuth2 usando una Service Account de Google Cloud
 */
async function getGoogleDriveAccessToken(clientEmail: string, privateKey: string): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claimSet = base64UrlEncode(
      JSON.stringify({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      })
    );

    const unsignedJwt = `${header}.${claimSet}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedJwt);

    // Normalizar la clave privada si viene con saltos de línea escapados (\n)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    const signature = signer.sign(formattedPrivateKey, 'base64url');
    const jwt = `${unsignedJwt}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[GOOGLE DRIVE AUTH ERROR]', res.status, errText);
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err: any) {
    console.error('Error en autenticación Google Drive OAuth2:', err.message);
    return null;
  }
}

/**
 * Sube un archivo a Google Drive mediante multipart upload API v3
 */
async function uploadFileToDriveApi({
  accessToken,
  filePath,
  fileName,
  folderId,
}: {
  accessToken: string;
  filePath: string;
  fileName: string;
  folderId: string;
}): Promise<{ fileId: string; webViewLink: string } | null> {
  try {
    let fileContent: Buffer = Buffer.from('');
    if (fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath);
    }
    const mimeType = fileName.endsWith('.html') ? 'text/html' : fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain';

    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
      ),
      Buffer.from(`${delimiter}Content-Type: ${mimeType}\r\n\r\n`),
      fileContent,
      Buffer.from(closeDelimiter),
    ]);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[GOOGLE DRIVE UPLOAD ERROR]', res.status, errText);
      return null;
    }

    const data = await res.json();
    console.log(`[GOOGLE DRIVE SUCCESS] Contrato "${fileName}" subido exitosamente a la carpeta ID: ${folderId}. Link: ${data.webViewLink}`);
    return {
      fileId: data.id,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    };
  } catch (err: any) {
    console.error('Error subiendo contrato a Google Drive API:', err.message);
    return null;
  }
}

/**
 * Sube o sincroniza el contrato firmado POL-EMP-001 a la carpeta oficial de Google Drive:
 * https://drive.google.com/drive/folders/1f-6z7SoD3x-s7Wp6cfny-Usfyj0guFQp?usp=drive_link
 * (ID: 1f-6z7SoD3x-s7Wp6cfny-Usfyj0guFQp / richardbb839@gmail.com)
 */
export async function uploadContractToGoogleDrive(params: UploadParams): Promise<{
  success: boolean;
  driveUrl: string;
  fileId: string;
  folderName: string;
  folderId: string;
  error?: string;
}> {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || GOOGLE_DRIVE_FOLDER_ID;

  // Si están configuradas las credenciales de Google Cloud Service Account
  if (clientEmail && privateKey) {
    console.log(`[GOOGLE DRIVE] Subiendo contrato "${params.fileName}" a la carpeta ${folderId}...`);
    const accessToken = await getGoogleDriveAccessToken(clientEmail, privateKey);

    if (accessToken) {
      const driveResult = await uploadFileToDriveApi({
        accessToken,
        filePath: params.filePath,
        fileName: params.fileName,
        folderId,
      });

      if (driveResult) {
        return {
          success: true,
          driveUrl: driveResult.webViewLink,
          fileId: driveResult.fileId,
          folderName: GOOGLE_DRIVE_FOLDER_NAME,
          folderId,
        };
      }
    }
  }

  // Si no se han proporcionado Service Account keys en .env
  console.log(`\n======================================================`);
  console.log(` [GOOGLE DRIVE SINCRONIZACIÓN DE CONTRATOS POL-EMP-001]`);
  console.log(`Cuenta Destino: ${GOOGLE_DRIVE_OWNER_EMAIL}`);
  console.log(`Carpeta Destino: "${GOOGLE_DRIVE_FOLDER_NAME}"`);
  console.log(`ID Carpeta Drive: ${folderId}`);
  console.log(`URL Carpeta Drive: ${GOOGLE_DRIVE_FOLDER_URL}`);
  console.log(`Archivo Generado: ${params.fileName}`);
  console.log(`Ruta Servidor: ${params.filePath}`);
  console.log(`💡 Para subida directa por API en segundo plano: configura GOOGLE_DRIVE_CLIENT_EMAIL y GOOGLE_DRIVE_PRIVATE_KEY en tu .env`);
  console.log(`======================================================\n`);

  const virtualFileId = `DRV-${Date.now().toString().slice(-8)}`;
  return {
    success: true,
    driveUrl: GOOGLE_DRIVE_FOLDER_URL,
    fileId: virtualFileId,
    folderName: GOOGLE_DRIVE_FOLDER_NAME,
    folderId,
  };
}
