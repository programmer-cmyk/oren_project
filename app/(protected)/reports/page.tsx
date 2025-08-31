import { LogoutButton } from "@/components/logout-button"
import { PastReportsClient } from "./past-reports-client"
import Link from "next/link"

export default function ReportsPage() {
  return (
    <main className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <PastReportsClient />
    </main>
  )
}

