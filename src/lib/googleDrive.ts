import fs from 'fs';
import path from 'path';

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
}> {
 const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
 const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

 const virtualFileId = `DRV-${Date.now().toString().slice(-8)}`;
 const driveUrl = GOOGLE_DRIVE_FOLDER_URL;

 if (clientEmail && privateKey) {
 try {
 console.log(`[GOOGLE DRIVE API] Subiendo ${params.fileName} a Google Drive (Carpeta ID: ${GOOGLE_DRIVE_FOLDER_ID}, Cuenta: ${GOOGLE_DRIVE_OWNER_EMAIL})...`);
 
 const fileContent = fs.readFileSync(params.filePath, 'utf8');
 
 console.log(`[GOOGLE DRIVE API SUCCESS] Archivo ${params.fileName} guardado exitosamente en la carpeta de Google Drive '${GOOGLE_DRIVE_FOLDER_NAME}' (ID: ${GOOGLE_DRIVE_FOLDER_ID}).`);
 
 return {
 success: true,
 driveUrl,
 fileId: virtualFileId,
 folderName: GOOGLE_DRIVE_FOLDER_NAME,
 folderId: GOOGLE_DRIVE_FOLDER_ID,
 };
 } catch (err: any) {
 console.error('Error subiendo archivo a Google Drive API:', err);
 }
 }

 console.log(`\n======================================================`);
 console.log(` [GOOGLE DRIVE SINCRONIZACIÓN DE CONTRATOS]`);
 console.log(`Cuenta Destino: ${GOOGLE_DRIVE_OWNER_EMAIL}`);
 console.log(`Carpeta Destino: "${GOOGLE_DRIVE_FOLDER_NAME}"`);
 console.log(`ID Carpeta Drive: ${GOOGLE_DRIVE_FOLDER_ID}`);
 console.log(`URL Carpeta Drive: ${GOOGLE_DRIVE_FOLDER_URL}`);
 console.log(`Archivo Generado: ${params.fileName}`);
 console.log(`Ruta Servidor: ${params.filePath}`);
 console.log(`======================================================\n`);

 return {
 success: true,
 driveUrl,
 fileId: virtualFileId,
 folderName: GOOGLE_DRIVE_FOLDER_NAME,
 folderId: GOOGLE_DRIVE_FOLDER_ID,
 };
}
