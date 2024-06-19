/*
  Warnings:

  - You are about to drop the `Imagen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Imagen";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slider" (
    "id" SERIAL NOT NULL,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "image6" TEXT,
    "image7" TEXT,
    "image8" TEXT,
    "image9" TEXT,
    "image10" TEXT,

    CONSTRAINT "Slider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nosotros" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,

    CONSTRAINT "Nosotros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proximamente" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "image1" TEXT,

    CONSTRAINT "Proximamente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "price" INTEGER,
    "stock" BOOLEAN,
    "description" TEXT,
    "image1" TEXT,
    "slug" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
