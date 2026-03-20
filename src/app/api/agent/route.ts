import { prisma } from "@/lib/prisma";
import { runClaudeAgent } from "@/lib/agent";
import { Column, Formato } from "@/generated/prisma/enums";

// Server-side lock — persists across requests within the same process
let agentRunning = false;

export async function GET() {
  return Response.json({ running: agentRunning });
}

export async function POST() {
  if (agentRunning) {
    return Response.json({ error: "Agente já está rodando" }, { status: 409 });
  }

  agentRunning = true;

  try {
    const backlogCards = await prisma.post.findMany({
      where: { column: Column.BACKLOG },
      orderBy: { order: "asc" },
    });

    let userPrompt: string;

    if (backlogCards.length > 0) {
      const ideas = backlogCards.map((c, i) =>
        `${i + 1}. titulo: "${c.titulo}" | formato: ${c.formato} | angulo: ${c.angulo} | vertical: ${c.vertical}${c.descricao ? ` | descricao: ${c.descricao}` : ""}`
      ).join("\n");
      userPrompt = `Expanda as seguintes ideias do Backlog em posts completos:\n\n${ideas}`;
    } else {
      userPrompt =
        "O Backlog está vazio. Seja proativo: pesquise tendências do momento, considere sazonalidade e o contexto do mercado brasileiro. Gere 6 ideias distribuídas entre as verticais da KORE.AG e já expanda cada uma em post completo.";
    }

    const results = await runClaudeAgent(userPrompt) as Record<string, unknown>[];

    const maxOrder = await prisma.post.aggregate({
      where: { column: Column.WRITE },
      _max: { order: true },
    });
    let nextOrder = (maxOrder._max.order ?? -1) + 1;

    const created = await prisma.$transaction(
      results.map((card) =>
        prisma.post.create({
          data: {
            column: Column.WRITE,
            order: nextOrder++,
            titulo: String(card.titulo ?? ""),
            formato: (card.formato as Formato) ?? Formato.foto,
            angulo: String(card.angulo ?? ""),
            vertical: String(card.vertical ?? ""),
            descricao: card.descricao ? String(card.descricao) : null,
            legenda: card.legenda ? String(card.legenda) : null,
            hashtags: Array.isArray(card.hashtags) ? (card.hashtags as string[]) : [],
            usa_modelo: card.usa_modelo ? String(card.usa_modelo) : null,
            motivo_modelo: card.motivo_modelo ? String(card.motivo_modelo) : null,
            image_prompt: card.image_prompt ? String(card.image_prompt) : null,
            elementos_texto: card.elementos_texto ?? undefined,
            layout: card.layout ? String(card.layout) : null,
            slides: card.slides ?? undefined,
            roteiro_completo: card.roteiro_completo ? String(card.roteiro_completo) : null,
            cenas: card.cenas ?? undefined,
          },
        })
      )
    );

    if (backlogCards.length > 0) {
      await prisma.post.deleteMany({
        where: { id: { in: backlogCards.map((c) => c.id) } },
      });
    }

    return Response.json({ created: created.length });
  } finally {
    agentRunning = false;
  }
}
