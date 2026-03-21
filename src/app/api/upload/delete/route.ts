import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { postId, url, type } = await request.json();

  // Remove file from disk
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await unlink(filePath);
  } catch {
    // File might not exist, continue anyway
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  if (type === "image") {
    await prisma.post.update({
      where: { id: postId },
      data: { asset_urls: post.asset_urls.filter((u) => u !== url) },
    });
  } else {
    await prisma.post.update({
      where: { id: postId },
      data: { video_url: null },
    });
  }

  return Response.json({ ok: true });
}
