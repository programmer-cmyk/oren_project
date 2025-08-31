import bcrypt from "bcryptjs"

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
}

export type ESGResponseData = {
  id?: string
  userId: string
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
  createdAt?: Date
  updatedAt?: Date
}

type PrismaClientType = any

async function getPrisma(): Promise<PrismaClientType | null> {
  try {
    const mod = await import("@prisma/client")
    const PrismaClient = (mod as any).PrismaClient
    if (!PrismaClient) return null
    const prisma = new PrismaClient()
    return prisma
  } catch {
    return null
  }
}

// In-memory fallback (non-persistent, for local/preview)
const mem = {
  usersById: new Map<string, User>(),
  userIdByEmail: new Map<string, string>(),
  responsesByKey: new Map<string, ESGResponseData>(), // key=userId|year
}
function rkey(userId: string, year: string) {
  return `${userId}|${year}`
}

export const db = {
  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    const prisma = await getPrisma()
    if (prisma) {
      const u = await prisma.user.findUnique({ where: { email } })
      return u
    }
    const id = mem.userIdByEmail.get(email)
    if (!id) return null
    return mem.usersById.get(id) ?? null
  },

  async getUserById(id: string): Promise<User | null> {
    const prisma = await getPrisma()
    if (prisma) {
      const u = await prisma.user.findUnique({ where: { id } })
      return u
    }
    return mem.usersById.get(id) ?? null
  },

  async createUser(name: string, email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10)
    const prisma = await getPrisma()
    if (prisma) {
      const u = await prisma.user.create({
        data: { name, email, passwordHash },
      })
      return u
    }
    const id = crypto.randomUUID()
    const u: User = { id, name, email, passwordHash, createdAt: new Date() }
    mem.usersById.set(id, u)
    mem.userIdByEmail.set(email, id)
    return u
  },

  // ESG Responses
  async upsertResponse(data: ESGResponseData): Promise<ESGResponseData> {
    const prisma = await getPrisma()
    if (prisma) {
      const r = await prisma.eSGResponse.upsert({
        where: { userId_fiscalYear: { userId: data.userId, fiscalYear: data.fiscalYear } },
        update: {
          totalElectricityKWh: data.totalElectricityKWh,
          renewableElectricityKWh: data.renewableElectricityKWh,
          totalFuelLiters: data.totalFuelLiters,
          carbonEmissionsTCO2e: data.carbonEmissionsTCO2e,
          totalEmployees: data.totalEmployees,
          femaleEmployees: data.femaleEmployees,
          avgTrainingHoursPerEmployee: data.avgTrainingHoursPerEmployee,
          communityInvestmentINR: data.communityInvestmentINR,
          independentBoardPct: data.independentBoardPct,
          hasDataPrivacyPolicy: data.hasDataPrivacyPolicy,
          totalRevenueINR: data.totalRevenueINR,
        },
        create: {
          userId: data.userId,
          fiscalYear: data.fiscalYear,
          totalElectricityKWh: data.totalElectricityKWh,
          renewableElectricityKWh: data.renewableElectricityKWh,
          totalFuelLiters: data.totalFuelLiters,
          carbonEmissionsTCO2e: data.carbonEmissionsTCO2e,
          totalEmployees: data.totalEmployees,
          femaleEmployees: data.femaleEmployees,
          avgTrainingHoursPerEmployee: data.avgTrainingHoursPerEmployee,
          communityInvestmentINR: data.communityInvestmentINR,
          independentBoardPct: data.independentBoardPct,
          hasDataPrivacyPolicy: data.hasDataPrivacyPolicy,
          totalRevenueINR: data.totalRevenueINR,
        },
      })
      return r
    }
    const key = rkey(data.userId, data.fiscalYear)
    const now = new Date()
    const existing = mem.responsesByKey.get(key)
    const rec: ESGResponseData = {
      ...data,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    mem.responsesByKey.set(key, rec)
    return rec
  },

  async getResponse(userId: string, fiscalYear: string): Promise<ESGResponseData | null> {
    const prisma = await getPrisma()
    if (prisma) {
      const r = await prisma.eSGResponse.findUnique({
        where: { userId_fiscalYear: { userId, fiscalYear } },
      })
      return r
    }
    return mem.responsesByKey.get(rkey(userId, fiscalYear)) ?? null
  },

  async listResponses(userId: string): Promise<ESGResponseData[]> {
    const prisma = await getPrisma()
    if (prisma) {
      const rows = await prisma.eSGResponse.findMany({
        where: { userId },
        orderBy: { fiscalYear: "asc" },
      })
      return rows
    }
    const res: ESGResponseData[] = []
    for (const value of mem.responsesByKey.values()) {
      if (value.userId === userId) res.push(value)
    }
    res.sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear))
    return res
  },
}
