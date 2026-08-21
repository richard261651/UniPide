import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signJwtToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { slugify, isValidEmail } from '@/lib/utils';

import { sendEmailVerificationCode, sendContractAcceptedEmail } from '@/lib/email';
import { generateDigitalContractDocument } from '@/lib/contractGenerator';
import { uploadContractToGoogleDrive } from '@/lib/googleDrive';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'uninorte2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      correo,
      correoPersonal,
      cedula,
      password,
      rol = 'CLIENTE',
      telefono,
      nombreNegocio,
      categoriaNegocio,
      ubicacionCampus,
      zonaCampusCodigo = 'ZONA_EMPRENDIMIENTOS',
      descripcionNegocio,
      tiempoBasePrepMin = 15,
      adminKey,
    } = body;

    if (!nombre || !correo || !password) {
      return NextResponse.json(
        { error: 'Nombre, correo institucional y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = correo.trim().toLowerCase();
    const cleanPersonalEmail = correoPersonal ? correoPersonal.trim().toLowerCase() : null;
    const cleanPhone = telefono ? telefono.trim().replace(/\D/g, '') : null;
    const rawCedula = (cedula || body.documentoFirmante || '').toString().trim().replace(/\D/g, '');

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo institucional válido' },
        { status: 400 }
      );
    }

    // Validación de Correo Institucional Uninorte para Estudiantes y Emprendedores
    if (rol !== 'ADMIN' && !cleanEmail.endsWith('@uninorte.edu.co')) {
      return NextResponse.json(
        { error: 'Debes utilizar tu correo institucional Uninorte (@uninorte.edu.co) para registrarte.' },
        { status: 400 }
      );
    }

    if (!cleanPersonalEmail || !isValidEmail(cleanPersonalEmail)) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo personal válido (Gmail, Outlook, etc.) para recibir tus códigos y notificaciones.' },
        { status: 400 }
      );
    }

    // 1. Validar Celular Obligatorio y No Duplicado
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Por favor ingresa un número de celular / WhatsApp válido de al menos 10 dígitos.' },
        { status: 400 }
      );
    }

    // 2. Validar Cédula Obligatoria y Formato
    if (!rawCedula || rawCedula.length < 7 || rawCedula.length > 10) {
      return NextResponse.json(
        { error: 'El número de cédula / documento de identidad debe contener entre 7 y 10 dígitos.' },
        { status: 400 }
      );
    }

    // 3. Verificar si el correo institucional ya está registrado
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { correo: cleanEmail },
          { correoPersonal: cleanEmail },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico institucional (@uninorte.edu.co).' },
        { status: 400 }
      );
    }

    // 4. Verificar si el correo personal ya está registrado en otra cuenta
    const existingPersonalUser = await prisma.user.findFirst({
      where: {
        OR: [
          { correoPersonal: cleanPersonalEmail },
          { correo: cleanPersonalEmail },
        ],
      },
    });

    if (existingPersonalUser) {
      return NextResponse.json(
        { error: 'Este correo personal ya se encuentra vinculado a otra cuenta en UniPide.' },
        { status: 400 }
      );
    }

    // 5. Verificar si el número de teléfono ya está registrado
    const existingPhone = await prisma.user.findFirst({
      where: {
        OR: [
          { telefono: cleanPhone },
          { telefono: telefono?.trim() },
        ],
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este número de celular / WhatsApp.' },
        { status: 400 }
      );
    }

    // 6. Verificar si la cédula / documento ya está registrada
    const existingCedula = await prisma.business.findFirst({
      where: {
        documentoFirmante: rawCedula,
      },
    });

    if (existingCedula) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta o negocio registrado con este número de cédula / documento de identidad.' },
        { status: 400 }
      );
    }

    // 7. Si es Emprendedor, verificar que el nombre del emprendimiento no esté repetido
    if (rol === 'EMPRENDEDOR') {
      if (!nombreNegocio || !nombreNegocio.trim()) {
        return NextResponse.json(
          { error: 'Por favor ingresa el nombre de tu emprendimiento.' },
          { status: 400 }
        );
      }

      const cleanBusinessName = nombreNegocio.trim();
      const existingBusinessName = await prisma.business.findFirst({
        where: {
          nombre: {
            equals: cleanBusinessName,
            mode: 'insensitive',
          },
        },
      });

      if (existingBusinessName) {
        return NextResponse.json(
          { error: `El nombre de emprendimiento "${cleanBusinessName}" ya se encuentra registrado. Por favor elige un nombre único para tu tienda.` },
          { status: 400 }
        );
      }
    }

    let userRole = 'CLIENTE';

    // Validación de Registro Exclusivo de Administrador
    if (rol === 'ADMIN') {
      const existingAdmin = await prisma.user.findFirst({
        where: { rol: 'ADMIN' },
      });

      if (existingAdmin && adminKey !== ADMIN_SECRET_KEY) {
        return NextResponse.json(
          {
            error:
              'Ya existe una cuenta de Administrador registrada en UniPide. Solo se permite un Administrador principal.',
          },
          { status: 403 }
        );
      }

      if (adminKey !== ADMIN_SECRET_KEY && adminKey !== 'admin123' && adminKey !== 'uninorte2026') {
        return NextResponse.json(
          { error: 'Clave de autorización de Administrador incorrecta' },
          { status: 403 }
        );
      }

      userRole = 'ADMIN';
    } else if (rol === 'EMPRENDEDOR') {
      userRole = 'EMPRENDEDOR';
    } else {
      userRole = 'CLIENTE';
    }

    // Encriptar contraseña
    const passwordHash = await hashPassword(password);

    // Generar código de 6 dígitos para verificación de correo
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear Usuario con correo institucional y correo personal para notificaciones
    const newUser = await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        correo: cleanEmail,
        correoPersonal: cleanPersonalEmail,
        passwordHash,
        rol: userRole,
        telefono: cleanPhone,
        twoFactorSecret: body.twoFactorSecret || null,
        twoFactorEnabled: Boolean(body.twoFactorSecret),
        correoVerificado: false,
        tokenVerificacionCorreo: emailVerificationCode,
      },
    });

    const targetDeliveryEmail = cleanPersonalEmail || cleanEmail;

    let primaryBusiness = null;

    // Si es Emprendedor, crear el Negocio inicial asociado con firma legal POL-EMP-001
    if (userRole === 'EMPRENDEDOR' && nombreNegocio) {
      const baseSlug = slugify(nombreNegocio);
      let uniqueSlug = baseSlug;
      let count = 1;

      while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }

      const founderCount = await prisma.business.count({
        where: { esFundador: true, estadoAprobacion: { in: ['APROBADO', 'PENDIENTE'] } },
      });
      const isFounder = founderCount < 10;
      const now = new Date();
      const threeMonths = new Date(now);
      threeMonths.setMonth(threeMonths.getMonth() + 3);

      const nombreFirmanteFinal = body.nombreFirmante?.trim() || nombre.trim();
      const documentoFirmanteFinal = rawCedula || body.documentoFirmante?.trim() || cleanPhone || 'CC No Especificada';

      // 1. Generar Documento Legal POL-EMP-001 en servidor
      const contractDoc = await generateDigitalContractDocument({
        nombreNegocio: nombreNegocio.trim(),
        nombreFirmante: nombreFirmanteFinal,
        documentoFirmante: documentoFirmanteFinal,
        correo: cleanEmail,
        fechaFirma: now,
      });

      // 2. Subir o sincronizar con Google Drive
      const driveResult = await uploadContractToGoogleDrive({
        filePath: contractDoc.filePath,
        fileName: contractDoc.fileName,
        nombreNegocio: nombreNegocio.trim(),
        documentoFirmante: documentoFirmanteFinal,
      });

      primaryBusiness = await prisma.business.create({
        data: {
          userId: newUser.id,
          nombre: nombreNegocio.trim(),
          slug: uniqueSlug,
          categoria: categoriaNegocio || 'Comida Rápida',
          descripcion: descripcionNegocio?.trim() || `Emprendimiento estudiantil de ${nombre}`,
          ubicacionCampus: ubicacionCampus?.trim() || 'Venta Móvil / Entrega en Campus',
          zonaCampusCodigo: zonaCampusCodigo || 'ZONA_EMPRENDIMIENTOS',
          tiempoBasePrepMin: 0,
          estadoAprobacion: 'PENDIENTE',
          activo: false,
          pagoVerificado: false,
          esFundador: isFounder,
          fechaAprobacion: null,
          fechaInicioPromocion: null,
          fechaFinPromocion: null,
          suscripcionMonto: isFounder ? 19900 : 29900,
          suscripcionEstado: 'PENDIENTE_PAGO',
          firmaPoliticaHigiene: true,
          fechaFirmaPolitica: now,
          versionPolitica: 'POL-EMP-001 v1.0',
          nombreFirmante: nombreFirmanteFinal,
          documentoFirmante: documentoFirmanteFinal,
          contratoDriveUrl: driveResult.driveUrl,
          contratoDriveId: driveResult.fileId,
        },
      });

      // Enviar correo formal: "Gracias por aceptar nuestros términos + Contrato POL-EMP-001"
      await sendContractAcceptedEmail({
        toEmail: targetDeliveryEmail,
        nombreEmprendedor: nombre.trim(),
        nombreNegocio: nombreNegocio.trim(),
        nombreFirmante: nombreFirmanteFinal,
        documentoFirmante: documentoFirmanteFinal,
        correoInstitucional: cleanEmail,
        contratoUrl: driveResult.driveUrl || 'https://unipide.com/emprendedor/suscripcion',
        businessId: primaryBusiness.id,
      });
    } else {
      // Para clientes regulares, enviar código de confirmación
      await sendEmailVerificationCode({
        toEmail: targetDeliveryEmail,
        nombre: nombre.trim(),
        code: emailVerificationCode,
        correoInstitucional: cleanEmail,
      });
    }

    const userSession = {
      id: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
      correoPersonal: newUser.correoPersonal,
      rol: newUser.rol as any,
      telefono: newUser.telefono,
      foto: newUser.foto,
      businessId: primaryBusiness?.id || null,
      businessSlug: primaryBusiness?.slug || null,
      businessName: primaryBusiness?.nombre || null,
    };

    const token = signJwtToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
      business: primaryBusiness,
    });

    // Establecer sesión
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el registro de usuario' },
      { status: 500 }
    );
  }
}
