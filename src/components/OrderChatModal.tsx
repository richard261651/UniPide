'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatShortDate } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  ShieldCheck,
  User,
  Store,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  orderId: string;
  remitenteId: string;
  rolRemitente: 'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN';
  mensaje: string;
  fechaCreacion: string | Date;
  remitente?: {
    id: string;
    nombre: string;
    foto?: string | null;
  };
}

interface OrderChatModalProps {
  orderId: string;
  codigoPedido: string;
  businessNombre?: string;
  isOpen: boolean;
  onClose: () => void;
  isAdminAuditor?: boolean;
}

export default function OrderChatModal({
  orderId,
  codigoPedido,
  businessNombre = 'Emprendimiento',
  isOpen,
  onClose,
  isAdminAuditor = false,
}: OrderChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`/api/orders/${orderId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(false), 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      setSending(true);
      setError('');
      const res = await fetch(`/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: nuevoMensaje }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error enviando mensaje');
      }

      setNuevoMensaje('');
      fetchMessages(false);
    } catch (err: any) {
      setError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Cabecera del Chat */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-amber-400 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Chat de Pedido {codigoPedido}</h3>
                {isAdminAuditor && (
                  <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Auditor Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">{businessNombre}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Permanente de Seguridad */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] flex items-start gap-2.5 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <span className="font-bold">Aviso de Seguridad:</span> Por favor no compartas información sensible como claves bancarias o datos personales confidenciales. Este chat es auditado.
          </p>
        </div>

        {/* Cuerpo del Chat / Mensajes */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50 min-h-[250px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2 py-12">
              <Loader2 className="w-5 h-5 animate-spin text-uninorte-red" />
              <span>Cargando chat en vivo...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-30 mx-auto" />
              <p className="text-xs font-semibold">Aún no hay mensajes en este pedido</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Escribe un mensaje para coordinar la entrega o consultar el estado de tu orden.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.remitenteId === user?.id;
              const isAdmin = msg.rolRemitente === 'ADMIN';
              const isEntrepreneur = msg.rolRemitente === 'EMPRENDEDOR';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-500 font-semibold px-1">
                    <span>{msg.remitente?.nombre || 'Usuario'}</span>
                    <span>•</span>
                    <span className={isAdmin ? 'text-purple-600 font-bold' : isEntrepreneur ? 'text-amber-700 font-bold' : 'text-blue-600 font-bold'}>
                      {isAdmin ? 'Admin' : isEntrepreneur ? 'Vendedor' : 'Cliente'}
                    </span>
                  </div>

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-uninorte-red text-white rounded-br-xs'
                        : isAdmin
                        ? 'bg-purple-900 text-white rounded-bl-xs'
                        : isEntrepreneur
                        ? 'bg-amber-100 text-amber-950 border border-amber-200 rounded-bl-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.mensaje}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 opacity-70 ${
                        isMe || isAdmin ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {new Date(msg.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar de Envío */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder={
              isAdminAuditor
                ? 'Escribe un mensaje como Administrador...'
                : 'Escribe un mensaje seguro...'
            }
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-slate-50"
          />

          <button
            type="submit"
            disabled={sending || !nuevoMensaje.trim()}
            className="p-2.5 bg-uninorte-red hover:bg-uninorte-darkRed disabled:opacity-50 text-white rounded-xl shadow-xs transition shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
