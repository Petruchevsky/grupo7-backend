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

	const tip = await prisma.blog.findFirst({
		where: {
			id: id,
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

// PUT EDITANDO PRODUCTO___________________________________________________________
export async function PUT(request) {
	const data = await request.formData();

	const id = parseInt(data.get("id"));
	const title = data.get("title");
	const description = data.get("description");
	const slug = data.get("slug");
	const createdBy = data.get("createdBy");

	const tip = await prisma.blog.findFirst({
		where: {
			id: id,
		},
		include: {
			images: true,
		},
	});

	const imageToBeReplacedId = tip.images[0].id;
	const publicIdImageToBeReplaced = tip.images[0].publicId;

	if (data.has("file")) {
		const result = await cloudinary.uploader.destroy(publicIdImageToBeReplaced);
		if (result.result !== "ok") {
			console.log(result.result);
			return NextResponse.json(
				{ message: "Error eliminando imagen en Cloudinary" },
				{ status: 400 }
			);
		}

		const response = await fetch(
			"https://api.cloudinary.com/v1_1/dtqfrwjdm/image/upload",
			{
				method: "POST",
				body: data,
			}
		);
		const cloudinaryRes = await response.json();

		await prisma.image.update({
			where: {
				id: imageToBeReplacedId,
			},
			data: {
				url: cloudinaryRes.secure_url,
				publicId: cloudinaryRes.public_id,
			},
		});
	}

	const tipUpdated = await prisma.blog.update({
		where: {
			id: id,
		},
		data: {
			title: title,
			description: description,
			createdBy: createdBy,
			slug: slug,
		},
	});

	if (!tipUpdated) {
		return NextResponse.json(
			{ message: "Error actualizando el tip" },
			{ status: 400 }
		);
	} else {
		return NextResponse.json(
			{ message: "Tip actualizado correctamente!" },
			{ status: 200 }
		);
	}
}
