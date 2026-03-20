-- CreateEnum
CREATE TYPE "Column" AS ENUM ('BACKLOG', 'WRITE', 'PRE_APPROVED', 'IMAGES', 'RENDERING', 'VIDEO_REVIEW', 'APPROVED', 'TO_POST', 'DONE');

-- CreateEnum
CREATE TYPE "Formato" AS ENUM ('foto', 'carrossel', 'video');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "column" "Column" NOT NULL,
    "order" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "formato" "Formato" NOT NULL,
    "angulo" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "descricao" TEXT,
    "legenda" TEXT,
    "hashtags" TEXT[],
    "usa_modelo" TEXT,
    "motivo_modelo" TEXT,
    "image_prompt" TEXT,
    "elementos_texto" JSONB,
    "layout" TEXT,
    "slides" JSONB,
    "roteiro_completo" TEXT,
    "cenas" JSONB,
    "asset_urls" TEXT[],
    "video_url" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "instagram_post_id" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
