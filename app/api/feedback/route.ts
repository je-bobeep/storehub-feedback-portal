import { NextRequest, NextResponse } from 'next/server'
import { VALIDATION_RULES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'
import { SubmissionData, FeedbackResponse, SingleFeedbackResponse, Feedback } from '@/lib/types'
import { getAllFeedback, createFeedback } from '@/lib/database'

export async function GET() {
  try {
    // Get all feedback from database
    const allFeedback = await getAllFeedback()
    
    const response: FeedbackResponse = {
      success: true,
      data: allFeedback,
      message: `Retrieved ${allFeedback.length} feedback items`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error in GET /api/feedback:', error)
    
    const errorResponse: FeedbackResponse = {
      success: false,
      error: 'Failed to fetch feedback'
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SubmissionData
    const { title, description, category, subCategory } = body
    
    // Validation
    const errors: Record<string, string> = {}
    
    if (!title) {
      errors.title = ERROR_MESSAGES.TITLE_REQUIRED
    } else if (title.length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
      errors.title = ERROR_MESSAGES.TITLE_TOO_SHORT
    } else if (title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
      errors.title = ERROR_MESSAGES.TITLE_TOO_LONG
    }
    
    if (!description) {
      errors.description = ERROR_MESSAGES.DESCRIPTION_REQUIRED
    } else if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      errors.description = ERROR_MESSAGES.DESCRIPTION_TOO_SHORT
    } else if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      errors.description = ERROR_MESSAGES.DESCRIPTION_TOO_LONG
    }
    
    if (!category) {
      errors.category = ERROR_MESSAGES.CATEGORY_REQUIRED
    } else if (category !== 'Beep' && !subCategory) {
      errors.subCategory = ERROR_MESSAGES.SUBCATEGORY_REQUIRED
    }
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors
      }, { status: 400 })
    }
    
    // Create feedback in database
    const savedFeedback = await createFeedback({
      title: title.trim(),
      description: description.trim(),
      category: category,
      subCategory: subCategory
    })
    
    const response: SingleFeedbackResponse = {
      success: true,
      data: savedFeedback,
      message: SUCCESS_MESSAGES.FEEDBACK_SUBMITTED
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('❌ Error in POST /api/feedback:', error)
    
    const response: SingleFeedbackResponse = {
      success: false,
      error: ERROR_MESSAGES.SUBMISSION_FAILED
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 