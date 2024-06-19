import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	cookies().delete("authCookie");
	cookies().delete("loginCookie");
	cookies().delete("adminCookie");

	return NextResponse.json(
		{ message: "Sesión cerrada, vuelve pronto!" },
		{ status: 200 }
	);
}
