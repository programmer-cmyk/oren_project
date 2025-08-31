"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface LogoutButtonProps {
  variant?: "default" | "dark"
  className?: string
}

export function LogoutButton({ variant = "default", className = "" }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const baseClasses = "rounded px-3 py-2 disabled:opacity-50"
  const variantClasses = {
    default: "border hover:bg-accent hover:text-accent-foreground",
    dark: "bg-slate-800 text-white hover:bg-slate-900"
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <button 
      onClick={logout}
      disabled={loading}
      className={buttonClasses}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  )
}
