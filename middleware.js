import { NextResponse } from 'next/server'
 
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://moises-web-ecommerce.vercel.app', 'https://moises-web-ecommerce-api.vercel.app']
 
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true', // Allow sending cookies from the client
}
 
export function middleware(request) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)
 
  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'
 
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }
 
  // Handle simple requests
  const response = NextResponse.next()
 
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
 
  Object.entries(corsOptions).forEach(([key, value]) => {
    if (key !== 'Access-Control-Allow-Credentials') {
      response.headers.set(key, value)
    }
  })
 
  return response
}
 
export const config = {
  matcher: '/api/:path*',
}