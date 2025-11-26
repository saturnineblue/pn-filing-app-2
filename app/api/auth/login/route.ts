import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Trim whitespace from both passwords for comparison
    const submittedPassword = password?.trim()
    const appPassword = process.env.APP_PASSWORD?.trim()
    
    // Detailed logging for debugging
    console.log('=== LOGIN ATTEMPT ===')
    console.log('APP_PASSWORD exists:', !!appPassword)
    console.log('APP_PASSWORD value:', appPassword)
    console.log('APP_PASSWORD length:', appPassword?.length)
    console.log('Submitted password:', submittedPassword)
    console.log('Submitted password length:', submittedPassword?.length)
    console.log('Passwords match:', submittedPassword === appPassword)
    console.log('====================')
    
    if (!appPassword) {
      console.error('APP_PASSWORD environment variable is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (submittedPassword === appPassword) {
      const token = await new SignJWT({ authenticated: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'))

      const response = NextResponse.json({ success: true })
      
      response.cookies.set('pn-filer-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      
      return response
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
