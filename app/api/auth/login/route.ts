import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === process.env.APP_PASSWORD) {
      await createSession()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
