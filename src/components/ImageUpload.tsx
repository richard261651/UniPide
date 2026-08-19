'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Check, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'banner';
  placeholderText?: string;
  suggestions?: string[];
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Imagen',
  aspectRatio = 'square',
  placeholderText = 'Arrastra una imagen o selecciona un archivo',
  suggestions = [],
}: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Procesar archivo local comprimiéndolo a DataURL (Base64)
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10 MB');
      return;
    }

    setProcessing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar e imágenes pesadas usando Canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = aspectRatio === 'banner' ? 1200 : 800;

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
          onChange(compressedDataUrl);
        } else {
          onChange(e.target?.result as string);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">{label}</label>
        <div className="flex items-center gap-1.5 text-[11px]">
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
            Enlace URL
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Si YA tiene una imagen seleccionada: Muestra la vista previa con opciones de borrar / reemplazar */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-900">
          <img
            src={value}
            alt={label}
            className={`w-full object-cover transition duration-300 ${
              aspectRatio === 'banner' ? 'h-36 sm:h-44' : 'h-40 sm:h-48'
            }`}
          />

          {/* Superposición con opciones de borrar o cambiar */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-uninorte-red" />
              <span>Cambiar Foto</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Si NO tiene imagen: Muestra la zona de carga o URL */
        <div className="space-y-3">
          {mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-uninorte-red bg-red-50/50 scale-[1.01]'
                  : 'border-gray-200 hover:border-uninorte-red hover:bg-red-50/20'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-uninorte-red flex items-center justify-center shadow-2xs">
                {processing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  {processing ? 'Optimizando imagen...' : placeholderText}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Haz clic para examinar o arrastra un archivo JPG, PNG, WEBP
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-uninorte-red text-white text-xs font-bold rounded-xl hover:bg-uninorte-darkRed transition shrink-0"
              >
                Usar URL
              </button>
            </form>
          )}

          {/* Sugerencias de imágenes predeterminadas (si aplican) */}
          {suggestions.length > 0 && (
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>O elige una foto sugerida:</span>
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(sug)}
                    className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 hover:border-uninorte-red transition shrink-0 group relative"
                  >
                    <img src={sug} alt="Sugerencia" className="w-full h-full object-cover group-hover:scale-110 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
