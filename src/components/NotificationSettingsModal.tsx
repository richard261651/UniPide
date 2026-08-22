'use client';

import React, { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Send,
  X,
  Shield,
  MessageSquare,
  Package,
  Store,
  Sparkles,
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    preferences,
    subscribeToPush,
    unsubscribeFromPush,
    updatePreferences,
    sendTestNotification,
  } = usePushNotifications();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [toggleLoading, setToggleLoading] = useState(false);

  if (!isOpen) return null;

  const handleMasterToggle = async () => {
    setToggleLoading(true);
    setTestResult(null);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        const res = await subscribeToPush();
        if (!res.success && res.error) {
          setTestResult({ type: 'error', message: res.error });
        }
      }
    } finally {
      setToggleLoading(false);
    }
  };

  const handleCategoryToggle = async (key: 'notifPedidos' | 'notifChat' | 'notifAdmin') => {
    const currentVal = preferences[key];
    await updatePreferences({ [key]: !currentVal });
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await sendTestNotification();
      if (res.success) {
        setTestResult({
          type: 'success',
          message: '¡Notificación enviada! Deberías verla en la pantalla de tu dispositivo.',
        });
      } else {
        setTestResult({
          type: 'error',
          message: res.message || 'No se pudo enviar la notificación de prueba.',
        });
      }
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: err?.message || 'Error al enviar prueba.',
      });
    } finally {
      setTesting(false);
    }
  };

  const isEntrepreneur = user?.rol === 'EMPRENDEDOR' || Boolean(user?.businessId);
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 text-xs animate-in zoom-in-95">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-uninorte-red rounded-2xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">
                Configuración de Notificaciones Push
              </h3>
              <p className="text-gray-500 text-[11px]">
                Activa o desactiva alertas en tu PC o teléfono móvil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advertencia si el navegador no soporta Push */}
        {!isSupported && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Este navegador no es compatible con la API de Notificaciones Web Push. Te sugerimos
              usar Google Chrome, Edge, Firefox o instalar la app en tu teléfono (PWA).
            </p>
          </div>
        )}

        {/* Master Switch: Activar/Desactivar Notificaciones en este Dispositivo */}
        <div className="bg-gradient-to-br from-gray-50 to-red-50/40 border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-black text-gray-900 text-xs">
              <Smartphone className="w-4 h-4 text-uninorte-red" />
              <span>Notificaciones en este Dispositivo</span>
            </div>
            <p className="text-gray-500 text-[11px]">
              {isSubscribed
                ? 'Recibiendo alertas instantáneas de pedidos y mensajes'
                : 'Notificaciones desactivadas en este navegador'}
            </p>
          </div>

          <button
            onClick={handleMasterToggle}
            disabled={toggleLoading || !isSupported}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSubscribed ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isSubscribed ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Estado del Permiso en el Navegador */}
        <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">
          <span>Permiso en navegador:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              permission === 'granted'
                ? 'bg-emerald-50 text-emerald-700'
                : permission === 'denied'
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {permission === 'granted'
              ? 'Permitido'
              : permission === 'denied'
              ? 'Bloqueado por el navegador'
              : 'Pendiente de solicitud'}
          </span>
        </div>

        {/* Preferencias Específicas por Categoría */}
        <div className="space-y-2.5 pt-1">
          <span className="font-extrabold text-gray-800 text-[11px] uppercase tracking-wider block">
            Tipos de Notificaciones
          </span>

          {/* 1. Pedidos */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-uninorte-red" />
              <div>
                <p className="font-bold text-gray-800 text-xs">Actualizaciones de Pedidos</p>
                <p className="text-[10px] text-gray-500">
                  Mensajes divertidos y estado en vivo de tus compras
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifPedidos}
              onChange={() => handleCategoryToggle('notifPedidos')}
              className="w-4 h-4 text-uninorte-red rounded accent-uninorte-red cursor-pointer"
            />
          </div>

          {/* 2. Chat */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-bold text-gray-800 text-xs">Mensajes de Chat en Vivo</p>
                <p className="text-[10px] text-gray-500">
                  Cuando te escriban sobre un pedido en camino
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifChat}
              onChange={() => handleCategoryToggle('notifChat')}
              className="w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 3. Alertas de Emprendedor / Admin */}
          {(isEntrepreneur || isAdmin) && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition">
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-purple-600" />
                ) : (
                  <Store className="w-4 h-4 text-amber-600" />
                )}
                <div>
                  <p className="font-bold text-gray-800 text-xs">
                    {isAdmin ? 'PQRS y Nuevos Negocios' : 'Nuevas Ventas y Pedidos'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {isAdmin
                      ? 'Alertas de administración y solicitudes'
                      : 'Aviso inmediato cuando entra un pedido'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifAdmin}
                onChange={() => handleCategoryToggle('notifAdmin')}
                className="w-4 h-4 text-purple-600 rounded accent-purple-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Feedback de Prueba */}
        {testResult && (
          <div
            className={`p-3 rounded-2xl flex items-start gap-2 text-xs ${
              testResult.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <p>{testResult.message}</p>
          </div>
        )}

        {/* Botón de Prueba */}
        <div className="pt-2 border-t border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Listo
          </button>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || !isSupported}
            className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Probando...' : 'Probar Notificación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
