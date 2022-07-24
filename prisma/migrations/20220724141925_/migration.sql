/*
  Warnings:

  - You are about to drop the `RecipeTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RecipeToRecipeTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecipeToRecipeTag" DROP CONSTRAINT "_RecipeToRecipeTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeToRecipeTag" DROP CONSTRAINT "_RecipeToRecipeTag_B_fkey";

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "RecipeTag";

-- DropTable
DROP TABLE "_RecipeToRecipeTag";
