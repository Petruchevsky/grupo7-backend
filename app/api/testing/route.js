import { NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function POST(request) {
  const data = await request.json()
  console.log(data.message)

  cookies().set('auth', 'holi', {
    httpOnly: true,
    maxAge: 7*24*60*60,
    sameSite: 'Strict'
  })

  cookies().set('auth2', 'holi2')

  return NextResponse.json({message: "2 cookies seteadas"}, {status: 200});

}

export async function GET(request) {
  const clientCookie = request.cookies.getAll()
  console.log(clientCookie)

  return NextResponse.json({ message: "cookie leída", clientCookie: clientCookie }, { status: 200 })
}

export async function DELETE(request) {
  
  cookies().delete('auth')
  cookies().delete('auth2')

  return NextResponse.json({ message: "todas las cokkies eliminadas?" }, { status: 200 })
}