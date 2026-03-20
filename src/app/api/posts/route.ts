import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Column, Formato } from "@/generated/prisma/enums";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: [{ column: "asc" }, { order: "asc" }],
  });
  return Response.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const maxOrder = await prisma.post.aggregate({
    where: { column: Column.BACKLOG },
    _max: { order: true },
  });

  const post = await prisma.post.create({
    data: {
      column: Column.BACKLOG,
      order: (maxOrder._max.order ?? -1) + 1,
      titulo: body.titulo,
      formato: body.formato as Formato,
      angulo: body.angulo,
      vertical: body.vertical,
      descricao: body.descricao ?? null,
    },
  });

  return Response.json(post, { status: 201 });
}
