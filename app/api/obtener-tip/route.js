import { NextResponse } from "next/server";
import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

// POST___________________________________________________________________________
export async function POST(request) {
  const { slug } = await request.json();

  const tip = await prisma.blog.findFirst({
    where: {
      slug: slug,
    },
    include: {
      images: true,
    },
  });

  console.log(tip);

  if (!tip) {
    return NextResponse.json(
      { message: "No se encontró el tip, por favor inténtalo de nuevo" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { data: tip, message: "Tip cargado y listo para edición" },
    { status: 200 }
  );
}