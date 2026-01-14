/**
 * Vitest Setup File
 *
 * This file is executed before each test file.
 * It configures global test utilities and matchers.
 *
 * References:
 * - Testing Library Docs: https://testing-library.com/docs/react-testing-library/setup
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test to avoid side effects
afterEach(() => {
  cleanup()
})

// Mock Convex imports for testing
// Tests can't connect to a real Convex backend, so we mock the hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../../convex/_generated/api', () => ({
  api: {
    functions: {
      getMockData: vi.fn(),
      updateMockData: vi.fn(),
    },
  },
}))

// Mock Convex React client
vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }) => children,
  ConvexReactClient: vi.fn(),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))
