import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

//POST AGREGANDO TIP___________________________________________________________________
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
			const createdBy = data.get("createdBy");
			const slug = data.get("slug");

			let tip = await prisma.blog.create({
				data: {
					title: title,
					description: description,
					createdBy: createdBy,
					slug: slug,
				},
			});

			await prisma.image.create({
				data: {
					url: cloudinaryRes.secure_url,
					publicId: cloudinaryRes.public_id,
					blogId: tip.id,
				},
			});

			return NextResponse.json(
				{
					message: "Tip publicado exitosamente!",
					url: cloudinaryRes.secure_url,
					public_id: cloudinaryRes.public_id,
					title: tip.title,
					createdBy: tip.createdBy,
					description: tip.description,
					slug: tip.slug,
				},
				{ status: 200 }
			);
		}
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "Error al publicar el tip" },
			{ status: 500 }
		);
	}
}

//GET___________________________________________________________________
export async function GET() {
	const tips = await prisma.blog.findMany({
		include: {
			images: true,
		},
	});

	if (!tips.length) {
		return NextResponse.json({
			data: {
				products: [],
				isEmpty: true,
				message: "No hay tips para mostrar",
			},
		});
	}

	return NextResponse.json({
		data: {
			tips: tips,
			isEmpty: false,
			message: "Tips cargados con éxito!",
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

	const foundedTip = await prisma.blog.findFirst({
		where: {
			id: id,
		},
	});

	const removedImage = await prisma.image.delete({
		where: {
			id: imageId,
			url: url,
			blogId: foundedTip.id,
		},
	});

	if (!removedImage) {
		return NextResponse.json(
			{ message: "Error eliminando imagen en Database" },
			{ status: 400 }
		);
	}

	const removedProduct = await prisma.blog.delete({
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


