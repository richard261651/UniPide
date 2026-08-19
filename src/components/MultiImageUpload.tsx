'use client';

import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Star, RefreshCw, AlertCircle, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  images = [],
  onChange,
  label = 'Carrusel de Fotos del Producto',
  maxImages = 6,
}: MultiImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10 MB');
      return;
    }

    if (images.length >= maxImages) {
      setError(`Puedes agregar un máximo de ${maxImages} fotos por producto`);
      return;
    }

    setProcessing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange([...images, compressedDataUrl]);
        } else {
          onChange([...images, e.target?.result as string]);
        }
        setProcessing(false);
      };
      img.onerror = () => {
        setError('Error al procesar la imagen');
        setProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} fotos permitidas`);
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, i) => i !== index);
    onChange([selected, ...remaining]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-gray-800">{label}</label>
          <p className="text-[10px] text-gray-400">
            Añade hasta {maxImages} fotos. La primera foto será la carátula principal.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-lg transition font-semibold ${
              mode === 'upload' ? 'bg-uninorte-red text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-lg transition font-semibold ${
              mode === 'url' ? 'bg-uninorte-red text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de imágenes existentes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`relative group aspect-square rounded-2xl overflow-hidden border bg-gray-100 shadow-2xs ${
              idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-200'
            }`}
          >
            <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

            {/* Badge de Foto Principal */}
            {idx === 0 ? (
              <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 z-10">
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>Principal</span>
              </span>
            ) : (
              <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                #{idx + 1}
              </span>
            )}

            {/* Acciones al hacer Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition backdrop-blur-2xs flex items-center justify-center gap-1.5">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleMakeMain(idx)}
                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                  title="Hacer Foto Principal"
                >
                  <Star className="w-3 h-3 fill-white" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                title="Eliminar esta foto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Botón para agregar más fotos si no supera maxImages */}
        {images.length < maxImages && (
          <div className="aspect-square">
            {mode === 'upload' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="w-full h-full border-2 border-dashed border-gray-200 hover:border-uninorte-red hover:bg-red-50/20 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-uninorte-red transition gap-1 cursor-pointer p-2"
              >
                {processing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span className="text-[10px] font-bold text-center leading-tight">
                  {processing ? 'Procesando...' : 'Añadir Foto'}
                </span>
              </button>
            ) : (
              <div className="w-full h-full border border-gray-200 rounded-2xl p-2 flex flex-col justify-center bg-gray-50">
                <form onSubmit={handleAddUrl} className="space-y-1.5">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="URL imagen..."
                    className="w-full text-[10px] p-1.5 rounded-lg border border-gray-200 bg-white outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-1 bg-uninorte-red text-white text-[10px] font-bold rounded-lg hover:bg-uninorte-darkRed transition"
                  >
                    Agregar
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
