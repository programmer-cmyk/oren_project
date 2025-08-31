"use client"

import type React from "react"
import useSWR from "swr"
import { SummaryChart } from "@/components/summary-chart"
import { toCSV } from "@/lib/csv"
import Link from "next/link"
import jsPDF from "jspdf"
import { LogoutButton } from "@/components/logout-button"

type Resp = {
  id: string
  fiscalYear: string
  carbonEmissionsTCO2e: number
  totalRevenueINR: number
  totalElectricityKWh: number
  renewableElectricityKWh: number
  totalEmployees: number
  femaleEmployees: number
  communityInvestmentINR: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SummaryPage() {
  const { data } = useSWR<{ data: Resp[] }>("/api/responses", fetcher)
  const rows = data?.data ?? []

  const chartData = rows.map((r) => ({
    fiscalYear: r.fiscalYear,
    carbonIntensity: r.totalRevenueINR > 0 ? r.carbonEmissionsTCO2e / r.totalRevenueINR : 0,
  }))

  function downloadCSV() {
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "esg-summary.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPDF() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("ESG Summary", 14, 20)
    doc.setFontSize(12)
    let y = 30
    rows.forEach((r) => {
      const lines = [
        `Year: ${r.fiscalYear}`,
        `Carbon Intensity: ${r.totalRevenueINR > 0 ? (r.carbonEmissionsTCO2e / r.totalRevenueINR).toFixed(6) : "0"} T CO2e/INR`,
        `Renewable Electricity Ratio: ${r.totalElectricityKWh > 0 ? (100 * (r.renewableElectricityKWh / r.totalElectricityKWh)).toFixed(2) : "0"} %`,
        `Diversity Ratio: ${r.totalEmployees > 0 ? (100 * (r.femaleEmployees / r.totalEmployees)).toFixed(2) : "0"} %`,
        `Community Spend Ratio: ${r.totalRevenueINR > 0 ? (100 * (r.communityInvestmentINR / r.totalRevenueINR)).toFixed(2) : "0"} %`,
      ]
      lines.forEach((line) => {
        doc.text(line, 14, y)
        y += 7
        if (y > 280) {
          doc.addPage()
          y = 20
        }
      })
      y += 5
    })
    doc.save("esg-summary.pdf")
  }

  return (
    <main className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-sans text-balance">Summary</h1>
        <nav className="flex items-center gap-3">
          <Link href="/questionnaire" className="text-sky-700 underline">
            Questionnaire
          </Link>
          <LogoutButton variant="dark" />
        </nav>
      </header>

      <SummaryChart data={chartData} />

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <Th>Year</Th>
              <Th>Carbon Intensity</Th>
              <Th>Renew Elec Ratio</Th>
              <Th>Diversity Ratio</Th>
              <Th>Community Spend Ratio</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const carbon = r.totalRevenueINR > 0 ? r.carbonEmissionsTCO2e / r.totalRevenueINR : 0
              const ren = r.totalElectricityKWh > 0 ? 100 * (r.renewableElectricityKWh / r.totalElectricityKWh) : 0
              const div = r.totalEmployees > 0 ? 100 * (r.femaleEmployees / r.totalEmployees) : 0
              const com = r.totalRevenueINR > 0 ? 100 * (r.communityInvestmentINR / r.totalRevenueINR) : 0
              return (
                <tr key={r.id} className="odd:bg-white even:bg-slate-50">
                  <Td>{r.fiscalYear}</Td>
                  <Td>{carbon.toFixed(6)} T/INR</Td>
                  <Td>{ren.toFixed(2)}%</Td>
                  <Td>{div.toFixed(2)}%</Td>
                  <Td>{com.toFixed(2)}%</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <button onClick={downloadPDF} className="bg-sky-600 text-white rounded px-4 py-2 hover:bg-sky-700">
          Download PDF
        </button>
        <button onClick={downloadCSV} className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700">
          Download CSV
        </button>
      </div>
    </main>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-2">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-2">{children}</td>
}
