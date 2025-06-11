// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Node.js environment
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Mock console.error to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Add custom matchers for better test assertions
expect.extend({
  toBeValidResponse(received) {
    const pass = received.json && typeof received.json === 'function'
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Response object`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid Response object`,
        pass: false,
      }
    }
  },
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    pathname: '/test',
    query: {},
    asPath: '/test',
    route: '/test'
  })
}))

// Mock environment variables
process.env.ADMIN_PASSWORD = 'test-password'
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
process.env.GOOGLE_SHEETS_CLIENT_EMAIL = 'test@example.com'
process.env.GOOGLE_SHEETS_PRIVATE_KEY = 'test-key'

// Global test utilities
// Note: Using simpler fetch mock instead of node-fetch

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
}) 