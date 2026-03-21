"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Post, PostColumn, COLUMNS } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";
import AddCardModal from "./AddCardModal";
import CardDetailModal from "./CardDetailModal";

export default function KanbanBoard() {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }, []);

  const checkAgentStatus = useCallback(async () => {
    const res = await fetch("/api/agent");
    const { running } = await res.json();
    setAgentRunning(running);
    return running;
  }, []);

  // Stop polling and refresh board when agent finishes
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const running = await checkAgentStatus();
      if (!running) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        await fetchPosts();
        setAgentMessage("✓ Cards criados em Write");
      }
    }, 3000);
  }, [checkAgentStatus, fetchPosts]);

  useEffect(() => {
    setMounted(true);
    fetchPosts();
    // Se o agente estava rodando antes do F5, inicia polling
    checkAgentStatus().then((running) => {
      if (running) startPolling();
    });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPosts, checkAgentStatus, startPolling]);

  if (!mounted) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <span className="text-white/30 text-sm">Carregando board...</span>
    </div>
  );

  const postsByColumn = (col: PostColumn) =>
    posts.filter((p) => p.column === col).sort((a, b) => a.order - b.order);

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const destCol = destination.droppableId as PostColumn;
    const destPosts = postsByColumn(destCol).filter((p) => p.id !== draggableId);
    destPosts.splice(destination.index, 0, posts.find((p) => p.id === draggableId)!);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === draggableId) return { ...p, column: destCol, order: destination.index };
        const idx = destPosts.findIndex((dp) => dp.id === p.id);
        if (idx !== -1 && p.column === destCol) return { ...p, order: idx };
        return p;
      })
    );

    await fetch(`/api/posts/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column: destCol, order: destination.index }),
    });
  }

  async function runAgent() {
    if (agentRunning) return;
    setAgentRunning(true);
    setAgentMessage(null);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      if (res.status === 409) return; // server rejeitou: já rodando
      const data = await res.json();
      await fetchPosts();
      setAgentMessage(`✓ ${data.created} card${data.created !== 1 ? "s" : ""} criados em Write`);
    } catch {
      setAgentMessage("Erro ao rodar o agente");
    } finally {
      setAgentRunning(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            KORE<span className="text-blue-500">.AG</span>
          </h1>
          <p className="text-xs text-white/30">Content Pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          {agentMessage && (
            <span className="text-xs text-green-400">{agentMessage}</span>
          )}
          <button
            onClick={runAgent}
            disabled={agentRunning}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {agentRunning ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando...
              </>
            ) : (
              "▶ Rodar Agente"
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full px-4 py-4 w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                posts={postsByColumn(col.id)}
                onAddCard={col.id === "BACKLOG" ? () => setShowAddModal(true) : undefined}
                onCardClick={setSelectedPost}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchPosts}
        />
      )}
      {selectedPost && (
        <CardDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={fetchPosts}
          onUpdated={fetchPosts}
        />
      )}
    </div>
  );
}
