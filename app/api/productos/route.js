import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

//POST AGREGANDO PRODUCTO___________________________________________________________________
export async function POST(request) {
	const data = await request.formData();

	if (!data) {
		return NextResponse.json(
			{ message: "No se ha enviado ningún producto" },
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
  
      let price = parseInt(data.get("price"));
      let stock = data.get("stock");
      if(stock === "true") stock = true;
      if(stock === "false") stock = false;
      console.log(stock)
  
      let producto = await prisma.producto.create({
        data: {
          title: data.get("title"),
          description: data.get("description"),
          price: price,
          stock: stock,
          slug: data.get("slug"),
        },
      });
  
      await prisma.image.create({
        data: {
          url: cloudinaryRes.secure_url,
          publicId: cloudinaryRes.public_id,
          productoId: producto.id,
        },
      });
  
      return NextResponse.json({
        message: "Producto subido correctamente",
        url: cloudinaryRes.secure_url,
        public_id: cloudinaryRes.public_id,
        title: producto.title,
        price: producto.price,
        description: producto.description,
        stock: producto.stock,
        slug: producto.slug,
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error al subir el producto" }, { status: 500 });
  }
}

//GET___________________________________________________________________
export async function GET() {
  const productos = await prisma.producto.findMany({
    include: {
      images: true,
    },
  });

	if (!productos.length) {
		return NextResponse.json({
			data: {
        products: [],
        isEmpty: true
      }
		});
	}

	return NextResponse.json({
		data: {
      products: productos, 
			isEmpty: false,
		},
	});
}

//DELETE___________________________________________________________________
export async function DELETE(request) {
	const data = await request.json();
  console.log(data)
	const { id, imageId, publicId, url } = data;
	console.log("desde DELETE id:");
	console.log(id);
	console.log(imageId);


	const foundedProduct = await prisma.producto.findFirst({
    where: {
      id: id,
    }
  });

	const removedImage = await prisma.image.delete({
		where: {
			id: imageId,
			url: url,
			productoId: foundedProduct.id,
		},
	});

  if(!removedImage) {
    return NextResponse.json({ message: "Error eliminando imagen en la DB" }, { status: 400 })
  }

  const removedProduct = await prisma.producto.delete({
    where: {
      id: id,
    }
  })

  if(!removedProduct) {
    return NextResponse.json({ message: "Error eliminando producto en la DB" }, { status: 400 })
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
        { status: 500 }
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

