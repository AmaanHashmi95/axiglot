/*
  Warnings:

  - You are about to drop the column `options` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WordType" AS ENUM ('NOUN', 'VERB', 'PRONOUN', 'ADJECTIVE');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options";

-- AlterTable
ALTER TABLE "post_media" ADD COLUMN     "subtitle" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "language" TEXT,
ADD COLUMN     "requiredLessonId" TEXT;

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "WordType" NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "lyrics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_language_idx" ON "posts"("language");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_requiredLessonId_fkey" FOREIGN KEY ("requiredLessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
