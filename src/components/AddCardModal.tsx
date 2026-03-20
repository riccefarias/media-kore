"use client";

import { useState } from "react";

const ANGULOS = [
  "educativo",
  "autoridade",
  "prova_social",
  "curiosidade",
  "dor",
  "tendencia",
  "bastidores",
];

const VERTICAIS = [
  "Marketing digital",
  "Desenvolvimento web e sistemas",
  "Rastreamento GPS de frotas",
  "Segurança eletrônica",
  "Consultoria em TI",
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddCardModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    titulo: "",
    formato: "foto",
    angulo: "educativo",
    vertical: "Marketing digital",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-bold text-white">Nova ideia — Backlog</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-white/50">Título</label>
            <input
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Ex: 3 erros que todo dono de negócio comete no tráfego pago"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">Formato</label>
              <select
                value={form.formato}
                onChange={(e) => setForm({ ...form, formato: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="foto">Foto</option>
                <option value="carrossel">Carrossel</option>
                <option value="video">Vídeo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Ângulo</label>
              <select
                value={form.angulo}
                onChange={(e) => setForm({ ...form, angulo: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                {ANGULOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Vertical</label>
            <select
              value={form.vertical}
              onChange={(e) => setForm({ ...form, vertical: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            >
              {VERTICAIS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">
              Descrição <span className="text-white/30">(opcional)</span>
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 resize-none"
              placeholder="Contexto extra para o agente expandir..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
