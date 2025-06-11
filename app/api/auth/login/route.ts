import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, isValidEmail } from '@/lib/auth-utils'
import { SESSION_CONFIG } from '@/lib/constants'
import { AuthResponse, LoginData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginData
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      } as AuthResponse, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      } as AuthResponse, { status: 400 })
    }

    // Authenticate user
    const user = authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      } as AuthResponse, { status: 401 })
    }

    // Create session
    const sessionData = {
      user,
      expiresAt: Date.now() + SESSION_CONFIG.USER_SESSION_DURATION
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Login successful'
    } as AuthResponse)

    // Set session cookie
    response.cookies.set(
      SESSION_CONFIG.USER_COOKIE_NAME,
      JSON.stringify(sessionData),
      {
        ...SESSION_CONFIG.COOKIE_OPTIONS,
        maxAge: SESSION_CONFIG.USER_SESSION_DURATION / 1000
      }
    )

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as AuthResponse, { status: 500 })
  }
} 