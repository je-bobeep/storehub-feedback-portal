import { NextResponse } from 'next/server'
import { SESSION_CONFIG } from '@/lib/constants'
import { AuthResponse } from '@/lib/types'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    } as AuthResponse)

    // Clear session cookie
    response.cookies.set(
      SESSION_CONFIG.USER_COOKIE_NAME,
      '',
      {
        ...SESSION_CONFIG.COOKIE_OPTIONS,
        maxAge: 0
      }
    )

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as AuthResponse, { status: 500 })
  }
} 