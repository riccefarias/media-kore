import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const postId = formData.get("postId") as string;
  const type = formData.get("type") as "image" | "video"; // "image" | "video"
  const files = formData.getAll("files") as File[];

  if (!postId || !type || files.length === 0) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", postId);
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/${postId}/${filename}`);
  }

  // Update the post record
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  if (type === "image") {
    await prisma.post.update({
      where: { id: postId },
      data: { asset_urls: [...post.asset_urls, ...urls] },
    });
  } else {
    await prisma.post.update({
      where: { id: postId },
      data: { video_url: urls[0] },
    });
  }

  return Response.json({ urls });
}
