/**
 * Basic test to verify Jest setup is working correctly
 */

describe('Jest Configuration', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true)
  })

  it('should have access to environment variables', () => {
    expect(process.env.ADMIN_PASSWORD).toBe('test-password')
    expect(process.env.NEXTAUTH_SECRET).toBe('test-secret')
  })

  it('should have mocked console available', () => {
    expect(console.log).toBeDefined()
    expect(typeof console.log).toBe('function')
  })
})

describe('TypeScript Types', () => {
  it('should compile TypeScript correctly', () => {
    const testString: string = 'Hello, TypeScript!'
    const testNumber: number = 42
    
    expect(typeof testString).toBe('string')
    expect(typeof testNumber).toBe('number')
  })
}) 