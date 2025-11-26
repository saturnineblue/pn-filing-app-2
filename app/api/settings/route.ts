import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.settings.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value
    })
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json() as Record<string, string>

    for (const [key, value] of Object.entries(updates)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
