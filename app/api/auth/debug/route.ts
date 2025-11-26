import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const appPassword = process.env.APP_PASSWORD
  
  return NextResponse.json({
    passwordExists: !!appPassword,
    passwordLength: appPassword?.length || 0,
    firstChar: appPassword?.charAt(0) || '',
    lastChar: appPassword?.charAt(appPassword.length - 1) || '',
    hasQuotes: appPassword?.startsWith('"') || appPassword?.startsWith("'"),
    trimmedLength: appPassword?.trim().length || 0,
  })
}
