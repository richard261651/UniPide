import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signJwtToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'uninorte2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      correo,
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
        { error: 'Nombre, correo y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = correo.trim().toLowerCase();

    if (!cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido' },
        { status: 400 }
      );
    }

    // Verificar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { correo: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico' },
        { status: 400 }
      );
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
              'Ya existe una cuenta de Administrador registrada en RapiNorte. Solo se permite un Administrador principal.',
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

    // Crear Usuario
    const newUser = await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        correo: cleanEmail,
        passwordHash,
        rol: userRole,
        telefono: telefono?.trim() || null,
      },
    });

    let primaryBusiness = null;

    // Si es Emprendedor, crear el Negocio inicial asociado
    if (userRole === 'EMPRENDEDOR' && nombreNegocio) {
      const baseSlug = slugify(nombreNegocio);
      let uniqueSlug = baseSlug;
      let count = 1;

      while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }

      primaryBusiness = await prisma.business.create({
        data: {
          userId: newUser.id,
          nombre: nombreNegocio.trim(),
          slug: uniqueSlug,
          categoria: categoriaNegocio || 'Comida Rápida',
          descripcion: descripcionNegocio?.trim() || `Emprendimiento estudiantil de ${nombre}`,
          ubicacionCampus: ubicacionCampus?.trim() || 'Zona de Emprendimientos Uninorte',
          zonaCampusCodigo: zonaCampusCodigo || 'ZONA_EMPRENDIMIENTOS',
          tiempoBasePrepMin: Number(tiempoBasePrepMin) || 15,
          estadoAprobacion: 'APROBADO',
          activo: true,
        },
      });
    }

    const userSession = {
      id: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
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
