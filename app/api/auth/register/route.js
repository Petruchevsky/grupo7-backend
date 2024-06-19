import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request) {
	const data = await request.json();
	const { name, email, password } = data;
	const hashedPassword = await bcrypt.hash(password, 10);

	const foundUser = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	// SI EL USUARIO EXISTE Y YA CONFIRMO SU CUENTA...
	if (foundUser && foundUser.emailVerified) {
		return NextResponse.json(
			{ message: "El email ya está registrado, por favor inicia sesión" },
			{
				status: 400,
			}
		);
	}

	// SI ES USUARIO NO EXISTE, CREAMOS UNO...
	if (!foundUser) {
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});
	
		const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
	
		const verificationURL = `${process.env.NEXT_PUBLIC_NEXT_APIURL}/verificar-email/${token}`;
		const message = `
			<h1>¡Bienvenido a Grupo 7!</h1>
			<p>Para activar tu cuenta, haz click en el siguiente enlace:</p>
			<a href="${verificationURL}">Activar cuenta ahora</a>
		`;
	
		async function sendMail() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_NEXT_APIURL}/api/sendMail`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: newUser.email,
							subject: "Activa tu cuenta Grupo 7",
							message: message,
						}),
					}
				);
	
				if (!res.ok) {
					return "Correo no enviado";
				}
	
				return "correo enviado";
			} catch (error) {
				console.error(error);
				return null;
			}
		}
	
		const sendMailResult = await sendMail();
		if (sendMailResult === "correo enviado") {
			return NextResponse.json({ message: "Usuario registrado con éxito, te hemos enviado un email para que confirmes tu cuenta de Grupo 7" });
		} else {
			return NextResponse.json(
				{ message: "Error al enviar el correo de confirmación" },
				{ status: 500 }
			);
		}
	}


	// SI EL USUARIO EXISTE, PERO NO HA CONFIRMADO SU CUENTA...
	if (foundUser && !foundUser.emailVerified) {

		const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const verificationURL = `${process.env.NEXT_PUBLIC_NEXT_APIURL}/verificar-email/${token}`;
		const message = `
			<h1>¡Bienvenido a Grupo 7!</h1>
			<p>Para activar tu cuenta, haz click en el siguiente enlace:</p>
			<a href="${verificationURL}">Activar cuenta ahora</a>
		`;

		async function sendMail() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_NEXT_APIURL}/api/sendMail`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: foundUser.email,
							subject: "Activa tu cuenta Grupo 7",
							message: message,
						}),
					}
				);

				if (!res.ok) {
					return "Correo no enviado";
				}

				return "correo enviado";
			} catch (error) {
				console.error(error);
				return null;
			}
		}

		const sendMailResult = await sendMail();
		console.log(sendMailResult)
		if (sendMailResult === "correo enviado") {
			return NextResponse.json(
				{ message: "Correo de confirmación enviado con éxito" },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "Error al enviar el correo de confirmación" },
				{ status: 500 }
			);
		}
	}
}
