import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

// GET /api/favorites - Devuelve los productos favoritos del usuario
export async function GET(request: NextRequest) {
 try {
 const session = getSessionFromRequest(request);

 if (!session) {
 return NextResponse.json({ favorites: [], favoriteProductIds: [] });
 }

 const favorites = await prisma.favorite.findMany({
 where: { userId: session.id },
 include: {
 product: {
 include: {
 business: {
 select: {
 id: true,
 nombre: true,
 slug: true,
 logo: true,
 categoria: true,
 ubicacionCampus: true,
 },
 },
 },
 },
 },
 orderBy: { fechaCreacion: 'desc' },
 });

 const favoriteProductIds = favorites.map((f) => f.productId);
 const favoriteProducts = favorites.map((f) => f.product).filter(Boolean);

 return NextResponse.json({
 success: true,
 favoriteProductIds,
 products: favoriteProducts,
 });
 } catch (error: any) {
 console.error('Error al obtener favoritos:', error);
 return NextResponse.json(
 { error: error.message || 'Error al obtener lista de favoritos' },
 { status: 500 }
 );
 }
}

// POST /api/favorites - Alternar (toggle) un producto como favorito
export async function POST(request: NextRequest) {
 try {
 const session = getSessionFromRequest(request);

 if (!session) {
 return NextResponse.json(
 { error: 'Debes iniciar sesión para guardar favoritos' },
 { status: 401 }
 );
 }

 const body = await request.json();
 const { productId } = body;

 if (!productId) {
 return NextResponse.json(
 { error: 'El ID del producto es obligatorio' },
 { status: 400 }
 );
 }

 // Verificar si ya existe en favoritos
 const existing = await prisma.favorite.findUnique({
 where: {
 userId_productId: {
 userId: session.id,
 productId,
 },
 },
 });

 if (existing) {
 // Eliminar de favoritos
 await prisma.favorite.delete({
 where: { id: existing.id },
 });

 return NextResponse.json({
 success: true,
 isFavorite: false,
 message: 'Producto eliminado de tus favoritos',
 });
 } else {
 // Agregar a favoritos
 await prisma.favorite.create({
 data: {
 userId: session.id,
 productId,
 },
 });

 return NextResponse.json({
 success: true,
 isFavorite: true,
 message: 'Producto añadido a tus favoritos ',
 });
 }
 } catch (error: any) {
 console.error('Error al modificar favorito:', error);
 return NextResponse.json(
 { error: error.message || 'Error al procesar favorito' },
 { status: 500 }
 );
 }
}
