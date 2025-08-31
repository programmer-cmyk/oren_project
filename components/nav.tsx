"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export function AuthedNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      // Use Next.js router to avoid hydration issues
      router.push("/login")
      // Force a refresh to clear any cached state
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const linkCls = (path: string) =>
    `px-3 py-2 rounded-md ${pathname === path ? "bg-sky-100 text-sky-900" : "hover:bg-accent"}`

  return (
    <nav className="flex items-center justify-between mb-6">
      <div className="font-semibold">ESG</div>
      <div className="flex items-center gap-2">
        <Link className={linkCls("/questionnaire")} href="/questionnaire">
          Questionnaire
        </Link>
        <button
          onClick={logout}
          disabled={loading}
          className="px-3 py-2 rounded-md border hover:bg-accent disabled:opacity-50"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
