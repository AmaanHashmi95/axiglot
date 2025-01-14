/*
  Warnings:

  - You are about to drop the column `completed` on the `LessonProgress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LessonProgress_userId_lessonId_key";

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "completed";
