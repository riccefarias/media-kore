"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Post } from "@/lib/types";

const FORMAT_COLOR: Record<string, string> = {
  foto: "bg-blue-600",
  carrossel: "bg-purple-600",
  video: "bg-green-700",
};

interface Props {
  post: Post;
  index: number;
  onClick: (post: Post) => void;
}

export default function KanbanCard({ post, index, onClick }: Props) {
  return (
    <Draggable draggableId={post.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(post)}
          className={`
            rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer
            transition-all duration-150 select-none
            ${snapshot.isDragging ? "shadow-lg shadow-blue-500/20 border-blue-500/50 scale-[1.02]" : "hover:border-white/20 hover:bg-white/8"}
          `}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${FORMAT_COLOR[post.formato]}`}
            >
              {post.formato}
            </span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">
            {post.titulo}
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
              {post.vertical}
            </span>
            <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
              {post.angulo}
            </span>
          </div>
          {post.usa_modelo && post.usa_modelo !== "nenhum" && (
            <p className="mt-1.5 text-[10px] text-blue-400">{post.usa_modelo}</p>
          )}
          {post.asset_urls.length > 0 && (
            <div className="mt-2 rounded-md overflow-hidden aspect-video bg-white/5">
              <img
                src={post.asset_urls[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {post.video_url && post.asset_urls.length === 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-400">
              <span>▶</span> Vídeo anexado
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
