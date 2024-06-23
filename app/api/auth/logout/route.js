import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const isSecure = process.env.NODE_ENV === 'production';
const sameSiteConfig = process.env.NODE_ENV === 'production' ? 'lax' : 'lax'; 
const domain = process.env.NODE_ENV === 'production' ? '.moises-web.cl' : 'localhost';

export async function POST() {
	cookies().delete("authCookie", {
		httpOnly: true,
		maxAge: 0,
		sameSite: sameSiteConfig,
		secure: isSecure,
		path: '/',
		domain: domain
	});
	cookies().delete("loginCookie", {
		httpOnly: false,
		maxAge: 0,
		sameSite: sameSiteConfig,
		secure: isSecure,
		path: '/',
		domain: domain 
	});
	cookies().delete("adminCookie", {
		httpOnly: false,
		maxAge: 0,
		sameSite: sameSiteConfig,
		secure: isSecure,
		path: '/',
		domain: domain
	});

	return NextResponse.json(
		{ message: "Sesión cerrada, vuelve pronto!" },
		{ status: 200 }
	);
}
