'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { Feedback, Category } from '@/lib/types'
import { mockFeedback } from '@/lib/mock-data'
import { SORT_OPTIONS, CATEGORY_FILTER_OPTIONS, SUBCATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '@/lib/constants'
import { ArrowUp, AlertCircle, Calendar, ChevronRight, RefreshCw } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import FeedbackItem from '@/components/FeedbackItem'

export default function HomePage() {
  const { user, setUser } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('votes')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [subCategoryFilter, setSubCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showSignInAlert, setShowSignInAlert] = useState(false)

  useEffect(() => {
    loadFeedback()
    
    // Refresh data when user returns to the page (e.g., after submitting)
    const handleFocus = () => {
      loadFeedback()
    }
    
    // Also refresh every 10 seconds to catch new submissions
    const interval = setInterval(loadFeedback, 10000)
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  // Reset subcategory filter when main category changes
  useEffect(() => {
    setSubCategoryFilter('all')
  }, [categoryFilter])

  const loadFeedback = useCallback(async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/feedback')
      if (!response.ok) {
        throw new Error('Failed to fetch feedback')
      }
      
      const data = await response.json()
      if (data.success) {
        setAllFeedback(data.data)
        setFeedback(data.data)
      } else {
        setError(data.error || 'Failed to load feedback')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleVote = async (feedbackId: string) => {
    if (!user) {
      setShowSignInAlert(true)
      setTimeout(() => setShowSignInAlert(false), 3000)
      return
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, userId: user.email }),
      })

      const result = await response.json()

      if (result.success) {
        // Update both filtered and full feedback lists
        const updateFeedback = (items: Feedback[]) =>
          items.map(item =>
            item.id === feedbackId
              ? {
                  ...item,
                  votes: result.data.votes,
                  votedBy: result.data.voted
                    ? [...(item.votedBy || []), user.email]
                    : item.votedBy?.filter(email => email !== user.email) || [],
                }
              : item
          );

        setFeedback(updateFeedback);
        setAllFeedback(updateFeedback);
      }
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const handleAuthSuccess = (user: any) => {
    setUser(user)
    setShowSignInAlert(false)
  }

  const filteredAndSortedFeedback = feedback
    .filter(item => {
      // Main category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false
      }
      
      // Subcategory filter
      if (subCategoryFilter !== 'all' && item.subCategory !== subCategoryFilter) {
        return false
      }
      
      // Status filter - Updated to use the correct status mapping
      if (statusFilter !== 'all') {
        const statusMap: Record<string, string[]> = {
          'under-review': ['Under Review'],
          'in-progress': ['In Progress'],
          'completed': ['Completed']
        }
        if (!statusMap[statusFilter]?.includes(item.status)) return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'discussed':
          // For demo, sort by votes as a proxy for "discussed"
          return b.votes - a.votes
        default:
          return 0
      }
    })

  const getCategoryCount = (category: string) => {
    if (category === 'all') return feedback.length
    return feedback.filter(item => item.category === category).length
  }

  const getSubCategoryCount = (subCategory: string) => {
    if (subCategory === 'all') {
      if (categoryFilter === 'all') return feedback.length
      return feedback.filter(item => item.category === categoryFilter).length
    }
    return feedback.filter(item => 
      item.category === categoryFilter && item.subCategory === subCategory
    ).length
  }

  // Get available subcategories for current main category
  const availableSubCategories = categoryFilter !== 'all' && categoryFilter in SUBCATEGORY_FILTER_OPTIONS 
    ? SUBCATEGORY_FILTER_OPTIONS[categoryFilter as Category] 
    : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Feedback</p>
          <p className="text-gray-600">{error}</p>
          <Button onClick={loadFeedback} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Feature Requests</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <a href="/submit">Submit Request</a>
              </Button>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Welcome, {user.username}</span>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' })
                      setUser(null)
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sign-in Alert */}
      {showSignInAlert && (
        <div className="fixed top-20 right-4 z-50 w-80">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Please sign in to vote on feature requests.
              <Button 
                variant="link" 
                className="text-red-600 underline p-0 ml-1"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Requests</h1>
          <p className="text-gray-600">Vote on popular feature requests or submit your own ideas for consideration.</p>
        </div>

        {/* Main Category Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setCategoryFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Filter Tabs (shown when a main category is selected) */}
        {availableSubCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {availableSubCategories.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSubCategoryFilter(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    subCategoryFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Status Filter Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === option.value
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold">
                  {filteredAndSortedFeedback.length} Request{filteredAndSortedFeedback.length !== 1 ? 's' : ''}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadFeedback}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="space-y-4">
              {filteredAndSortedFeedback.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {item.category} → {item.subCategory || 'General'}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            item.status === 'Under Review' ? 'border-yellow-300 text-yellow-700' :
                            item.status === 'In Progress' ? 'border-blue-300 text-blue-700' :
                            'border-green-300 text-green-700'
                          }`}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(item.id)}
                          className="flex items-center space-x-1 hover:bg-blue-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                          <span>{item.votes}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAndSortedFeedback.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No feature requests found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About Feature Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  This platform allows merchants to submit, vote on, and track feature requests for our BackOffice system.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Submit your own feature ideas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Vote on requests you'd like to see
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Track the status of requests
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CATEGORY_FILTER_OPTIONS.slice(1).map((category) => (
                    <div key={category.value} className="flex items-center justify-between">
                      <button
                        onClick={() => setCategoryFilter(category.value)}
                        className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {category.label}
                      </button>
                      <span className="text-sm text-gray-500">{getCategoryCount(category.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Subcategories (when category is selected) */}
            {availableSubCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top {categoryFilter} Subcategories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableSubCategories.slice(1).map((subCategory) => (
                      <div key={subCategory.value} className="flex items-center justify-between">
                        <button
                          onClick={() => setSubCategoryFilter(subCategory.value)}
                          className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {subCategory.label}
                        </button>
                        <span className="text-sm text-gray-500">{getSubCategoryCount(subCategory.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">© 2025 Merchant BackOffice</span>
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toaster />
    </div>
  )
} 