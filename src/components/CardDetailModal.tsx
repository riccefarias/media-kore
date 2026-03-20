"use client";

import { Post } from "@/lib/types";

interface Props {
  post: Post;
  onClose: () => void;
  onDeleted: () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
      {children}
    </span>
  );
}

function Prompt({ children }: { children: string }) {
  return (
    <p className="mt-1 rounded bg-white/5 px-2.5 py-2 text-[11px] text-white/40 font-mono leading-relaxed whitespace-pre-wrap">
      {children}
    </p>
  );
}

type Slide = {
  numero: number;
  titulo_slide: string;
  corpo_slide: string;
  elementos_visuais?: string;
  usa_modelo?: string;
  image_prompt?: string;
};

type Cena = {
  numero: number;
  duracao_segundos: number;
  descricao: string;
  fala?: string;
  texto_em_tela?: string;
  transicao_para_proxima?: string | null;
  frame_inicial_prompt?: string;
  frame_final_prompt?: string;
  video_prompt?: string;
};

type ElementosTexto = {
  titulo_visual?: string;
  subtitulo?: string;
  cta_visual?: string;
};

export default function CardDetailModal({ post, onClose, onDeleted }: Props) {
  async function handleDelete() {
    if (!confirm("Remover este card?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDeleted();
    onClose();
  }

  const slides = post.slides as Slide[] | null;
  const cenas = post.cenas as Cena[] | null;
  const elementosTexto = post.elementos_texto as ElementosTexto | null;

  const formatBadge: Record<string, string> = {
    foto: "bg-blue-600",
    carrossel: "bg-purple-600",
    video: "bg-green-700",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 backdrop-blur-sm py-6 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${formatBadge[post.formato]}`}>
                {post.formato}
              </span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{post.vertical}</span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{post.angulo}</span>
              {post.usa_modelo && post.usa_modelo !== "nenhum" && (
                <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{post.usa_modelo}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{post.titulo}</h2>
            {post.descricao && (
              <p className="mt-1.5 text-sm text-white/50 leading-relaxed">{post.descricao}</p>
            )}
            {post.motivo_modelo && (
              <p className="mt-1 text-xs text-white/30 italic">Escolha: {post.motivo_modelo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6">

          {/* ── FOTO ── */}
          {post.formato === "foto" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esquerda: elementos visuais */}
              <div>
                <Label>Elementos visuais</Label>
                {elementosTexto ? (
                  <div className="rounded-lg border border-white/8 bg-white/3 p-4 space-y-2">
                    {elementosTexto.titulo_visual && (
                      <div>
                        <span className="text-[10px] text-white/30">Título visual</span>
                        <p className="text-white font-semibold text-base">{elementosTexto.titulo_visual}</p>
                      </div>
                    )}
                    {elementosTexto.subtitulo && (
                      <div>
                        <span className="text-[10px] text-white/30">Subtítulo</span>
                        <p className="text-white/60 text-sm">{elementosTexto.subtitulo}</p>
                      </div>
                    )}
                    {elementosTexto.cta_visual && (
                      <div>
                        <span className="text-[10px] text-white/30">CTA</span>
                        <p className="text-blue-400 text-sm font-medium">{elementosTexto.cta_visual}</p>
                      </div>
                    )}
                  </div>
                ) : <p className="text-white/20 text-xs">—</p>}
                {post.layout && (
                  <div className="mt-4">
                    <Label>Layout</Label>
                    <p className="text-sm text-white/60">{post.layout}</p>
                  </div>
                )}
                {post.image_prompt && (
                  <div className="mt-4">
                    <Label>Image Prompt</Label>
                    <Prompt>{post.image_prompt}</Prompt>
                  </div>
                )}
              </div>

              {/* Direita: copy */}
              <div>
                {post.legenda && (
                  <>
                    <Label>Legenda</Label>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{post.legenda}</p>
                  </>
                )}
                {post.hashtags.length > 0 && (
                  <div className="mt-4">
                    <Label>Hashtags</Label>
                    <p className="text-sm text-blue-400/70 leading-relaxed">{post.hashtags.join(" ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CARROSSEL ── */}
          {post.formato === "carrossel" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esquerda: slides */}
              <div>
                <Label>Slides {slides ? `(${slides.length})` : ""}</Label>
                <div className="space-y-3">
                  {slides?.map((slide) => (
                    <div key={slide.numero} className="rounded-lg border border-white/8 bg-white/3 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {slide.numero}
                        </span>
                        {slide.usa_modelo && slide.usa_modelo !== "nenhum" && (
                          <span className="text-[10px] text-white/30">{slide.usa_modelo}</span>
                        )}
                      </div>
                      <p className="font-semibold text-white text-sm">{slide.titulo_slide}</p>
                      <p className="mt-1 text-xs text-white/55 whitespace-pre-wrap leading-relaxed">{slide.corpo_slide}</p>
                      {slide.elementos_visuais && (
                        <p className="mt-1.5 text-[10px] text-white/30">Visuais: {slide.elementos_visuais}</p>
                      )}
                      {slide.image_prompt && (
                        <Prompt>{slide.image_prompt}</Prompt>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direita: copy */}
              <div>
                {post.legenda && (
                  <>
                    <Label>Legenda</Label>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{post.legenda}</p>
                  </>
                )}
                {post.hashtags.length > 0 && (
                  <div className="mt-4">
                    <Label>Hashtags</Label>
                    <p className="text-sm text-blue-400/70 leading-relaxed">{post.hashtags.join(" ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VÍDEO ── */}
          {post.formato === "video" && (
            <div className="space-y-6">
              {/* Roteiro + Copy lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {post.roteiro_completo && (
                    <>
                      <Label>Roteiro completo</Label>
                      <p className="text-sm text-white/65 whitespace-pre-wrap leading-relaxed">
                        {post.roteiro_completo}
                      </p>
                    </>
                  )}
                </div>
                <div>
                  {post.legenda && (
                    <>
                      <Label>Legenda</Label>
                      <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{post.legenda}</p>
                    </>
                  )}
                  {post.hashtags.length > 0 && (
                    <div className="mt-4">
                      <Label>Hashtags</Label>
                      <p className="text-sm text-blue-400/70 leading-relaxed">{post.hashtags.join(" ")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cenas — storyboard */}
              {cenas && cenas.length > 0 && (
                <div>
                  <Label>Cenas ({cenas.length})</Label>
                  <div className="space-y-4">
                    {cenas.map((cena) => (
                      <div key={cena.numero} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                        {/* Cena header */}
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/3 border-b border-white/5">
                          <span className="text-[11px] font-bold text-blue-400">Cena {cena.numero}</span>
                          <span className="text-[10px] text-white/30">{cena.duracao_segundos}s</span>
                          {cena.transicao_para_proxima && (
                            <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded ${
                              cena.transicao_para_proxima === "CONTINUIDADE"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-white/5 text-white/30"
                            }`}>
                              → {cena.transicao_para_proxima}
                            </span>
                          )}
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Esquerda: descrição + fala + texto em tela */}
                          <div className="space-y-3">
                            <div>
                              <Label>Descrição visual</Label>
                              <p className="text-sm text-white/65">{cena.descricao}</p>
                            </div>
                            {cena.fala && (
                              <div>
                                <Label>Fala</Label>
                                <p className="text-sm text-white/70 italic">&ldquo;{cena.fala}&rdquo;</p>
                              </div>
                            )}
                            {cena.texto_em_tela && (
                              <div>
                                <Label>Texto em tela</Label>
                                <p className="text-sm text-white/55">{cena.texto_em_tela}</p>
                              </div>
                            )}
                          </div>

                          {/* Direita: frames + motion */}
                          <div className="space-y-3">
                            {cena.frame_inicial_prompt && (
                              <div>
                                <Label>Frame inicial →</Label>
                                <Prompt>{cena.frame_inicial_prompt}</Prompt>
                              </div>
                            )}
                            {cena.frame_final_prompt && (
                              <div>
                                <Label>→ Frame final</Label>
                                <Prompt>{cena.frame_final_prompt}</Prompt>
                              </div>
                            )}
                            {cena.video_prompt && (
                              <div>
                                <Label>Motion (Kling)</Label>
                                <Prompt>{cena.video_prompt}</Prompt>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
          <button
            onClick={handleDelete}
            className="text-sm text-red-400/60 hover:text-red-400 transition-colors"
          >
            Remover card
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
