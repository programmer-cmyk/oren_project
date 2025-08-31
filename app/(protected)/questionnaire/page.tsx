"use client"

import Link from "next/link"
import { ESGForm } from "@/components/esg-form"
import { LogoutButton } from "@/components/logout-button"

export default function QuestionnairePage() {
  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-sans text-balance">ESG Questionnaire</h1>
        <LogoutButton variant="dark" />
      </header>
      <ESGForm />
    </main>
  )
}
