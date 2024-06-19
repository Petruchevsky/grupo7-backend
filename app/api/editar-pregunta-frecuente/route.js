import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

// POST___________________________________________________________________________
export async function POST(request) {
	let { id } = await request.json();
	id = parseInt(id);

	const faq = await prisma.faq.findFirst({
		where: {
			id: id,
		}
	});

	console.log(faq);

	if (!faq) {
		return NextResponse.json(
			{ message: "No se encontró la pregunta frecuente, por favor inténtalo de nuevo" },
			{ status: 404 }
		);
	}

	return NextResponse.json(
		{ data: faq, message: "Producto cargado y listo para edición" },
		{ status: 200 }
	);
}

// PUT EDITANDO PRODUCTO___________________________________________________________
export async function PUT(request) {
	const data = await request.formData();

	const id = parseInt(data.get("id"));
	const question = data.get("question");
	const answer = data.get("answer");

	const faq = await prisma.faq.findFirst({
		where: {
			id: id,
		}
	});

	if (!faq) {
		return NextResponse.json(
			{ message: "No se encontró la pregunta frecuente, por favor inténtalo de nuevo" },
			{ status: 404 }
		);
	}

	const faqUpdated = await prisma.faq.update({
		where: {
			id: id,
		},
		data: {
			question: question,
			answer: answer,
		},
	});

	if (!faqUpdated) {
		return NextResponse.json(
			{ message: "Error actualizando la pregunta frecuente, por favor inténtalo de nuevo" },
			{ status: 400 }
		);
	} else {
		return NextResponse.json(
			{ message: "Pregunta frecuente actualizada correctamente!" },
			{ status: 200 }
		);
	}
}
