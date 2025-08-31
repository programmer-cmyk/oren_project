"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Item = {
  fiscalYear: string
  carbonIntensity: number
}

export function SummaryChart({ data }: { data: Item[] }) {
  return (
    <div className="w-full h-80 border rounded p-4">
      <h2 className="text-lg font-semibold mb-2">Carbon Intensity by Year</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fiscalYear" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="carbonIntensity" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
