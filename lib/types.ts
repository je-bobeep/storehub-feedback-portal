// Feedback Status Types
export type Status = 'Under Review' | 'In Progress' | 'Completed' | 'Declined'

// Category Types
export type Category = 'BackOffice' | 'POS' | 'Beep'

export type SubCategory = 
  // BackOffice subcategories
  | 'Reports' | 'Products' | 'CRM' | 'Stock management' 
  | 'Employee management' | 'Promotions' | 'Billing' | 'BackOffice Others'
  // POS subcategories
  | 'Hardware' | 'Order management' | 'Payments' 
  | 'Cashier management' | 'Receipts' | 'POS Others'
  // Beep has no subcategories

// Core Feedback Interface
export interface Feedback {
  id: string
  title: string
  description: string
  status: Status
  votes: number
  submittedAt: string
  updatedAt: string
  isApproved: boolean
  moderatedAt?: string
  moderatedBy?: string
  adminNotes?: string
  tags?: string[]
  category: Category
  subCategory?: SubCategory
  votedBy?: string[]
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FeedbackResponse extends ApiResponse {
  data?: Feedback[]
}

export interface SingleFeedbackResponse extends ApiResponse {
  data?: Feedback
}

export interface VoteResponse extends ApiResponse {
  data?: {
    id: string
    votes: number
    voted: boolean
  }
}

// Form Submission Types
export interface SubmissionData {
  title: string
  description: string
  category: Category
  subCategory?: SubCategory
}

export interface FeedbackFormData {
  title: string
  description: string
  category: string
  subCategory: string
}

export interface SubmissionErrors {
  title?: string
  description?: string
  category?: string
  subCategory?: string
  general?: string
}

// User Authentication Types
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  username: string
  email: string
  password: string
}

export interface AuthSession {
  user: User
  expiresAt: number
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  message?: string
}

// Admin Types
export interface AdminSession {
  isAuthenticated: boolean
  expiresAt: number
}

export interface DashboardStats {
  pendingCount: number
  totalFeedback: number
  topVotedFeedback: Feedback[]
}

// Moderation Types
export interface ModerationAction {
  feedbackId: string
  action: 'approve' | 'reject' | 'edit'
  adminNotes?: string
  editedTitle?: string
  editedDescription?: string
}

// Google Sheets Row Interface
export interface SheetsRow {
  id: string
  title: string
  description: string
  category: string
  subCategory: string
  status: Status
  votes: string
  submittedAt: string
  updatedAt: string
  isApproved: string
  moderatedAt: string
  moderatedBy: string
  adminNotes: string
  tags: string
}

// Rate Limiting Types
export interface RateLimit {
  windowStart: number
  requests: number
}

export interface RateLimitResponse {
  allowed: boolean
  remaining: number
  resetTime: number
} 