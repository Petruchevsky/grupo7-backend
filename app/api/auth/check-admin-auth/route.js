import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation' 

export function GET(request) {
  const adminUserLogged = request.cookies.get('adminCookie')

  if (adminUserLogged) {
    return NextResponse.json({ message: "Usuario Administrador Loggeado" }, { status: 200 })
  } else {
    return NextResponse.json({ message: "Usuario Administrador No Loggeado" }, { status: 401 })
  }
}