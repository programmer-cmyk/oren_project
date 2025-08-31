import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import ESGForm from "@/components/esg-form"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"

export default async function AppPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">ESG Questionnaire</h1>
          <p className="text-sm text-muted-foreground mt-1">Logged in as {user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/reports" 
            className="px-3 py-2 text-sm border rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            View Reports
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="grid md:grid-cols-1 gap-6">
        <div className="border rounded-xl p-4">
          <h2 className="text-lg font-medium mb-2">Enter metrics</h2>
          <ESGForm />
        </div>
      </section>
    </main>
  )
}
