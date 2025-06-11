import { Status, Category, SubCategory } from './types'

// Status Values
export const STATUS_VALUES: Status[] = ['Under Review', 'In Progress', 'Completed']

// Category Configuration
export const CATEGORY_OPTIONS: Category[] = ['BackOffice', 'POS', 'Beep']

export const SUBCATEGORY_OPTIONS: Record<Category, SubCategory[]> = {
  'BackOffice': [
    'Reports',
    'Products', 
    'CRM',
    'Stock management',
    'Employee management',
    'Promotions',
    'Billing',
    'BackOffice Others'
  ],
  'POS': [
    'Hardware',
    'Order management',
    'Payments',
    'Cashier management', 
    'Receipts',
    'POS Others'
  ],
  'Beep': [] // No subcategories for Beep
}

export const STATUS_COLORS = {
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Declined': 'bg-red-100 text-red-800 border-red-200',
} as const

// Validation Rules
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  ADMIN_PASSWORD_MIN_LENGTH: 8
} as const

// Rate Limiting
export const RATE_LIMITS = {
  VOTE_WINDOW: 60 * 1000, // 1 minute in milliseconds
  VOTE_MAX_REQUESTS: 5,
  SUBMISSION_WINDOW: 60 * 60 * 1000, // 1 hour in milliseconds  
  SUBMISSION_MAX_REQUESTS: 10,
  GENERAL_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000'),
  GENERAL_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
} as const

// Session Configuration
export const SESSION_CONFIG = {
  ADMIN_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  USER_SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  ADMIN_COOKIE_NAME: 'feedback-fusion-admin',
  USER_COOKIE_NAME: 'feedback-fusion-user',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  }
} as const

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 10000 // 10 seconds
} as const

// Google Sheets Configuration
export const SHEETS_CONFIG = {
  BATCH_SIZE: 100,
  HEADERS: [
    'ID',
    'Title', 
    'Description',
    'Category',
    'Sub-category',
    'Status',
    'Votes',
    'Submitted At',
    'Updated At',
    'Is Approved',
    'Moderated At',
    'Moderated By',
    'Admin Notes',
    'Tags',
    'Voted By'
  ] as string[]
} as const

// Error Messages
export const ERROR_MESSAGES = {
  // Validation Errors
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_SHORT: `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters`,
  TITLE_TOO_LONG: `Title must be no more than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`,
  DESCRIPTION_REQUIRED: 'Description is required',
  DESCRIPTION_TOO_SHORT: `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must be no more than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
  CATEGORY_REQUIRED: 'Category is required',
  SUBCATEGORY_REQUIRED: 'Sub-category is required for this category',
  
  // Authentication Errors
  INVALID_PASSWORD: 'Invalid admin password',
  SESSION_EXPIRED: 'Admin session has expired',
  UNAUTHORIZED: 'Unauthorized access',
  
  // API Errors
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  FEEDBACK_NOT_FOUND: 'Feedback not found',
  INVALID_FEEDBACK_ID: 'Invalid feedback ID',
  SUBMISSION_FAILED: 'Failed to submit feedback',
  VOTE_FAILED: 'Failed to record vote',
  
  // Server Errors
  INTERNAL_ERROR: 'Internal server error',
  SHEETS_ERROR: 'Google Sheets operation failed',
  DATABASE_ERROR: 'Database operation failed'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully!',
  VOTE_RECORDED: 'Vote recorded successfully!',
  FEEDBACK_APPROVED: 'Feedback approved successfully',
  FEEDBACK_REJECTED: 'Feedback rejected successfully',
  STATUS_UPDATED: 'Status updated successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful'
} as const

// Sorting and Display Options
export const SORT_OPTIONS = [
  { value: 'votes', label: 'Most Voted' },
  { value: 'newest', label: 'Most Recent' },
  { value: 'discussed', label: 'Most Discussed' }
] as const

// Status Filter Options
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
] as const

// Main Category Filter Options (for top tabs)
export const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'BackOffice', label: 'BackOffice' },
  { value: 'POS', label: 'POS' },
  { value: 'Beep', label: 'Beep' }
] as const

// Subcategory Filter Options (shown when a main category is selected)
export const SUBCATEGORY_FILTER_OPTIONS: Record<Category, { value: string; label: string }[]> = {
  'BackOffice': [
    { value: 'all', label: 'All BackOffice' },
    { value: 'Reports', label: 'Reports' },
    { value: 'Products', label: 'Products' },
    { value: 'CRM', label: 'CRM' },
    { value: 'Stock management', label: 'Stock management' },
    { value: 'Employee management', label: 'Employee management' },
    { value: 'Promotions', label: 'Promotions' },
    { value: 'Billing', label: 'Billing' },
    { value: 'BackOffice Others', label: 'BackOffice Others' }
  ],
  'POS': [
    { value: 'all', label: 'All POS' },
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Order management', label: 'Order management' },
    { value: 'Payments', label: 'Payments' },
    { value: 'Cashier management', label: 'Cashier management' },
    { value: 'Receipts', label: 'Receipts' },
    { value: 'POS Others', label: 'POS Others' }
  ],
  'Beep': [
    { value: 'all', label: 'All Beep' }
  ]
}

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  VOTES: 0,
  STATUS: 'Under Review' as Status,
  IS_APPROVED: false
} as const

// Authentication
export const SESSION_COOKIE_NAME = 'feedback_session'
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-chars-long'

export const STATUS_CONFIG: Record<Status, { bgColor: string; textColor: string }> = {
  'Under Review': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  'In Progress': { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  Completed: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
  Declined: { bgColor: 'bg-red-100', textColor: 'text-red-800' },
} 