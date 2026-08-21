'use client';

import React, { useEffect, useState } from 'react';
import { formatShortDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
 Users,
 Search,
 Trash2,
 Shield,
 UserCheck,
 UserX,
 Store,
 Mail,
 Phone,
 Calendar,
 ShoppingBag,
 AlertTriangle,
 Loader2,
 Power,
 ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface AdminUserItem {
 id: string;
 nombre: string;
 correo: string;
 rol: 'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN';
 telefono: string | null;
 foto: string | null;
 activo: boolean;
 fechaRegistro: string;
 businesses?: {
 id: string;
 nombre: string;
 slug: string;
 categoria: string;
 estadoAprobacion: string;
 activo: boolean;
 }[];
 _count?: {
 orders: number;
 ratings: number;
 };
}

export default function AdminUsuariosPage() {
 const { user: currentAdmin } = useAuth();
 const [users, setUsers] = useState<AdminUserItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [roleFilter, setRoleFilter] = useState('TODOS');
 const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

 // Modal para eliminar usuario
 const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

 const fetchUsers = async () => {
 try {
 setLoading(true);
 const res = await fetch(`/api/users?rol=${encodeURIComponent(roleFilter)}&q=${encodeURIComponent(search)}`);
 if (res.ok) {
 const data = await res.json();
 setUsers(data.users || []);
 }
 } catch (err) {
 console.error('Error cargando usuarios:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers();
 }, [roleFilter, search]);

 const handleToggleActivo = async (u: AdminUserItem) => {
 if (u.id === currentAdmin?.id) {
 setFeedbackMsg({ type: 'error', text: 'No puedes desactivar tu propia cuenta de administrador.' });
 return;
 }

 try {
 setActionLoadingId(u.id);
 const res = await fetch(`/api/users/${u.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ activo: !u.activo }),
 });

 if (res.ok) {
 setFeedbackMsg({
 type: 'success',
 text: `Cuenta de "${u.nombre}" ${!u.activo ? 'activada' : 'suspendida'} exitosamente.`,
 });
 fetchUsers();
 } else {
 const data = await res.json();
 setFeedbackMsg({ type: 'error', text: data.error || 'Error al actualizar cuenta' });
 }
 } catch (err) {
 console.error('Error actualizando cuenta:', err);
 } finally {
 setActionLoadingId(null);
 }
 };

 const handleChangeRole = async (u: AdminUserItem, nuevoRol: string) => {
 if (u.id === currentAdmin?.id && nuevoRol !== 'ADMIN') {
 setFeedbackMsg({ type: 'error', text: 'No puedes degradar tu propio rol de administrador.' });
 return;
 }

 try {
 setActionLoadingId(u.id);
 const res = await fetch(`/api/users/${u.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ rol: nuevoRol }),
 });

 if (res.ok) {
 setFeedbackMsg({
 type: 'success',
 text: `Rol de "${u.nombre}" cambiado a ${nuevoRol}.`,
 });
 fetchUsers();
 } else {
 const data = await res.json();
 setFeedbackMsg({ type: 'error', text: data.error || 'Error al cambiar rol' });
 }
 } catch (err) {
 console.error('Error cambiando rol:', err);
 } finally {
 setActionLoadingId(null);
 }
 };

 const confirmDeleteUser = async () => {
 if (!deletingUser) return;

 try {
 setIsDeleting(true);
 const res = await fetch(`/api/users/${deletingUser.id}`, {
 method: 'DELETE',
 });

 if (res.ok) {
 setFeedbackMsg({
 type: 'success',
 text: `La cuenta de "${deletingUser.nombre}" ha sido eliminada permanentemente.`,
 });
 setDeletingUser(null);
 fetchUsers();
 } else {
 const data = await res.json();
 setFeedbackMsg({ type: 'error', text: data.error || 'Error al eliminar usuario' });
 }
 } catch (err) {
 console.error('Error eliminando usuario:', err);
 setFeedbackMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
 <Users className="w-5 h-5 text-uninorte-red" />
 <span>Gestión y Eliminación de Cuentas de Usuario</span>
 </h2>
 <p className="text-xs text-gray-500">
 Administra los roles, acceso, suspensión y eliminación definitiva de usuarios en UniPide
 </p>
 </div>

 <div className="flex flex-col sm:flex-row items-center gap-2">
 {/* Filtro de Rol */}
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="w-full sm:w-auto text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none font-medium text-gray-700"
 >
 <option value="TODOS">Todos los Roles</option>
 <option value="CLIENTE">Solo Clientes</option>
 <option value="EMPRENDEDOR">Solo Emprendedores</option>
 <option value="ADMIN">Solo Administradores</option>
 </select>

 {/* Buscador */}
 <div className="w-full sm:w-64 relative">
 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar por nombre, correo..."
 className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none font-medium"
 />
 </div>
 </div>
 </div>

 {/* Alerta de Feedback */}
 {feedbackMsg && (
 <div
 className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
 feedbackMsg.type === 'success'
 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
 : 'bg-red-50 text-red-800 border border-red-200'
 }`}
 >
 <span>{feedbackMsg.text}</span>
 <button
 onClick={() => setFeedbackMsg(null)}
 className="text-xs font-bold px-2 hover:opacity-70"
 >
 
 </button>
 </div>
 )}

 {/* Tabla de Usuarios */}
 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((n) => (
 <div key={n} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-600">
 <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
 <tr>
 <th className="p-4">Usuario</th>
 <th className="p-4">Contacto</th>
 <th className="p-4">Rol en Plataforma</th>
 <th className="p-4">Emprendimiento Vinculado</th>
 <th className="p-4">Estado</th>
 <th className="p-4 text-right">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {users.map((u) => {
 const isSelf = u.id === currentAdmin?.id;
 const hasBusiness = u.businesses && u.businesses.length > 0;

 return (
 <tr key={u.id} className="hover:bg-gray-50/70 transition">
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-red-100 text-uninorte-red flex items-center justify-center font-black text-sm shrink-0 overflow-hidden border border-red-200">
 {u.foto ? (
 <img src={u.foto} alt={u.nombre} className="w-full h-full object-cover" />
 ) : (
 u.nombre.charAt(0)
 )}
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <p className="font-bold text-gray-900">{u.nombre}</p>
 {isSelf && (
 <span className="text-[9px] font-black bg-uninorte-red text-white px-1.5 py-0.2 rounded-full">
 TÚ
 </span>
 )}
 </div>
 <span className="text-[10px] text-gray-400">
 Registro: {formatShortDate(u.fechaRegistro)}
 </span>
 </div>
 </div>
 </td>

 <td className="p-4">
 <div className="space-y-0.5 text-[11px]">
 <p className="text-gray-800 flex items-center gap-1">
 <Mail className="w-3.5 h-3.5 text-gray-400" />
 <span>{u.correo}</span>
 </p>
 {u.telefono && (
 <p className="text-gray-500 flex items-center gap-1 text-[10px]">
 <Phone className="w-3 h-3 text-gray-400" />
 <span>{u.telefono}</span>
 </p>
 )}
 </div>
 </td>

 <td className="p-4">
 <select
 value={u.rol}
 onChange={(e) => handleChangeRole(u, e.target.value)}
 disabled={actionLoadingId === u.id || isSelf}
 className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition outline-none cursor-pointer ${
 u.rol === 'ADMIN'
 ? 'bg-red-50 text-red-900 border-red-300'
 : u.rol === 'EMPRENDEDOR'
 ? 'bg-amber-50 text-amber-900 border-amber-300'
 : 'bg-blue-50 text-blue-900 border-blue-300'
 }`}
 >
 <option value="CLIENTE">CLIENTE</option>
 <option value="EMPRENDEDOR">EMPRENDEDOR</option>
 <option value="ADMIN">ADMIN</option>
 </select>
 </td>

 <td className="p-4">
 {hasBusiness ? (
 <div className="space-y-0.5">
 <p className="font-bold text-gray-900 flex items-center gap-1">
 <Store className="w-3.5 h-3.5 text-amber-600" />
 <span>{u.businesses![0].nombre}</span>
 </p>
 <span className="text-[10px] text-gray-400">
 {u.businesses![0].categoria} ({u.businesses![0].estadoAprobacion})
 </span>
 </div>
 ) : (
 <span className="text-gray-400 text-[11px] italic">Ninguno</span>
 )}
 </td>

 <td className="p-4">
 <button
 onClick={() => handleToggleActivo(u)}
 disabled={actionLoadingId === u.id || isSelf}
 className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
 u.activo
 ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
 : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
 }`}
 title={isSelf ? 'Tu cuenta principal' : 'Clic para activar o suspender'}
 >
 <Power className="w-3 h-3" />
 <span>{u.activo ? 'Activa' : 'Suspendida'}</span>
 </button>
 </td>

 <td className="p-4 text-right">
 {!isSelf ? (
 <button
 onClick={() => setDeletingUser(u)}
 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
 title="Eliminar cuenta definitivamente"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 ) : (
 <span className="text-[10px] font-bold text-gray-400 italic px-2">
 Admin Principal
 </span>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 {users.length === 0 && (
 <div className="p-12 text-center text-xs text-gray-400">
 No se encontraron cuentas de usuario con los criterios de búsqueda
 </div>
 )}
 </div>
 </div>
 )}

 {/* Modal de Confirmación para Eliminar Usuario */}
 {deletingUser && (
 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95">
 <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
 <ShieldAlert className="w-6 h-6" />
 </div>

 <div className="text-center space-y-2">
 <h3 className="text-lg font-black text-gray-900">
 ¿Eliminar permanentemente esta cuenta?
 </h3>
 <p className="text-xs text-gray-500">
 Estás a punto de borrar la cuenta de{' '}
 <span className="font-bold text-gray-800">"{deletingUser.nombre}"</span> ({deletingUser.correo}).
 </p>
 </div>

 <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-[11px] text-red-800 font-medium space-y-1">
 <p> <strong>Atención:</strong></p>
 <p>• Se eliminará su acceso y credenciales de UniPide.</p>
 {deletingUser.businesses && deletingUser.businesses.length > 0 && (
 <p>• Su emprendimiento <strong>"{deletingUser.businesses[0].nombre}"</strong> y productos también serán eliminados.</p>
 )}
 </div>

 <div className="flex items-center gap-3 pt-2">
 <button
 type="button"
 onClick={() => setDeletingUser(null)}
 disabled={isDeleting}
 className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
 >
 Cancelar
 </button>
 <button
 type="button"
 onClick={confirmDeleteUser}
 disabled={isDeleting}
 className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
 >
 {isDeleting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Eliminando...</span>
 </>
 ) : (
 <>
 <Trash2 className="w-4 h-4" />
 <span>Sí, Eliminar Cuenta</span>
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
