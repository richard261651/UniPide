import React from 'react';
import { Clock, MapPin } from 'lucide-react';

interface DeliveryBadgeProps {
  tiempoMin?: number | string;
  ubicacion?: string;
  compact?: boolean;
}

export default function DeliveryBadge({ tiempoMin = '15-20 min', ubicacion, compact = false }: DeliveryBadgeProps) {
  const displayTime = typeof tiempoMin === 'number' ? `${tiempoMin} min` : tiempoMin;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Clock className="w-3 h-3 text-emerald-600" />
        <span>{displayTime}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
        <span>Entrega estimada: {displayTime}</span>
      </div>
      {ubicacion && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
          <MapPin className="w-3 h-3 text-gray-500" />
          <span className="line-clamp-1">{ubicacion}</span>
        </div>
      )}
    </div>
  );
}
