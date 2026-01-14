/**
 * ViewPage Component Tests
 *
 * Unit tests for the ViewPage component.
 * Verifies that the component renders correctly with different data states.
 *
 * References:
 * - Testing Library Docs: https://testing-library.com/react
 * - Vitest Docs: https://vitest.dev/guide/
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useQuery } from 'convex/react'
import ViewPage from './ViewPage'

// Mock the Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))

// Mock the API
vi.mock('../../convex/_generated/api', () => ({
  api: {
    functions: {
      getMockData: vi.fn(),
    },
  },
}))

describe('ViewPage Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
  })

  it('should render loading state when data is undefined', () => {
    // Mock useQuery to return undefined (loading state)
    useQuery.mockReturnValue(undefined)

    render(<ViewPage />)

    expect(screen.getByText('Loading data from Convex...')).toBeInTheDocument()
    expect(screen.getByText('Connecting to real-time database')).toBeInTheDocument()
  })

  it('should render empty state when data array is empty', () => {
    // Mock useQuery to return empty array
    useQuery.mockReturnValue([])

    render(<ViewPage />)

    expect(screen.getByText('No data available in the database.')).toBeInTheDocument()
    expect(screen.getByText('Use the Update page to add some data.')).toBeInTheDocument()
  })

  it('should render data table with mock data', () => {
    // Mock useQuery to return sample data
    const mockData = [
      {
        _id: 'abc123',
        name: 'Alpha',
        value: 100,
        description: 'First item',
        _creationTime: Date.now(),
      },
      {
        _id: 'def456',
        name: 'Beta',
        value: 200,
        description: 'Second item',
        _creationTime: Date.now(),
      },
    ]
    useQuery.mockReturnValue(mockData)

    render(<ViewPage />)

    // Verify page title
    expect(screen.getByText('View Mock Data')).toBeInTheDocument()

    // Verify table headers
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()

    // Verify data rows
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
  })

  it('should render "None" for missing description', () => {
    const mockData = [
      {
        _id: 'abc123',
        name: 'Alpha',
        value: 100,
        description: null,
        _creationTime: Date.now(),
      },
    ]
    useQuery.mockReturnValue(mockData)

    render(<ViewPage />)

    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('should call useQuery with correct API function', () => {
    useQuery.mockReturnValue([])

    render(<ViewPage />)

    expect(useQuery).toHaveBeenCalled()
  })

  it('should display real-time updates info box', () => {
    useQuery.mockReturnValue([])

    render(<ViewPage />)

    expect(screen.getByText('Real-time Updates Active')).toBeInTheDocument()
    expect(
      screen.getByText(/This view is subscribed to changes in the Convex database/)
    ).toBeInTheDocument()
  })

  it('should display page description', () => {
    useQuery.mockReturnValue([])

    render(<ViewPage />)

    expect(
      screen.getByText(/This page displays real-time data from Convex/)
    ).toBeInTheDocument()
  })

  it('should truncate IDs in the table', () => {
    const mockData = [
      {
        _id: 'abcdefghijklmnopqrstuvwxyz',
        name: 'Test',
        value: 1,
        description: 'Test item',
        _creationTime: Date.now(),
      },
    ]
    useQuery.mockReturnValue(mockData)

    render(<ViewPage />)

    // ID should be truncated to 8 characters followed by ...
    expect(screen.getByText(/abcdefgh\.\.\./)).toBeInTheDocument()
  })

  it('should format creation time as localized string', () => {
    const timestamp = Date.now()
    const mockData = [
      {
        _id: 'abc123',
        name: 'Test',
        value: 1,
        description: 'Test item',
        _creationTime: timestamp,
      },
    ]
    useQuery.mockReturnValue(mockData)

    render(<ViewPage />)

    // The creation time should be formatted using toLocaleString
    const expectedDate = new Date(timestamp).toLocaleString()
    expect(screen.getByText(expectedDate)).toBeInTheDocument()
  })
})
