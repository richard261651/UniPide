'use client';

import React from 'react';
import { OrderStatus } from '@/types';
import { CheckCircle2, Clock, ChefHat, Bike, PackageCheck, XCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  tiempoEstimadoMin?: number;
}

export default function OrderStatusTracker({ status, tiempoEstimadoMin }: OrderStatusTrackerProps) {
  const steps = [
    {
      key: 'RECIBIDO',
      title: 'Recibido',
      description: 'El negocio ha recibido tu pedido',
      icon: Clock,
    },
    {
      key: 'EN_PREPARACION',
      title: 'En Preparación',
      description: 'Cocinando o alistando tus productos',
      icon: ChefHat,
    },
    {
      key: 'EN_CAMINO',
      title: 'En Camino',
      description: 'Desplazándose hacia tu ubicación en campus',
      icon: Bike,
    },
    {
      key: 'ENTREGADO',
      title: 'Entregado',
      description: '¡Pedido entregado con éxito!',
      icon: PackageCheck,
    },
  ];

  if (status === 'CANCELADO') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-red-900 text-sm">Pedido Cancelado</h4>
        <p className="text-xs text-red-600 mt-1">
          Este pedido fue cancelado. Si tienes dudas, contáctate con el emprendedor.
        </p>
      </div>
    );
  }

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'RECIBIDO':
        return 0;
      case 'EN_PREPARACION':
        return 1;
      case 'EN_CAMINO':
        return 2;
      case 'ENTREGADO':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
      {/* Encabezado con estado actual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-uninorte-red">
            Estado de entrega
          </span>
          <h3 className="text-lg font-black text-gray-900 mt-0.5">
            {steps[currentIndex].title}
          </h3>
          <p className="text-xs text-gray-500">{steps[currentIndex].description}</p>
        </div>

        {tiempoEstimadoMin && status !== 'ENTREGADO' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
              Tiempo estimado total
            </span>
            <span className="text-base font-black text-emerald-700">
              ~{tiempoEstimadoMin} minutos
            </span>
          </div>
        )}
      </div>

      {/* Stepper visual */}
      <div className="grid grid-cols-4 relative gap-2">
        {/* Barra de progreso de fondo */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-gray-100 -z-0" />
        <div
          className="absolute top-5 left-6 h-1 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / 3) * 85}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-uninorte-red text-white ring-4 ring-red-100 shadow-md animate-pulse-subtle'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-2 text-[11px] font-bold line-clamp-1 ${
                  isCurrent
                    ? 'text-uninorte-red'
                    : isCompleted
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
