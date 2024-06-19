import { NextResponse } from "next/server";
import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

// POST___________________________________________________________________________
export async function POST(request) {
  const { slug } = await request.json();

  const product = await prisma.producto.findFirst({
    where: {
      slug: slug,
    },
    include: {
      images: true,
    },
  });

  console.log(product);

  if (!product) {
    return NextResponse.json(
      { message: "No se encontró el producto, por favor inténtalo de nuevo" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { data: product, message: "Producto cargado correctamente!" },
    { status: 200 }
  );
}