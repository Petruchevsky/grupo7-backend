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

	await prisma.image.create({
		data: {
			url: cloudinaryRes.secure_url,
			publicId: cloudinaryRes.public_id,
			sliderId: prismaSlider.id,
			fileType: cloudinaryRes.resource_type,
		},
	});

	return NextResponse.json({
		message: "Archivo subido correctamente",
		url: cloudinaryRes.secure_url,
		public_id: cloudinaryRes.public_id,
		fileType: cloudinaryRes.resource_type,
	});
}

//GET___________________________________________________________________
export async function GET() {
	const slider = await prisma.slider.findFirst();
	const images = await prisma.image.findMany({
		where: {
			sliderId: slider.id,
		},
		orderBy: {
			id: "asc",
		},
	});

	if (images.length === 0 || !slider) {
		return NextResponse.json([]);
	}

	return NextResponse.json(images);
}

//DELETE___________________________________________________________________
export async function DELETE(request) {
	const data = await request.json();
	const { id, url, publicId } = data;
	console.log(id);
	console.log(url);
	console.log(publicId);

	const removedImage = await prisma.image.delete({
		where: {
			id: id,
			url: url,
			sliderId: 1,
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
