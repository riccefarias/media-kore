export type PostFormat = "foto" | "carrossel" | "video";

export type PostColumn =
  | "BACKLOG"
  | "WRITE"
  | "PRE_APPROVED"
  | "IMAGES"
  | "RENDERING"
  | "VIDEO_REVIEW"
  | "APPROVED"
  | "TO_POST"
  | "DONE";

export interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  column: PostColumn;
  order: number;
  titulo: string;
  formato: PostFormat;
  angulo: string;
  vertical: string;
  descricao: string | null;
  legenda: string | null;
  hashtags: string[];
  usa_modelo: string | null;
  motivo_modelo: string | null;
  image_prompt: string | null;
  elementos_texto: unknown;
  layout: string | null;
  slides: unknown;
  roteiro_completo: string | null;
  cenas: unknown;
  asset_urls: string[];
  video_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  instagram_post_id: string | null;
}

export const COLUMNS: { id: PostColumn; label: string }[] = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "WRITE", label: "Write" },
  { id: "PRE_APPROVED", label: "Pre-approved" },
  { id: "IMAGES", label: "Images" },
  { id: "RENDERING", label: "Rendering" },
  { id: "VIDEO_REVIEW", label: "Video Review" },
  { id: "APPROVED", label: "Approved" },
  { id: "TO_POST", label: "To Post" },
  { id: "DONE", label: "Done" },
];
