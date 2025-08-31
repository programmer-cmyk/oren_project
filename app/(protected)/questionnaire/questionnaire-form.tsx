"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type FormState = {
  fiscalYear: string
  totalElectricityKwh: string
  renewableElectricityKwh: string
  totalFuelLiters: string
  carbonEmissionsTco2e: string
  totalEmployees: string
  femaleEmployees: string
  avgTrainingHours: string
  communityInvestmentInr: string
  independentBoardPct: string
  hasDataPrivacyPolicy: "Yes" | "No" | ""
  totalRevenueInr: string
}

function toNum(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function QuestionnaireForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    fiscalYear: "",
    totalElectricityKwh: "",
    renewableElectricityKwh: "",
    totalFuelLiters: "",
    carbonEmissionsTco2e: "",
    totalEmployees: "",
    femaleEmployees: "",
    avgTrainingHours: "",
    communityInvestmentInr: "",
    independentBoardPct: "",
    hasDataPrivacyPolicy: "",
    totalRevenueInr: "",
  })

  const computed = useMemo(() => {
    const carbon = toNum(form.carbonEmissionsTco2e)
    const revenue = toNum(form.totalRevenueInr)
    const totalElec = toNum(form.totalElectricityKwh)
    const renElec = toNum(form.renewableElectricityKwh)
    const totalEmp = toNum(form.totalEmployees)
    const femaleEmp = toNum(form.femaleEmployees)
    const community = toNum(form.communityInvestmentInr)

    const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0)

    const carbonIntensity = safeDiv(carbon, revenue) // T CO2e / INR
    const renewableRatio = 100 * safeDiv(renElec, totalElec)
    const diversityRatio = 100 * safeDiv(femaleEmp, totalEmp)
    const communityRatio = 100 * safeDiv(community, revenue)

    const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(4) : "0")
    const fmtPct = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : "0.00")

    return {
      carbonIntensity: fmt(carbonIntensity),
      renewableRatio: fmtPct(renewableRatio),
      diversityRatio: fmtPct(diversityRatio),
      communityRatio: fmtPct(communityRatio),
    }
  }, [form])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setSaving(true)
    try {
      if (!form.fiscalYear) throw new Error("Please select a fiscal year")
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Save failed")
      router.push("/summary")
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">ESG Questionnaire</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">% of independent board members</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            className="border rounded-md px-3 py-2"
            value={form.independentBoardPct}
            onChange={(e) => setForm({ ...form, independentBoardPct: e.target.value })}
            placeholder="e.g., 35"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Fiscal Year</span>
          <select
            className="border rounded-md px-3 py-2"
            value={form.fiscalYear}
            onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
            required
          >
            <option value="">Select year</option>
            <option value="2021-22">2021-22</option>
            <option value="2022-23">2022-23</option>
            <option value="2023-24">2023-24</option>
            <option value="2024-25">2024-25</option>
          </select>
        </label>

        {/* Environmental */}
        <label className="flex flex-col gap-1">
          <span className="text-sm">Total electricity consumption (kWh)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.totalElectricityKwh}
            onChange={(e) => setForm({ ...form, totalElectricityKwh: e.target.value })}
            placeholder="e.g., 120000"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Renewable electricity consumption (kWh)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.renewableElectricityKwh}
            onChange={(e) => setForm({ ...form, renewableElectricityKwh: e.target.value })}
            placeholder="e.g., 30000"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Total fuel consumption (liters)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.totalFuelLiters}
            onChange={(e) => setForm({ ...form, totalFuelLiters: e.target.value })}
            placeholder="e.g., 5000"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Carbon emissions (T CO2e)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.carbonEmissionsTco2e}
            onChange={(e) => setForm({ ...form, carbonEmissionsTco2e: e.target.value })}
            placeholder="e.g., 800"
          />
        </label>

        {/* Social */}
        <label className="flex flex-col gap-1">
          <span className="text-sm">Total number of employees</span>
          <input
            type="number"
            inputMode="numeric"
            className="border rounded-md px-3 py-2"
            value={form.totalEmployees}
            onChange={(e) => setForm({ ...form, totalEmployees: e.target.value })}
            placeholder="e.g., 200"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Number of female employees</span>
          <input
            type="number"
            inputMode="numeric"
            className="border rounded-md px-3 py-2"
            value={form.femaleEmployees}
            onChange={(e) => setForm({ ...form, femaleEmployees: e.target.value })}
            placeholder="e.g., 90"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Average training hours per employee (per year)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.avgTrainingHours}
            onChange={(e) => setForm({ ...form, avgTrainingHours: e.target.value })}
            placeholder="e.g., 12.5"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Community investment spend (INR)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.communityInvestmentInr}
            onChange={(e) => setForm({ ...form, communityInvestmentInr: e.target.value })}
            placeholder="e.g., 1500000"
          />
        </label>

        {/* Governance */}
        <label className="flex flex-col gap-1">
          <span className="text-sm">Does the company have a data privacy policy?</span>
          <select
            className="border rounded-md px-3 py-2"
            value={form.hasDataPrivacyPolicy}
            onChange={(e) => setForm({ ...form, hasDataPrivacyPolicy: e.target.value as any })}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Total Revenue (INR)</span>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-md px-3 py-2"
            value={form.totalRevenueInr}
            onChange={(e) => setForm({ ...form, totalRevenueInr: e.target.value })}
            placeholder="e.g., 50000000"
          />
        </label>
      </div>

      <section className="border rounded-md p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Auto-Calculated</h3>
        <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
          <li>
            Carbon Intensity: <b>{computed.carbonIntensity}</b> T CO2e / INR
          </li>
          <li>
            Renewable Electricity Ratio: <b>{computed.renewableRatio}%</b>
          </li>
          <li>
            Diversity Ratio: <b>{computed.diversityRatio}%</b>
          </li>
          <li>
            Community Spend Ratio: <b>{computed.communityRatio}%</b>
          </li>
        </ul>
      </section>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({
              fiscalYear: "",
              totalElectricityKwh: "",
              renewableElectricityKwh: "",
              totalFuelLiters: "",
              carbonEmissionsTco2e: "",
              totalEmployees: "",
              femaleEmployees: "",
              avgTrainingHours: "",
              communityInvestmentInr: "",
              independentBoardPct: "",
              hasDataPrivacyPolicy: "",
              totalRevenueInr: "",
            })
          }
          className="rounded-md border px-4 py-2 hover:bg-accent"
        >
          Reset
        </button>
      </div>
    </form>
  )
}

