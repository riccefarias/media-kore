import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Column } from "@/generated/prisma/enums";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const post = await prisma.post.update({
    where: { id },
    data: body,
  });

  return Response.json(post);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
