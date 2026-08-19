'use client';

import React, { useEffect, useState } from 'react';

export default function WelcomeSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Evitar repetición constante en la misma sesión
    const hasSeenSplash = sessionStorage.getItem('unipide_splash_seen');
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Iniciar fade-out suave a los 2.2s (2200ms)
    const timerFade = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    // Ocultar por completo a los 2.8s (2800ms)
    const timerHide = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('unipide_splash_seen', 'true');
    }, 2800);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerHide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F6F4] transition-opacity duration-600 overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-white border border-[#E5E2DC] rounded-3xl shadow-2xl max-w-[90vw] sm:max-w-md mx-auto transform transition duration-300">
        {/* Favicon Logo con animación de bote / spring */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 splash-logo">
          <img
            src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
            alt="UniPide Favicon Logo"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Tipografía y Slogan con deslizamiento fluido */}
        <div className="brand-content flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
          <h1 className="brand-title text-3xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-[#1F222E]">uni</span>
            <span className="text-[#F56649]">pide</span>
          </h1>
          <p className="brand-tagline text-[10px] sm:text-xs font-bold tracking-wider text-slate-500 uppercase mt-2">
            Lo de tu campus, a un pedido de distancia
          </p>
        </div>
      </div>
    </div>
  );
}
