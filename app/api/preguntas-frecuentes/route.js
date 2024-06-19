import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//POST AGREGANDO NUEVA PREGUNTA FRECUENTE___________________________________________________________________
export async function POST(request) {
	const data = await request.formData();

	if (!data) {
		return NextResponse.json(
			{ message: "No se ha enviado ningún dato" },
			{ status: 400 }
		);
	}

	try {
		if (data) {
			const question = data.get("question");
			const answer = data.get("answer");

			let faq = await prisma.faq.create({
				data: {
					question: question,
					answer: answer,
				},
			});

			return NextResponse.json(
				{
					data: {
						question: faq.question,
						answer: faq.answer,
						message: "Has subido una nueva pregunta frecuente!",
					},
				},
				{ status: 200 }
			);
		}
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "Error al subir tu pregunta frecuente" },
			{ status: 500 }
		);
	}
}

//GET___________________________________________________________________
export async function GET() {
	const faqs = await prisma.faq.findMany();

	if (!faqs.length) {
		return NextResponse.json({
			data: {
				faqs: [],
				isEmpty: true,
				message: "No hay preguntas frecuentes para mostrar",
			},
		});
	}

	return NextResponse.json({
		data: {
			faqs: faqs,
			isEmpty: false,
			message: "Preguntas frecuentes cargadas con éxito!",
		},
	});
}

//DELETE___________________________________________________________________
export async function DELETE(request) {
	const data = await request.json();
	console.log(data);
	const { id } = data;

	const foundedFaq = await prisma.faq.findFirst({
		where: {
			id: id,
		},
	});

	if (!foundedFaq) {
		return NextResponse.json(
			{ message: "No se ha encontrado la pregunta frecuente" },
			{ status: 404 }
		);
	}

	const removedFaq = await prisma.faq.delete({
		where: {
			id: id,
		},
	});

	if (!removedFaq) {
		return NextResponse.json(
			{ message: "Error eliminando pregunta frecuente en la base de datos" },
			{ status: 400 }
		);
	}

	return NextResponse.json({
		message: "Pregunta frecuente eliminada correctamente",
	});
}
