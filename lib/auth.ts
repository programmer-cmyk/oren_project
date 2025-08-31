import { cookies } from "next/headers"
import { verifySession } from "./jwt"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"

export async function getSessionUser() {
  const token = (await cookies()).get("token")?.value
  if (!token) return null
  try {
    const payload = await verifySession(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return null
    return user
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function getCurrentUser() {
  return getSessionUser()
}
