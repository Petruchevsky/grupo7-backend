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

	const product = await prisma.proximamente.findFirst({
		where: {
			id: id,
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
		{ data: product, message: "Producto cargado y listo para edición" },
		{ status: 200 }
	);
}

// PUT EDITANDO PRODUCTO___________________________________________________________
export async function PUT(request) {
	const data = await request.formData();

	const id = parseInt(data.get("id"));
	const title = data.get("title");
	const description = data.get("description");
	const releaseDate = data.get("releaseDate");

	const product = await prisma.proximamente.findFirst({
		where: {
			id: id,
		},
		include: {
			images: true,
		},
	});

	const imageToBeReplacedId = product.images[0].id;
	const publicIdImageToBeReplaced = product.images[0].publicId;

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

	const productUpdated = await prisma.proximamente.update({
		where: {
			id: id,
		},
		data: {
			title: title,
			description: description,
			releaseDate: releaseDate,
		},
	});

	if (!productUpdated) {
		return NextResponse.json(
			{ message: "Error actualizando el producto, por favor inténtalo de nuevo" },
			{ status: 400 }
		);
	} else {
		return NextResponse.json(
			{ message: "Producto actualizado correctamente!" },
			{ status: 200 }
		);
	}
}
