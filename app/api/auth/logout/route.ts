import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  
  // Clear the authentication token
  res.cookies.set("token", "", { 
    httpOnly: true, 
    sameSite: "lax", 
    secure: true, 
    path: "/", 
    maxAge: 0,
    expires: new Date(0)
  })
  
  // Add cache control headers to prevent caching
  res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  res.headers.set("Pragma", "no-cache")
  res.headers.set("Expires", "0")
  
  return res
}
