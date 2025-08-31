"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, PieChart, Pie, Cell } from "recharts"
import { toCSV } from "@/lib/csv"
import jsPDF from "jspdf"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ESGResponse = {
  id: string
  fiscalYear: string
  totalElectricityKwh: number | null
  renewableElectricityKwh: number | null
  totalFuelLiters: number | null
  carbonEmissionsTco2e: number | null
  totalEmployees: number | null
  femaleEmployees: number | null
  avgTrainingHours: number | null
  communityInvestmentInr: number | null
  independentBoardPct: number | null
  hasDataPrivacyPolicy: boolean | null
  totalRevenueInr: number | null
  createdAt: string
  updatedAt: string
}

export function PastReportsClient() {
  const { data } = useSWR<{ data: ESGResponse[] }>("/api/responses", fetcher)
  const responses = data?.data ?? []
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [viewMode, setViewMode] = useState<"table" | "charts" | "detailed">("table")

  // Filter responses by selected year
  const filteredResponses = selectedYear 
    ? responses.filter(r => r.fiscalYear === selectedYear)
    : responses

  // Get unique years for filtering
  const years = [...new Set(responses.map(r => r.fiscalYear))].sort((a, b) => b.localeCompare(a))

  // Calculate ESG metrics
  const calculateMetrics = (response: ESGResponse) => {
    const carbonIntensity = response.totalRevenueInr && response.carbonEmissionsTco2e 
      ? response.carbonEmissionsTco2e / response.totalRevenueInr 
      : 0
    
    const renewableRatio = response.totalElectricityKwh && response.renewableElectricityKwh
      ? (100 * response.renewableElectricityKwh) / response.totalElectricityKwh
      : 0
    
    const diversityRatio = response.totalEmployees && response.femaleEmployees
      ? (100 * response.femaleEmployees) / response.totalEmployees
      : 0
    
    const communityRatio = response.totalRevenueInr && response.communityInvestmentInr
      ? (100 * response.communityInvestmentInr) / response.totalRevenueInr
      : 0

    return {
      carbonIntensity,
      renewableRatio,
      diversityRatio,
      communityRatio
    }
  }

  // Prepare chart data
  const chartData = responses.map(r => {
    const metrics = calculateMetrics(r)
    return {
      year: r.fiscalYear,
      carbonIntensity: metrics.carbonIntensity,
      renewableRatio: metrics.renewableRatio,
      diversityRatio: metrics.diversityRatio,
      communityRatio: metrics.communityRatio,
      totalRevenue: r.totalRevenueInr || 0,
      carbonEmissions: r.carbonEmissionsTco2e || 0
    }
  })

  // Download functions
  function downloadCSV() {
    const csv = toCSV(filteredResponses)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `esg-reports-${selectedYear || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPDF() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("ESG Reports", 14, 20)
    
    if (selectedYear) {
      doc.setFontSize(12)
      doc.text(`Year: ${selectedYear}`, 14, 30)
    }
    
    doc.setFontSize(10)
    let y = selectedYear ? 40 : 30
    
    filteredResponses.forEach((r, index) => {
      const metrics = calculateMetrics(r)
      const lines = [
        `Fiscal Year: ${r.fiscalYear}`,
        `Carbon Intensity: ${metrics.carbonIntensity.toFixed(6)} T CO2e/INR`,
        `Renewable Electricity: ${metrics.renewableRatio.toFixed(2)}%`,
        `Diversity Ratio: ${metrics.diversityRatio.toFixed(2)}%`,
        `Community Investment: ${metrics.communityRatio.toFixed(4)}%`,
        `Total Revenue: ${r.totalRevenueInr ? `₹${r.totalRevenueInr.toLocaleString()}` : 'N/A'}`,
        `Total Employees: ${r.totalEmployees || 'N/A'}`,
        `Data Privacy Policy: ${r.hasDataPrivacyPolicy ? 'Yes' : 'No'}`
      ]
      
      lines.forEach((line, i) => {
        doc.text(line, 14, y + (i * 5))
      })
      
      y += (lines.length * 5) + 10
      
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    })
    
    doc.save(`esg-reports-${selectedYear || 'all'}.pdf`)
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No ESG reports found</h3>
        <p className="text-gray-600 mb-4">Start by filling out your first ESG questionnaire</p>
        <Link 
          href="/questionnaire" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
        >
          Go to Questionnaire
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-sans text-balance">Past ESG Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">View and analyze your historical ESG data</p>
        </div>
        <LogoutButton variant="dark" />
      </header>

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">View Mode:</label>
          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-sm ${viewMode === "table" ? "bg-sky-600 text-white" : "bg-white"}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("charts")}
              className={`px-3 py-1 text-sm ${viewMode === "charts" ? "bg-sky-600 text-white" : "bg-white"}`}
            >
              Charts
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1 text-sm ${viewMode === "detailed" ? "bg-sky-600 text-white" : "bg-white"}`}
            >
              Detailed
            </button>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <button 
            onClick={downloadPDF}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Download PDF
          </button>
          <button 
            onClick={downloadCSV}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Year</th>
                <th className="border border-gray-300 p-2 text-left">Carbon Intensity</th>
                <th className="border border-gray-300 p-2 text-left">Renewable %</th>
                <th className="border border-gray-300 p-2 text-left">Diversity %</th>
                <th className="border border-gray-300 p-2 text-left">Community %</th>
                <th className="border border-gray-300 p-2 text-left">Revenue</th>
                <th className="border border-gray-300 p-2 text-left">Employees</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.map((response) => {
                const metrics = calculateMetrics(response)
                return (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{response.fiscalYear}</td>
                    <td className="border border-gray-300 p-2">{metrics.carbonIntensity.toFixed(6)}</td>
                    <td className="border border-gray-300 p-2">{metrics.renewableRatio.toFixed(2)}%</td>
                    <td className="border border-gray-300 p-2">{metrics.diversityRatio.toFixed(2)}%</td>
                    <td className="border border-gray-300 p-2">{metrics.communityRatio.toFixed(4)}%</td>
                    <td className="border border-gray-300 p-2">
                      {response.totalRevenueInr ? `₹${response.totalRevenueInr.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="border border-gray-300 p-2">{response.totalEmployees || 'N/A'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Intensity Trend */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Carbon Intensity Trend</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="carbonIntensity" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Renewable Energy Ratio */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Renewable Energy Ratio</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="renewableRatio" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diversity Ratio */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Diversity Ratio</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="diversityRatio" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Community Investment */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Community Investment Ratio</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="communityRatio" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === "detailed" && (
        <div className="space-y-4">
          {filteredResponses.map((response) => {
            const metrics = calculateMetrics(response)
            return (
              <div key={response.id} className="border rounded-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Fiscal Year: {response.fiscalYear}</h3>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(response.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800">Carbon Intensity</h4>
                    <p className="text-2xl font-bold text-red-600">{metrics.carbonIntensity.toFixed(6)}</p>
                    <p className="text-sm text-red-600">T CO2e/INR</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800">Renewable Energy</h4>
                    <p className="text-2xl font-bold text-green-600">{metrics.renewableRatio.toFixed(2)}%</p>
                    <p className="text-sm text-green-600">of total electricity</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800">Diversity Ratio</h4>
                    <p className="text-2xl font-bold text-purple-600">{metrics.diversityRatio.toFixed(2)}%</p>
                    <p className="text-sm text-purple-600">female employees</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800">Community Investment</h4>
                    <p className="text-2xl font-bold text-orange-600">{metrics.communityRatio.toFixed(4)}%</p>
                    <p className="text-sm text-orange-600">of revenue</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Financial Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">
                          {response.totalRevenueInr ? `₹${response.totalRevenueInr.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Investment:</span>
                        <span className="font-medium">
                          {response.communityInvestmentInr ? `₹${response.communityInvestmentInr.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Operational Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Employees:</span>
                        <span className="font-medium">{response.totalEmployees || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female Employees:</span>
                        <span className="font-medium">{response.femaleEmployees || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Training Hours:</span>
                        <span className="font-medium">{response.avgTrainingHours || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Data Privacy Policy:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        response.hasDataPrivacyPolicy 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {response.hasDataPrivacyPolicy ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Independent Board:</span>
                      <span className="ml-2 font-medium">
                        {response.independentBoardPct ? `${response.independentBoardPct}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Carbon Emissions:</span>
                      <span className="ml-2 font-medium">
                        {response.carbonEmissionsTco2e ? `${response.carbonEmissionsTco2e} T CO2e` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

