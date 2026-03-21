"use client";

import { useState, useRef } from "react";
import { Post } from "@/lib/types";

interface Props {
  post: Post;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
      {children}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className="ml-2 shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors
        text-white/30 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
    >
      {copied ? "✓ copiado" : "copiar"}
    </button>
  );
}

function Prompt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center mb-1">
        <Label>{label}</Label>
        <CopyButton text={value} />
      </div>
      <p className="rounded bg-white/5 px-2.5 py-2 text-[11px] text-white/45 font-mono leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

// ── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  postId,
  type,
  accept,
  label,
  multiple,
  onUploaded,
}: {
  postId: string;
  type: "image" | "video";
  accept: string;
  label: string;
  multiple: boolean;
  onUploaded: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("postId", postId);
    fd.append("type", type);
    Array.from(files).forEach((f) => fd.append("files", f));
    await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    onUploaded();
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`
        flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
        px-4 py-6 cursor-pointer transition-colors
        ${dragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/3"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      {uploading ? (
        <span className="text-xs text-white/40">Enviando...</span>
      ) : (
        <>
          <span className="text-2xl text-white/20">↑</span>
          <span className="text-xs text-white/40 text-center">{label}</span>
        </>
      )}
    </div>
  );
}

// ── Image gallery ────────────────────────────────────────────────────────────

function ImageGallery({
  postId,
  urls,
  onDeleted,
}: {
  postId: string;
  urls: string[];
  onDeleted: () => void;
}) {
  async function remove(url: string) {
    await fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, url, type: "image" }),
    });
    onDeleted();
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {urls.map((url) => (
        <div key={url} className="group relative rounded-lg overflow-hidden aspect-square bg-white/5">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-white bg-white/10 px-2 py-1 rounded hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}>
              abrir
            </a>
            <button
              onClick={() => remove(url)}
              className="text-[10px] text-red-400 bg-white/10 px-2 py-1 rounded hover:bg-red-500/20">
              remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Video player ─────────────────────────────────────────────────────────────

function VideoPlayer({
  postId,
  url,
  onDeleted,
}: {
  postId: string;
  url: string;
  onDeleted: () => void;
}) {
  async function remove() {
    await fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, url, type: "video" }),
    });
    onDeleted();
  }

  return (
    <div className="mt-3 rounded-xl overflow-hidden bg-black border border-white/10">
      <video src={url} controls className="w-full max-h-64 object-contain bg-black" />
      <div className="flex justify-between items-center px-3 py-2 border-t border-white/5">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-[11px] text-white/40 hover:text-white transition-colors">
          abrir arquivo ↗
        </a>
        <button onClick={remove} className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">
          remover
        </button>
      </div>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Main component ───────────────────────────────────────────────────────────

export default function CardDetailModal({ post, onClose, onDeleted, onUpdated }: Props) {
  const [currentPost, setCurrentPost] = useState(post);

  async function handleDelete() {
    if (!confirm("Remover este card?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDeleted();
    onClose();
  }

  async function refresh() {
    const res = await fetch(`/api/posts/${post.id}`);
    const updated = await res.json();
    setCurrentPost(updated);
    onUpdated();
  }

  const slides = currentPost.slides as Slide[] | null;
  const cenas = currentPost.cenas as Cena[] | null;
  const elementosTexto = currentPost.elementos_texto as ElementosTexto | null;

  const formatBadge: Record<string, string> = {
    foto: "bg-blue-600",
    carrossel: "bg-purple-600",
    video: "bg-green-700",
  };

  const isImages = currentPost.column === "IMAGES";
  const isVideo = currentPost.formato === "video";
  const isRendering = currentPost.column === "RENDERING" || currentPost.column === "VIDEO_REVIEW";

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
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${formatBadge[currentPost.formato]}`}>
                {currentPost.formato}
              </span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{currentPost.vertical}</span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{currentPost.angulo}</span>
              {currentPost.usa_modelo && currentPost.usa_modelo !== "nenhum" && (
                <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{currentPost.usa_modelo}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{currentPost.titulo}</h2>
            {currentPost.descricao && (
              <p className="mt-1.5 text-sm text-white/50 leading-relaxed">{currentPost.descricao}</p>
            )}
            {currentPost.motivo_modelo && (
              <p className="mt-1 text-xs text-white/30 italic">Escolha: {currentPost.motivo_modelo}</p>
            )}
          </div>
          <button onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors text-lg">
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-6">

          {/* ── FOTO ── */}
          {currentPost.formato === "foto" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                </div>
                {currentPost.layout && (
                  <div>
                    <Label>Layout</Label>
                    <p className="text-sm text-white/60">{currentPost.layout}</p>
                  </div>
                )}
                {currentPost.image_prompt && (
                  <Prompt label="Image Prompt" value={currentPost.image_prompt} />
                )}
              </div>
              <div className="space-y-4">
                {currentPost.legenda && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Label>Legenda</Label>
                      <CopyButton text={currentPost.legenda} />
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{currentPost.legenda}</p>
                  </div>
                )}
                {currentPost.hashtags.length > 0 && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Label>Hashtags</Label>
                      <CopyButton text={currentPost.hashtags.join(" ")} />
                    </div>
                    <p className="text-sm text-blue-400/70 leading-relaxed">{currentPost.hashtags.join(" ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CARROSSEL ── */}
          {currentPost.formato === "carrossel" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Slides {slides ? `(${slides.length})` : ""}</Label>
                {slides?.map((slide) => (
                  <div key={slide.numero} className="rounded-lg border border-white/8 bg-white/3 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {slide.numero}
                      </span>
                      {slide.usa_modelo && slide.usa_modelo !== "nenhum" && (
                        <span className="text-[10px] text-white/30">{slide.usa_modelo}</span>
                      )}
                    </div>
                    <p className="font-semibold text-white text-sm">{slide.titulo_slide}</p>
                    <p className="text-xs text-white/55 whitespace-pre-wrap leading-relaxed">{slide.corpo_slide}</p>
                    {slide.elementos_visuais && (
                      <p className="text-[10px] text-white/30">Visuais: {slide.elementos_visuais}</p>
                    )}
                    {slide.image_prompt && (
                      <Prompt label={`Prompt slide ${slide.numero}`} value={slide.image_prompt} />
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {currentPost.legenda && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Label>Legenda</Label>
                      <CopyButton text={currentPost.legenda} />
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{currentPost.legenda}</p>
                  </div>
                )}
                {currentPost.hashtags.length > 0 && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Label>Hashtags</Label>
                      <CopyButton text={currentPost.hashtags.join(" ")} />
                    </div>
                    <p className="text-sm text-blue-400/70 leading-relaxed">{currentPost.hashtags.join(" ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VÍDEO ── */}
          {currentPost.formato === "video" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {currentPost.roteiro_completo && (
                    <>
                      <div className="flex items-center mb-1">
                        <Label>Roteiro completo</Label>
                        <CopyButton text={currentPost.roteiro_completo} />
                      </div>
                      <p className="text-sm text-white/65 whitespace-pre-wrap leading-relaxed">
                        {currentPost.roteiro_completo}
                      </p>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  {currentPost.legenda && (
                    <div>
                      <div className="flex items-center mb-1">
                        <Label>Legenda</Label>
                        <CopyButton text={currentPost.legenda} />
                      </div>
                      <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{currentPost.legenda}</p>
                    </div>
                  )}
                  {currentPost.hashtags.length > 0 && (
                    <div>
                      <div className="flex items-center mb-1">
                        <Label>Hashtags</Label>
                        <CopyButton text={currentPost.hashtags.join(" ")} />
                      </div>
                      <p className="text-sm text-blue-400/70 leading-relaxed">{currentPost.hashtags.join(" ")}</p>
                    </div>
                  )}
                </div>
              </div>

              {cenas && cenas.length > 0 && (
                <div>
                  <Label>Cenas ({cenas.length})</Label>
                  <div className="space-y-4 mt-2">
                    {cenas.map((cena) => (
                      <div key={cena.numero} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
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
                          <div className="space-y-3">
                            <div>
                              <Label>Descrição visual</Label>
                              <p className="text-sm text-white/65">{cena.descricao}</p>
                            </div>
                            {cena.fala && (
                              <div>
                                <div className="flex items-center mb-1">
                                  <Label>Fala</Label>
                                  <CopyButton text={cena.fala} />
                                </div>
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
                          <div className="space-y-3">
                            {cena.frame_inicial_prompt && (
                              <Prompt label="Frame inicial →" value={cena.frame_inicial_prompt} />
                            )}
                            {cena.frame_final_prompt && (
                              <Prompt label="→ Frame final" value={cena.frame_final_prompt} />
                            )}
                            {cena.video_prompt && (
                              <Prompt label="Motion (Kling)" value={cena.video_prompt} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ASSETS: Imagens ── */}
          <div className="border-t border-white/5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <Label>
                {isVideo ? "Frames gerados" : "Imagens geradas"}
                {currentPost.asset_urls.length > 0 && (
                  <span className="ml-2 text-white/30 normal-case font-normal tracking-normal">
                    ({currentPost.asset_urls.length})
                  </span>
                )}
              </Label>
            </div>

            {currentPost.asset_urls.length > 0 && (
              <ImageGallery
                postId={currentPost.id}
                urls={currentPost.asset_urls}
                onDeleted={refresh}
              />
            )}

            <div className="mt-3">
              <UploadZone
                postId={currentPost.id}
                type="image"
                accept="image/*"
                multiple={true}
                label={isVideo
                  ? "Arraste ou clique para subir frames (JPG, PNG)"
                  : "Arraste ou clique para subir imagens geradas (JPG, PNG, WEBP)"}
                onUploaded={refresh}
              />
            </div>
          </div>

          {/* ── ASSETS: Vídeo (só para formato vídeo) ── */}
          {isVideo && (
            <div className="border-t border-white/5 pt-5">
              <Label>Vídeo final</Label>

              {currentPost.video_url ? (
                <VideoPlayer
                  postId={currentPost.id}
                  url={currentPost.video_url}
                  onDeleted={refresh}
                />
              ) : (
                <div className="mt-2">
                  <UploadZone
                    postId={currentPost.id}
                    type="video"
                    accept="video/*"
                    multiple={false}
                    label="Arraste ou clique para subir o vídeo final (MP4, MOV)"
                    onUploaded={refresh}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
          <button onClick={handleDelete}
            className="text-sm text-red-400/60 hover:text-red-400 transition-colors">
            Remover card
          </button>
          <button onClick={onClose}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
