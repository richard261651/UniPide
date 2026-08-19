'use client';

import React, { useEffect, useState } from 'react';

export default function WelcomeSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Comprobar si ya se mostró la animación en esta sesión para evitar repeticiones molestas
    const hasSeenSplash = sessionStorage.getItem('unipide_splash_seen');
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Iniciar fade out a los 2.4 segundos
    const timerFade = setTimeout(() => {
      setFadeOut(true);
    }, 2400);

    // Ocultar por completo a los 2.8 segundos y guardar en sessionStorage
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F6F4] transition-opacity duration-500 overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="welcome-container flex flex-col sm:flex-row items-center gap-5 sm:gap-7 p-6 sm:p-10 bg-white border border-[#E5E2DC] rounded-3xl shadow-2xl max-w-[90vw] sm:max-w-xl mx-auto">
        {/* SVG Animado con trazado y colores corporativos */}
        <div className="icon-wrapper w-24 h-24 sm:w-28 sm:h-28 shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Trazado de la 'U' */}
            <path
              className="u-path"
              d="M 40 45 L 40 90 A 25 25 0 0 0 90 90 L 90 75"
              fill="none"
              stroke="#F56649"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Mástil vertical de la 'P' */}
            <line
              className="p-stem"
              x1="90"
              y1="20"
              x2="90"
              y2="125"
              stroke="#F56649"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Bucle superior de la 'P' */}
            <path
              className="p-loop"
              d="M 90 20 C 125 20, 125 72, 90 72"
              fill="none"
              stroke="#F56649"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Pin Dot / Punto de destino */}
            <circle className="pin-dot" cx="90" cy="46" r="4.5" fill="#F56649" />
          </svg>
        </div>

        {/* Tipografía y Slogan con entrada fluida */}
        <div className="brand-content flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
          <h1 className="brand-title text-4xl sm:text-5xl font-black tracking-tight leading-none">
            <span className="text-[#1F222E]">uni</span>
            <span className="text-[#F56649]">pide</span>
          </h1>
          <p className="brand-tagline text-[11px] sm:text-xs font-bold tracking-wider text-gray-500 uppercase mt-2">
            Lo de tu campus, a un pedido de distancia
          </p>
        </div>
      </div>
    </div>
  );
}
