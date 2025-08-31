"use client"

import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function toCSV(rows: any[]) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","))
  }
  return lines.join("\n")
}

export default function Summary() {
  const { data } = useSWR<{ data: any[] }>("/api/responses", fetcher)
  const items = data?.data ?? []

  const chartData = items.map((r) => {
    const carbonIntensity = r.totalRevenueInr > 0 ? r.carbonEmissionsTco2e / r.totalRevenueInr : 0
    return {
      year: r.fiscalYear,
      carbonIntensity,
      renewableRatio: r.totalElectricityKwh > 0 ? (100 * r.renewableElectricityKwh) / r.totalElectricityKwh : 0,
      diversityRatio: r.totalEmployees > 0 ? (100 * r.femaleEmployees) / r.totalEmployees : 0,
    }
  })

  function downloadCSV() {
    const csv = toCSV(items)
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
    doc.text("ESG Summary", 14, 16)
    let y = 24
    items.forEach((r: any) => {
      const ci = r.totalRevenueInr > 0 ? r.carbonEmissionsTco2e / r.totalRevenueInr : 0
      const rr = r.totalElectricityKwh > 0 ? (100 * r.renewableElectricityKwh) / r.totalElectricityKwh : 0
      const dr = r.totalEmployees > 0 ? (100 * r.femaleEmployees) / r.totalEmployees : 0
      const cr = r.totalRevenueInr > 0 ? (100 * r.communityInvestmentInr) / r.totalRevenueInr : 0
      const line = `${r.fiscalYear} | CI: ${ci.toFixed(6)} | RE%: ${rr.toFixed(2)} | Div%: ${dr.toFixed(2)} | Comm%: ${cr.toFixed(4)}`
      doc.text(line, 14, y)
      y += 8
      if (y > 280) {
        doc.addPage()
        y = 16
      }
    })
    doc.save("esg-summary.pdf")
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-64">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="carbonIntensity" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2">
        <button onClick={downloadPDF} className="rounded-md bg-sky-600 text-white px-3 py-2 hover:bg-sky-700">
          Download PDF
        </button>
        <button
          onClick={downloadCSV}
          className="rounded-md border px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Download CSV
        </button>
      </div>
    </div>
  )
}
