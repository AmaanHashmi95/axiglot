/*
  Warnings:

  - You are about to drop the column `progress` on the `LessonProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "progress",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;
