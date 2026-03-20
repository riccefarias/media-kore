"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Post, PostColumn } from "@/lib/types";
import KanbanCard from "./KanbanCard";

interface Props {
  id: PostColumn;
  label: string;
  posts: Post[];
  onAddCard?: () => void;
  onCardClick: (post: Post) => void;
}

export default function KanbanColumn({ id, label, posts, onAddCard, onCardClick }: Props) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl border border-white/8 bg-white/3 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/80">{label}</span>
          {posts.length > 0 && (
            <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-bold text-white/50">
              {posts.length}
            </span>
          )}
        </div>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="rounded-md px-1.5 py-0.5 text-white/30 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
            title="Adicionar ideia"
          >
            +
          </button>
        )}
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-24 overflow-y-auto p-2 space-y-2 transition-colors duration-150
              ${snapshot.isDraggingOver ? "bg-blue-500/5" : ""}
            `}
          >
            {posts.map((post, index) => (
              <KanbanCard
                key={post.id}
                post={post}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
