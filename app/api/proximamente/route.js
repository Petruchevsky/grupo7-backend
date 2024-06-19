import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

//POST AGREGANDO ENTRADA A PROXIMAMENTE___________________________________________________________________
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
			const response = await fetch(
				"https://api.cloudinary.com/v1_1/dtqfrwjdm/image/upload",
				{
					method: "POST",
					body: data,
				}
			);
			const cloudinaryRes = await response.json();

			const title = data.get("title");
			const description = data.get("description");
			const releaseDate = data.get("releaseDate");

			let proximamente = await prisma.proximamente.create({
				data: {
					title: title,
					description: description,
					releaseDate: releaseDate,
				},
			});

			await prisma.image.create({
				data: {
					url: cloudinaryRes.secure_url,
					publicId: cloudinaryRes.public_id,
					proximamenteId: proximamente.id,
				},
			});

			return NextResponse.json(
				{
					message: "Has subido un producto en Próximamente!",
					url: cloudinaryRes.secure_url,
					public_id: cloudinaryRes.public_id,
					title: proximamente.title,
					releaseDate: proximamente.releaseDate,
					description: proximamente.description,
				},
				{ status: 200 }
			);
		}
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "Error al subir tu producto" },
			{ status: 500 }
		);
	}
}

//GET___________________________________________________________________
export async function GET() {
	const proximamente = await prisma.proximamente.findMany({
		include: {
			images: true,
		},
	});

	if (!proximamente.length) {
		return NextResponse.json({
			data: {
				products: [],
				isEmpty: true,
				message: "No hay productos para mostrar",
			},
		});
	}

	return NextResponse.json({
		data: {
			products: proximamente,
			isEmpty: false,
			message: "Productos cargados con éxito!",
		},
	});
}

//DELETE___________________________________________________________________
export async function DELETE(request) {
	const data = await request.json();
	console.log(data);
	const { id, imageId, publicId, url } = data;
	console.log("desde DELETE id:");
	console.log(id);
	console.log(imageId);

	const foundedProximamente = await prisma.proximamente.findFirst({
		where: {
			id: id,
		},
	});

	const removedImage = await prisma.image.delete({
		where: {
			id: imageId,
			url: url,
			proximamenteId: foundedProximamente.id,
		},
	});

	if (!removedImage) {
		return NextResponse.json(
			{ message: "Error eliminando imagen en Database" },
			{ status: 400 }
		);
	}

	const removedProduct = await prisma.proximamente.delete({
		where: {
			id: id,
		},
	});

	if (!removedProduct) {
		return NextResponse.json(
			{ message: "Error eliminando producto en la Database" },
			{ status: 400 }
		);
	}

	if (publicId) {
		try {
			const result = await cloudinary.uploader.destroy(publicId);
			console.log(result);
			if (result.result !== "ok") {
				return NextResponse.json(
					{ message: "Error eliminando imagen en Cloudinary" },
					{ status: 400 }
				);
			}
		} catch (error) {
			console.log(error);
			return NextResponse.json(
				{ message: "Error eliminando imagen en Cloudinary" },
				{ status: 400 }
			);
		}
	} else {
		console.log("publicId no proporcionado");
		return NextResponse.json(
			{ message: "publicId no proporcionado" },
			{ status: 400 }
		);
	}

	return NextResponse.json({ message: "Producto eliminado correctamente" });
}


