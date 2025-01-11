/*
  Warnings:

  - You are about to drop the column `completed` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the `LanguageProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LanguageProgress" DROP CONSTRAINT "LanguageProgress_userId_fkey";

-- DropIndex
DROP INDEX "LessonProgress_userId_lessonId_key";

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "completed";

-- DropTable
DROP TABLE "LanguageProgress";
