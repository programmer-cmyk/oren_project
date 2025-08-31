import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

// utility: coerce number or null safely
const toNum = (v: any) => (v === null || v === undefined || v === "" ? null : Number(v))

export async function GET(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const year = url.searchParams.get("year")

  if (year) {
    const item = await prisma.response.findUnique({
      where: { userId_fiscalYear: { userId: user.id, fiscalYear: year } },
    })
    return NextResponse.json({ data: item ?? null })
  }

  const items = await prisma.response.findMany({
    where: { userId: user.id },
    orderBy: { fiscalYear: "asc" },
  })
  return NextResponse.json({ data: items })
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()

  const fiscalYear: string = body.fiscalYear
  if (!fiscalYear) return NextResponse.json({ error: "Missing fiscalYear" }, { status: 400 })

  try {
    const data = {
      totalElectricityKwh: toNum(body.totalElectricityKwh ?? body.totalElectricityKWh),
      renewableElectricityKwh: toNum(body.renewableElectricityKwh ?? body.renewableElectricityKWh),
      totalFuelLiters: toNum(body.totalFuelLiters),
      carbonEmissionsTco2e: toNum(body.carbonEmissionsTco2e ?? body.carbonEmissionsTCO2e),
      totalEmployees: body.totalEmployees === "" ? null : Number(body.totalEmployees ?? null),
      femaleEmployees: body.femaleEmployees === "" ? null : Number(body.femaleEmployees ?? null),
      avgTrainingHours: toNum(body.avgTrainingHours ?? body.avgTrainingHoursPerEmployee),
      communityInvestmentInr: toNum(body.communityInvestmentInr ?? body.communityInvestmentINR),
      independentBoardPct: toNum(body.independentBoardPct),
      hasDataPrivacyPolicy:
        typeof body.hasDataPrivacyPolicy === "boolean"
          ? body.hasDataPrivacyPolicy
          : body.hasDataPrivacyPolicy === "Yes"
            ? true
            : body.hasDataPrivacyPolicy === "No"
              ? false
              : null,
      totalRevenueInr: toNum(body.totalRevenueInr ?? body.totalRevenueINR),
    }

    const saved = await prisma.response.upsert({
      where: { userId_fiscalYear: { userId: user.id, fiscalYear } },
      create: { userId: user.id, fiscalYear, ...data },
      update: data,
    })
    return NextResponse.json({ item: saved })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}
