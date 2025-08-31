import Link from "next/link"

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-pretty">ESG Questionnaire</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Capture ESG metrics by financial year, visualize trends, and export your summary.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md bg-sky-600 text-white px-4 py-2 hover:bg-sky-700"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
