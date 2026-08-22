'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, X, Sparkles } from 'lucide-react';
import NotificationSettingsModal from './NotificationSettingsModal';

export default function PushPromptBanner() {
  const { user } = useAuth();
  const { isSupported, permission, isSubscribed, subscribeToPush, loading } =
    usePushNotifications();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [subscribing, setSubscribing] = useState<boolean>(false);

  useEffect(() => {
    // Comprobar si el usuario descartó el banner en esta sesión
    const isDismissed = sessionStorage.getItem('unipide_push_prompt_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!user || !isSupported || isSubscribed || permission === 'denied' || dismissed || loading) {
    return (
      <NotificationSettingsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    );
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('unipide_push_prompt_dismissed', 'true');
  };

  const handleQuickEnable = async () => {
    setSubscribing(true);
    try {
      const res = await subscribeToPush();
      if (!res.success) {
        setModalOpen(true);
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-slate-800 flex items-start gap-3.5 animate-in slide-in-from-bottom-5">
        <div className="p-2.5 bg-[#D85A30] text-white rounded-2xl shrink-0 mt-0.5 shadow-md">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 space-y-1.5 min-w-0 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <span>¿Quieres saber cuándo llegue tu comida?</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h4>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              title="Descartar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Activa las notificaciones para enterarte en vivo cuando tu pedido cambie de estado o te
            escriban en el chat.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleQuickEnable}
              disabled={subscribing}
              className="px-3.5 py-1.5 bg-[#D85A30] hover:bg-[#b54620] text-white font-bold rounded-xl shadow-xs transition"
            >
              {subscribing ? 'Activando...' : 'Activar Notificaciones'}
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 text-slate-300 hover:text-white font-semibold transition"
            >
              Personalizar
            </button>
          </div>
        </div>
      </div>

      <NotificationSettingsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
