-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "question" TEXT,
    "answer" TEXT,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);
