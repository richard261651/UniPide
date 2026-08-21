'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  ShoppingBag,
  Package,
  Truck,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Clock,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leido: boolean;
  url?: string | null;
  fechaCreacion: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling cada 15 segs
    return () => clearInterval(interval);
  }, [user]);

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error al marcar notificaciones:', err);
    }
  };

  const markAsRead = async (n: NotificationItem) => {
    if (n.leido) return;
    try {
      await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, leido: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.leido) : notifications;

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'NUEVO_PEDIDO':
        return <ShoppingBag className="w-4 h-4 text-[#D85A30]" />;
      case 'PAGO_CONFIRMADO':
      case 'APROBACION_NEGOCIO':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'ESTADO_PEDIDO':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'PQRS':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Campana con Insignia de No Leídos */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer flex items-center justify-center"
        title="Notificaciones de UniPide"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#D85A30] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover / Panel de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Encabezado */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D85A30]" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
                Notificaciones {unreadCount > 0 && `(${unreadCount} sin leer)`}
              </h3>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 font-bold text-center transition ${
                filter === 'all'
                  ? 'text-[#D85A30] border-b-2 border-[#D85A30] bg-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 font-bold text-center transition ${
                filter === 'unread'
                  ? 'text-[#D85A30] border-b-2 border-[#D85A30] bg-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sin Leer ({unreadCount})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No tienes notificaciones en esta lista.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !n.leido ? 'bg-amber-50/40 border-l-4 border-l-[#D85A30]' : 'opacity-85'
                  }`}
                >
                  <div className="p-2 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                    {getIconForType(n.tipo)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {n.titulo}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatRelativeTime(n.fechaCreacion)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                      {n.mensaje}
                    </p>

                    {n.url && (
                      <Link
                        href={n.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D85A30] hover:underline pt-0.5"
                      >
                        <span>Ver detalles</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
