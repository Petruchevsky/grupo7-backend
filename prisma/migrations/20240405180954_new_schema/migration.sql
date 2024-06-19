/*
  Warnings:

  - You are about to drop the column `image` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Nosotros` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `Nosotros` table. All the data in the column will be lost.
  - You are about to drop the column `image3` on the `Nosotros` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Proximamente` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image10` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image3` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image4` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image5` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image6` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image7` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image8` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image9` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Nosotros" DROP COLUMN "image1",
DROP COLUMN "image2",
DROP COLUMN "image3";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "image1";

-- AlterTable
ALTER TABLE "Proximamente" DROP COLUMN "image1";

-- AlterTable
ALTER TABLE "Slider" DROP COLUMN "image1",
DROP COLUMN "image10",
DROP COLUMN "image2",
DROP COLUMN "image3",
DROP COLUMN "image4",
DROP COLUMN "image5",
DROP COLUMN "image6",
DROP COLUMN "image7",
DROP COLUMN "image8",
DROP COLUMN "image9";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" INTEGER,
    "sliderId" INTEGER,
    "blogId" INTEGER,
    "nosotrosId" INTEGER,
    "proximamenteId" INTEGER,
    "productoId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "Slider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_nosotrosId_fkey" FOREIGN KEY ("nosotrosId") REFERENCES "Nosotros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_proximamenteId_fkey" FOREIGN KEY ("proximamenteId") REFERENCES "Proximamente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
