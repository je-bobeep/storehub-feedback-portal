'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VALIDATION_RULES, CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS } from "@/lib/constants"
import { SubmissionData, SubmissionErrors, Category, SubCategory } from "@/lib/types"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface SubmissionFormProps {
  onSubmit?: (data: SubmissionData) => Promise<void>
  className?: string
}

export function SubmissionForm({ onSubmit, className = "" }: SubmissionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [subCategory, setSubCategory] = useState<SubCategory | ''>('')
  const [errors, setErrors] = useState<SubmissionErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const titleLength = title.length
  const descriptionLength = description.length
  const titleRemaining = VALIDATION_RULES.TITLE_MAX_LENGTH - titleLength
  const descriptionRemaining = VALIDATION_RULES.DESCRIPTION_MAX_LENGTH - descriptionLength

  // Available subcategories for selected category
  const availableSubCategories = category ? SUBCATEGORY_OPTIONS[category] : []

  // Reset subcategory when category changes
  useEffect(() => {
    if (category && category !== 'Beep') {
      setSubCategory('')
    }
  }, [category])

  const validateForm = (): boolean => {
    const newErrors: SubmissionErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters`
    } else if (title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be no more than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      newErrors.description = `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`
    } else if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be no more than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`
    }

    if (!category) {
      newErrors.category = 'Category is required'
    } else if (category !== 'Beep' && !subCategory) {
      newErrors.subCategory = 'Sub-category is required for this category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      await onSubmit?.({ 
        title: title.trim(), 
        description: description.trim(),
        category: category as Category,
        subCategory: subCategory || undefined
      })
      setSubmitSuccess(true)
      setTitle('')
      setDescription('')
      setCategory('')
      setSubCategory('')
      setErrors({})
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setSubCategory('')
    setErrors({})
    setSubmitSuccess(false)
    setSubmitError('')
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Submit Feedback
        </CardTitle>
        <p className="text-gray-600">
          Share your ideas and suggestions to help us improve our product.
        </p>
      </CardHeader>

      <CardContent>
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your feedback has been submitted successfully! Thank you for your input.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-green-700 underline"
                onClick={resetForm}
              >
                Submit another
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </Label>
              <span className={`text-xs ${titleRemaining < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                {titleRemaining} characters remaining
              </span>
            </div>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback..."
              maxLength={VALIDATION_RULES.TITLE_MAX_LENGTH}
              className={errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category *
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Category)} disabled={isSubmitting}>
                <SelectTrigger className={errors.category ? 'border-red-300 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                Sub-category {category && category !== 'Beep' && '*'}
              </Label>
              <Select 
                value={subCategory} 
                onValueChange={(value) => setSubCategory(value as SubCategory)}
                disabled={isSubmitting || !category || category === 'Beep'}
              >
                <SelectTrigger className={errors.subCategory ? 'border-red-300 focus:border-red-500' : ''}>
                  <SelectValue placeholder={
                    !category ? "Select a category first" : 
                    category === 'Beep' ? "No sub-category needed" :
                    "Select a sub-category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((subCat) => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subCategory && (
                <p className="text-sm text-red-600">{errors.subCategory}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <span className={`text-xs ${descriptionRemaining < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {descriptionRemaining} characters remaining
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your feedback, including why it's important and how it would help..."
              maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
              rows={6}
              className={errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || titleLength === 0 || descriptionLength === 0 || !category || (category !== 'Beep' && !subCategory)}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>

            {(title || description || category || subCategory) && !submitSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 