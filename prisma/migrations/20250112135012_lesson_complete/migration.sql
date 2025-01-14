/*
  Warnings:

  - A unique constraint covering the columns `[userId,lessonId]` on the table `LessonProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");
