
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

//POST___________________________________________________________________
export async function POST(request) {
	const data = await request.formData();
	console.log(data.has("description"));
	console.log(data.has("file"));

	if (!data) {
		return NextResponse.json(
			{ message: "No se ha enviado ninguna imagen" },
			{ status: 400 }
		);
	}

	//FOTO Y TEXTO
	if (data.has("description") && data.has("file")) {
		console.log("foto y texto");
		const response = await fetch(
			"https://api.cloudinary.com/v1_1/dtqfrwjdm/image/upload",
			{
				method: "POST",
				body: data,
			}
		);
		const cloudinaryRes = await response.json();
		let prismaNosotros = await prisma.nosotros.findFirst();

		if (!prismaNosotros) {
			prismaNosotros = await prisma.nosotros.create({
				data: {
					description: data.get("description"),
				},
			});
		} else {
			prismaNosotros = await prisma.nosotros.update({
				where: {
					id: prismaNosotros.id,
				},
				data: {
					description: data.get("description"),
				},
			});
		}

		await prisma.image.create({
			data: {
				url: cloudinaryRes.secure_url,
				publicId: cloudinaryRes.public_id,
				nosotrosId: prismaNosotros.id,
			},
		});

		return NextResponse.json({
			message: "Archivo y texto subidos correctamente",
			url: cloudinaryRes.secure_url,
			public_id: cloudinaryRes.public_id,
			description: prismaNosotros.description,
		});
	}

	//SOLO FOTO
	if (!data.has("description") && data.has("file")) {
		console.log("solo foto");
		const response = await fetch(
			"https://api.cloudinary.com/v1_1/dtqfrwjdm/image/upload",
			{
				method: "POST",
				body: data,
			}
		);
		const cloudinaryRes = await response.json();
		let prismaNosotros = await prisma.nosotros.findFirst();

		if (!prismaNosotros) {
			prismaNosotros = await prisma.nosotros.create({});
		}

		await prisma.image.create({
			data: {
				url: cloudinaryRes.secure_url,
				publicId: cloudinaryRes.public_id,
				nosotrosId: prismaNosotros.id,
			},
		});

		return NextResponse.json({
			message: "Archivo(s) subido(s) correctamente",
			url: cloudinaryRes.secure_url,
			public_id: cloudinaryRes.public_id,
		});
	}

	//SOLO DESCRIPCION
	if (data.has("description") && !data.has("file")) {
		console.log("solo descripcion");

		let prismaNosotros = await prisma.nosotros.findFirst();

		if (!prismaNosotros) {
			prismaNosotros = await prisma.nosotros.create({});
		} else {
			prismaNosotros = await prisma.nosotros.update({
				where: {
					id: prismaNosotros.id,
				},
				data: {
					description: data.get("description"),
				},
			});
		}
		
		return NextResponse.json({
			message: "Descripción subida correctamente",
			description: prismaNosotros.description,
		});
	}
}

//GET___________________________________________________________________
export async function GET() {
	const nosotros = await prisma.nosotros.findFirst();

	if (!nosotros) {
		return NextResponse.json({
			data: {
				description: "",
				images: [],
				isEmpty: true,
			},
		});
	}

	const description = await prisma.nosotros.findFirst({
		select: {
			description: true,
		},
	});

	const images = await prisma.image.findMany({
		where: {
			nosotrosId: nosotros.id,
		},
		orderBy: {
			id: "asc",
		},
	});

	if(description.description === "" && images.length === 0) {
		return NextResponse.json({
			data: {
				description: "",
				images: [],
				isEmpty: true,
			},
		});
	}

	return NextResponse.json({
		data: {
			description: description.description,
			images: images,
			isEmpty: false,
		},
	});
}

//DELETE___________________________________________________________________
export async function DELETE(request) {
	const data = await request.json();
	const { id, url, publicId } = data;
	console.log(id);
	console.log(url);
	console.log(publicId);

	const prismaNosotros = await prisma.nosotros.findFirst();
	const removedImage = await prisma.image.delete({
		where: {
			id: id,
			url: url,
			nosotrosId: prismaNosotros.id,
		},
	});

	if (publicId) {
		cloudinary.uploader.destroy(publicId, function (error, result) {
			console.log(result, error);
		});
	} else {
		console.log("publicId no proporcionado");
	}

	if (!removedImage && result.result !== "ok") {
		return NextResponse.json(
			{ message: "No se ha podido eliminar la imagen" },
			{ status: 400 }
		);
	} else {
		return NextResponse.json({ message: "Imagen eliminada correctamente" });
	}
}

//PUT: REEMPLAZAR ARCHIVO___________________________________________________________________
export async function PUT(request) {
	const data = await request.formData();
	let oldID = data.get("oldID");
	let oldPublicId = data.get("oldPublicId");
	oldID = parseInt(oldID);

	if (!data) {
		return NextResponse.json(
			{ message: "No se ha enviado ninguna imagen" },
			{ status: 400 }
		);
	}

	const response = await fetch(
		"https://api.cloudinary.com/v1_1/dtqfrwjdm/auto/upload",
		{
			method: "POST",
			body: data,
		}
	);
	const cloudinaryRes = await response.json();
	const prismaSlider = await prisma.slider.findFirst();

	if (!prismaSlider) {
		await prisma.slider.create({});
	}

	await prisma.image.update({
		where: {
			id: oldID,
		},
		data: {
			url: cloudinaryRes.secure_url,
			publicId: cloudinaryRes.public_id,
			sliderId: prismaSlider.id,
			fileType: cloudinaryRes.resource_type,
		},
	});

	if (oldPublicId && cloudinaryRes) {
		cloudinary.uploader.destroy(oldPublicId, function (error, result) {
			console.log(result, error);
		});
	}

	return NextResponse.json({
		message: "Archivo actualizado correctamente",
		url: cloudinaryRes.secure_url,
		public_id: cloudinaryRes.public_id,
		fileType: cloudinaryRes.resource_type,
	});
}
