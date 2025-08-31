"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"

type ResponseData = {
  fiscalYear: string
  totalElectricityKWh: number
  renewableElectricityKWh: number
  totalFuelLiters: number
  carbonEmissionsTCO2e: number
  totalEmployees: number
  femaleEmployees: number
  avgTrainingHoursPerEmployee: number
  communityInvestmentINR: number
  independentBoardPct: number
  hasDataPrivacyPolicy: boolean
  totalRevenueINR: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const initialState: ResponseData = {
  fiscalYear: "",
  totalElectricityKWh: 0,
  renewableElectricityKWh: 0,
  totalFuelLiters: 0,
  carbonEmissionsTCO2e: 0,
  totalEmployees: 0,
  femaleEmployees: 0,
  avgTrainingHoursPerEmployee: 0,
  communityInvestmentINR: 0,
  independentBoardPct: 0,
  hasDataPrivacyPolicy: false,
  totalRevenueINR: 0,
}

export function ESGForm() {
  const [year, setYear] = useState<string>("FY 2023-24")
  const { data, mutate } = useSWR<{ data: ResponseData | null }>(
    `/api/responses?year=${encodeURIComponent(year)}`,
    fetcher,
  )
  const [form, setForm] = useState<ResponseData>({ ...initialState, fiscalYear: year })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setForm((prev) => ({ ...prev, fiscalYear: year }))
  }, [year])

  useEffect(() => {
    if (data?.data) setForm(data.data)
    else setForm({ ...initialState, fiscalYear: year })
  }, [data, year])

  function num(n: any) {
    const v = Number(n)
    return Number.isFinite(v) ? v : 0
  }

  const { carbonIntensity, renewableElectricityRatio, diversityRatio, communitySpendRatio } = useMemo(() => {
    const rev = num(form.totalRevenueINR)
    const ce = num(form.carbonEmissionsTCO2e)
    const totalElec = num(form.totalElectricityKWh)
    const renElec = num(form.renewableElectricityKWh)
    const totalEmp = num(form.totalEmployees)
    const femaleEmp = num(form.femaleEmployees)
    const comm = num(form.communityInvestmentINR)

    return {
      carbonIntensity: rev > 0 ? ce / rev : 0,
      renewableElectricityRatio: totalElec > 0 ? 100 * (renElec / totalElec) : 0,
      diversityRatio: totalEmp > 0 ? 100 * (femaleEmp / totalEmp) : 0,
      communitySpendRatio: rev > 0 ? 100 * (comm / rev) : 0,
    }
  }, [form])

  function update<K extends keyof ResponseData>(key: K, value: ResponseData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save")
      mutate()
      setMessage("Saved")
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <label className="text-sm">Financial Year</label>
        <select className="border rounded px-3 py-2" value={year} onChange={(e) => setYear(e.target.value)}>
          <option>FY 2022-23</option>
          <option>FY 2023-24</option>
          <option>FY 2024-25</option>
        </select>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <Field
          label="Total electricity consumption"
          unit="kWh"
          value={form.totalElectricityKWh}
          onChange={(v) => update("totalElectricityKWh", v)}
        />
        <Field
          label="Renewable electricity consumption"
          unit="kWh"
          value={form.renewableElectricityKWh}
          onChange={(v) => update("renewableElectricityKWh", v)}
        />
        <Field
          label="Total fuel consumption"
          unit="liters"
          value={form.totalFuelLiters}
          onChange={(v) => update("totalFuelLiters", v)}
        />
        <Field
          label="Carbon emissions"
          unit="T CO2e"
          value={form.carbonEmissionsTCO2e}
          onChange={(v) => update("carbonEmissionsTCO2e", v)}
        />
        <Field
          label="Total number of employees"
          value={form.totalEmployees}
          onChange={(v) => update("totalEmployees", Math.max(0, Math.trunc(v)))}
        />
        <Field
          label="Number of female employees"
          value={form.femaleEmployees}
          onChange={(v) => update("femaleEmployees", Math.max(0, Math.trunc(v)))}
        />
        <Field
          label="Avg training hours per employee (per year)"
          value={form.avgTrainingHoursPerEmployee}
          onChange={(v) => update("avgTrainingHoursPerEmployee", v)}
        />
        <Field
          label="Community investment spend"
          unit="INR"
          value={form.communityInvestmentINR}
          onChange={(v) => update("communityInvestmentINR", v)}
        />
        <Field
          label="% of independent board members"
          unit="%"
          value={form.independentBoardPct}
          onChange={(v) => update("independentBoardPct", v)}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm">Does the company have a data privacy policy?</span>
          <select
            className="border rounded px-3 py-2"
            value={form.hasDataPrivacyPolicy ? "Yes" : "No"}
            onChange={(e) => update("hasDataPrivacyPolicy", e.target.value === "Yes")}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <Field
          label="Total Revenue"
          unit="INR"
          value={form.totalRevenueINR}
          onChange={(v) => update("totalRevenueINR", v)}
        />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Metric label="Carbon Intensity" value={carbonIntensity} suffix=" T CO2e / INR" />
        <Metric label="Renewable Electricity Ratio" value={renewableElectricityRatio} suffix=" %" />
        <Metric label="Diversity Ratio" value={diversityRatio} suffix=" %" />
        <Metric label="Community Spend Ratio" value={communitySpendRatio} suffix=" %" />
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-sky-600 text-white rounded px-4 py-2 hover:bg-sky-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && <span className="text-sm text-slate-700">{message}</span>}
      </div>
    </div>
  )
}

function Field(props: { label: string; unit?: string; value: number; onChange: (v: number) => void }) {
  const { label, unit, value, onChange } = props
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        className="border rounded px-3 py-2"
        type="number"
        step="any"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function Metric(props: { label: string; value: number; suffix?: string }) {
  const { label, value, suffix } = props
  return (
    <div className="border rounded p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-xl font-semibold">
        {Number.isFinite(value) ? value.toFixed(6) : "0"}
        {suffix || ""}
      </p>
    </div>
  )
}

export default ESGForm
