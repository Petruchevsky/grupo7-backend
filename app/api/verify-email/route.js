import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";


export async function POST(request) {
  
  const prisma = new PrismaClient();
  const data = await request.json();
  const { token } = data;
  const adminList = ['m.berdichevsky.a@gmail.com', 'admin@moises-web.cl'];
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  console.log(id)

  let foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!foundUser) {
    return NextResponse.json({
      message: "El enlace de confirmación de cuenta ha expirado, por favor registrate otra vez para obtener un nuevo enlace"
    },
    {
      status: 405,
    });
  }

  if(adminList.includes(foundUser.email)) {
    foundUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isAdmin: true,
        emailVerified: true,
      },
    });
  } else {
    foundUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        emailVerified: true,
      },
    });
  }

  return NextResponse.json({ message: "Email verificado exitosamente!! Te estamos redirigiendo para que inicies sesión por primera vez :)" }, { status: 200 });
}