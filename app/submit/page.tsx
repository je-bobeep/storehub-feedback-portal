'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { FeedbackFormData } from '@/lib/types'
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, VALIDATION_RULES } from '@/lib/constants'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SubmitPage() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: '',
    description: '',
    category: '',
    subCategory: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const availableSubCategories = formData.category ? SUBCATEGORY_OPTIONS[formData.category as keyof typeof SUBCATEGORY_OPTIONS] : []
  const requiresSubCategory = formData.category && formData.category !== 'Beep'

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
      errors.title = `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters`
    } else if (formData.title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
      errors.title = `Title must be no more than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    } else if (formData.description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      errors.description = `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`
    } else if (formData.description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be no more than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`
    }

    if (!formData.category) {
      errors.category = 'Category is required'
    }

    if (requiresSubCategory && !formData.subCategory) {
      errors.subCategory = 'Sub-category is required for this category'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage('Your feature request has been submitted successfully! It is now visible with "Under Review" status.')
        setFormData({ title: '', description: '', category: '', subCategory: '' })
        setValidationErrors({})
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Failed to submit feedback')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category: value, 
      subCategory: '' // Reset subcategory when category changes
    }))
    // Clear validation errors for category and subcategory
    setValidationErrors(prev => {
      const { category, subCategory, ...rest } = prev
      return rest
    })
  }

  const handleAuthSuccess = (user: any) => {
    setUser(user)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Feature Requests</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-blue-600">Feature Requests</h1>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                  <Button 
                    variant="ghost"
                    onClick={() => setUser(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Feature Request</h1>
              <p className="text-gray-600">Share your ideas to help improve our BackOffice system.</p>
            </div>

            {submitStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{submitMessage}</AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{submitMessage}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">
                      Feature Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief, descriptive title for your feature request"
                      className={validationErrors.title ? 'border-red-300' : ''}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {validationErrors.title && (
                        <p className="text-sm text-red-600">{validationErrors.title}</p>
                      )}
                      <div className="text-sm text-gray-500 ml-auto">
                        {formData.title.length}/{VALIDATION_RULES.TITLE_MAX_LENGTH}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleCategoryChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.category}</p>
                    )}
                  </div>

                  {/* Sub-category */}
                  {availableSubCategories.length > 0 && (
                    <div>
                      <Label htmlFor="subCategory">
                        Sub-category {requiresSubCategory && <span className="text-red-500">*</span>}
                      </Label>
                      <Select 
                        value={formData.subCategory} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subCategory: value }))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={validationErrors.subCategory ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Select a sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubCategories.map((subCategory) => (
                            <SelectItem key={subCategory} value={subCategory}>
                              {subCategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.subCategory && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.subCategory}</p>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
                      rows={6}
                      className={validationErrors.description ? 'border-red-300' : ''}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {validationErrors.description && (
                        <p className="text-sm text-red-600">{validationErrors.description}</p>
                      )}
                      <div className="text-sm text-gray-500 ml-auto">
                        {formData.description.length}/{VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Link href="/">
                      <Button variant="outline" disabled={isSubmitting}>
                        Cancel
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Writing Tips</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Be specific and clear</li>
                      <li>• Explain the business value</li>
                      <li>• Include use cases</li>
                      <li>• Mention any workarounds</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Review Process</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Requests appear immediately with "Under Review" status</li>
                      <li>• Status updated as development progresses</li>
                      <li>• Duplicates will be merged</li>
                      <li>• You'll be notified of status changes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">BackOffice</Badge>
                    <p className="text-sm text-gray-600">Reports, CRM, inventory, employee management, billing</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">POS</Badge>
                    <p className="text-sm text-gray-600">Hardware, orders, payments, cashier operations</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Beep</Badge>
                    <p className="text-sm text-gray-600">Communication and notification features</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Sign In Required</span>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    You need to sign in to submit feature requests.
                  </p>
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)}
                    size="sm"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
} 