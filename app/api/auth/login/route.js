import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const isSecure = process.env.NODE_ENV === 'production';
const sameSiteConfig = process.env.NODE_ENV === 'production' ? 'lax' : 'lax'; 
const domain = process.env.NODE_ENV === 'production' ? '.moises-web.cl' : 'localhost';

export async function POST(request) {
	const data = await request.json();
	const { email, password } = data;
	console.log(isSecure);
	console.log(sameSiteConfig);

	const foundUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	// SI EL USUARIO NO EXISTE...
	if (!foundUser) {
		return NextResponse.json(
			{ message: "Usuario no registrado" },
			{ status: 404 }
		);
	}

	const passwordMatch = await bcrypt.compare(password, foundUser.password);

	// SI LA CONTRASEÑA NO COINCIDE...
	if (!passwordMatch) {
		return NextResponse.json(
			{ message: "Contraseña incorrecta" },
			{ status: 401 }
		);
	}

	// SI EL USUARIO NO HA CONFIRMADO SU EMAIL...
  if(!foundUser.emailVerified) {
    return NextResponse.json(
      { message: "Debes confirmar tu cuenta antes de iniciar sesión" },
      { status: 401 }
    );
  }

	// SI EL USUARIO NO ES ADMINISTRADOR...
	if (foundUser && !foundUser.isAdmin) {
		const token = jwt.sign(
			{ id: foundUser.id, isAdmin: foundUser.isAdmin },
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);
	
		cookies().set({
			name: 'authCookie',
			value: token,
			httpOnly: true,
			maxAge: 7*24*60*60,
			sameSite: sameSiteConfig,
			secure: isSecure,
			domain: domain
		})
	
		cookies().set({
			name: 'loginCookie',
			value: true,
			httpOnly: false,
			maxAge: 7*24*60*60,
			sameSite: sameSiteConfig,
			secure: isSecure,
			path: '/',
			domain: domain 
		})
	
		return NextResponse.json({ message: "Login exitoso, redirigiendo a inicio" }, { status: 200 });
	}

	// SI EL USUARIO ES ADMINISTRADOR...
	if (foundUser && foundUser.isAdmin) {
		const token = jwt.sign(
			{ id: foundUser.id, isAdmin: foundUser.isAdmin },
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);
	
		cookies().set({
			name: 'authCookie',
			value: token,
			httpOnly: true,
			maxAge: 7*24*60*60,
			sameSite: sameSiteConfig,
			secure: isSecure,
			path: '/',
			domain: domain
		})
	
		cookies().set({
			name: 'loginCookie',
			value: true,
			httpOnly: false,
			maxAge: 7*24*60*60,
			sameSite: sameSiteConfig,
			secure: isSecure,
			path: '/',
			domain: domain
		})

		cookies().set({
			name: 'adminCookie',
			value: true,
			httpOnly: false,
			maxAge: 7*24*60*60,
			sameSite: sameSiteConfig,
			secure: isSecure,
			path: '/',
			domain: domain
		})
	
		return NextResponse.json({ message: "Login exitoso, bienvenido administrador, redirigiendo..." }, { status: 200 });
	}

}
