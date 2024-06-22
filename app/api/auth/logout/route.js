import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const isSecure = process.env.NODE_ENV === 'production';
const sameSiteConfig = process.env.NODE_ENV === 'production' ? 'lax' : 'lax'; 
const domain = process.env.NODE_ENV === 'production' ? '.moises-web.cl' : 'localhost';

export async function POST() {
	cookies().delete("authCookie", {
		secure: isSecure,
		sameSite: sameSiteConfig,
		domain: domain,
	});
	cookies().delete("loginCookie", {
		secure: isSecure,
		sameSite: sameSiteConfig,
		domain: domain,
	});
	cookies().delete("adminCookie", {
		secure: isSecure,
		sameSite: sameSiteConfig,
		domain: domain,
	});

	return NextResponse.json(
		{ message: "Sesión cerrada, vuelve pronto!" },
		{ status: 200 }
	);
}
