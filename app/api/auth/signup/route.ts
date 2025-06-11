import { NextRequest, NextResponse } from 'next/server'
import { createUser, userExists, isValidEmail, isValidUsername } from '@/lib/auth-utils'
import { SESSION_CONFIG } from '@/lib/constants'
import { AuthResponse, SignupData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SignupData
    const { username, email, password } = body

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username, email, and password are required'
      } as AuthResponse, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      } as AuthResponse, { status: 400 })
    }

    if (!isValidUsername(username)) {
      return NextResponse.json({
        success: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      } as AuthResponse, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      } as AuthResponse, { status: 400 })
    }

    // Check if user already exists
    if (userExists(email, username)) {
      return NextResponse.json({
        success: false,
        error: 'User with this email or username already exists'
      } as AuthResponse, { status: 409 })
    }

    // Create user
    const user = createUser(username, email, password)

    // Create session
    const sessionData = {
      user,
      expiresAt: Date.now() + SESSION_CONFIG.USER_SESSION_DURATION
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully'
    } as AuthResponse, { status: 201 })

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
    console.error('Signup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as AuthResponse, { status: 500 })
  }
} 