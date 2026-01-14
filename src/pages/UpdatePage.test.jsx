/**
 * UpdatePage Component Tests
 *
 * Unit tests for the UpdatePage component.
 * Verifies that the component renders correctly and handles form interactions.
 *
 * References:
 * - Testing Library Docs: https://testing-library.com/react
 * - Vitest Docs: https://vitest.dev/guide/
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery, useMutation } from 'convex/react'
import UpdatePage from './UpdatePage'

// Mock the Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

// Mock the API
vi.mock('../../convex/_generated/api', () => ({
  api: {
    functions: {
      getMockData: vi.fn(),
      updateMockData: vi.fn(),
    },
  },
}))

describe('UpdatePage Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
  })

  it('should render loading state when data is undefined', () => {
    // Mock useQuery to return undefined (loading state)
    useQuery.mockReturnValue(undefined)

    render(<UpdatePage />)

    expect(screen.getByText('Loading data from Convex...')).toBeInTheDocument()
    expect(screen.getByText('Connecting to real-time database')).toBeInTheDocument()
  })

  it('should render empty state when data array is empty', () => {
    // Mock useQuery to return empty array
    useQuery.mockReturnValue([])

    render(<UpdatePage />)

    expect(screen.getByText('No data available in the database.')).toBeInTheDocument()
    expect(
      screen.getByText('Please seed the database first using the data seeding script.')
    ).toBeInTheDocument()
  })

  it('should render form with record selector when data exists', () => {
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    expect(screen.getByText('Select Record to Update:')).toBeInTheDocument()
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Value:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update Record' })).toBeInTheDocument()
  })

  it('should populate form when record is selected', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    expect(screen.getByDisplayValue('Alpha')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
  })

  it('should show validation error when submitting without selecting record', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn()
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    expect(screen.getByText('Please select a record to update.')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should show validation error when name is empty', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn()
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const nameInput = screen.getByLabelText('Name:')
    await user.clear(nameInput)
    await user.type(nameInput, '   ')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    expect(screen.getByText('Name cannot be empty.')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should show validation error when value is not a number', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn()
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const valueInput = screen.getByLabelText('Value:')
    await user.clear(valueInput)
    await user.type(valueInput, 'invalid')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    expect(screen.getByText('Value must be a valid number.')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should call mutation with correct arguments on valid submit', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn().mockResolvedValue('abc123')
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const nameInput = screen.getByLabelText('Name:')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')

    const valueInput = screen.getByLabelText('Value:')
    await user.clear(valueInput)
    await user.type(valueInput, '250')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: 'abc123',
        name: 'Updated Name',
        value: 250,
      })
    })
  })

  it('should show success message after successful update', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn().mockResolvedValue('abc123')
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Record updated successfully! Check the View page to see the change.')
      ).toBeInTheDocument()
    })
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    let resolveUpdate
    const mockUpdate = vi.fn(() => new Promise((resolve) => (resolveUpdate = resolve)))
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    // Button should be disabled while submitting
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Updating...')).toBeInTheDocument()

    // Resolve the mutation
    resolveUpdate()
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should show error message when mutation fails', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    const mockUpdate = vi.fn().mockRejectedValue(new Error('Network error'))
    useMutation.mockReturnValue(mockUpdate)

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const submitButton = screen.getByRole('button', { name: 'Update Record' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to update record/)).toBeInTheDocument()
    })
  })

  it('should display selected record info when record is selected', async () => {
    const user = userEvent.setup()
    const mockData = [
      {
        _id: 'abc123',
        name: 'Alpha',
        value: 100,
        description: 'Test description',
        _creationTime: 1234567890000,
      },
    ]
    useQuery.mockReturnValue(mockData)
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    expect(screen.getByText('Current Record Details')).toBeInTheDocument()
    expect(screen.getByText(/abc123\.\.\./)).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render info box about real-time updates', () => {
    useQuery.mockReturnValue([])
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    expect(screen.getByText('Real-time Update Demo')).toBeInTheDocument()
    expect(
      screen.getByText(/Open the View page in a separate browser window/)
    ).toBeInTheDocument()
  })

  it('should disable form inputs when no record is selected', () => {
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    const nameInput = screen.getByLabelText('Name:')
    const valueInput = screen.getByLabelText('Value:')

    expect(nameInput).toBeDisabled()
    expect(valueInput).toBeDisabled()
  })

  it('should enable form inputs when record is selected', async () => {
    const user = userEvent.setup()
    const mockData = [
      { _id: 'abc123', name: 'Alpha', value: 100, description: 'First', _creationTime: Date.now() },
    ]
    useQuery.mockReturnValue(mockData)
    useMutation.mockReturnValue(vi.fn())

    render(<UpdatePage />)

    const select = screen.getByLabelText('Select Record to Update:')
    await user.selectOptions(select, 'abc123')

    const nameInput = screen.getByLabelText('Name:')
    const valueInput = screen.getByLabelText('Value:')

    expect(nameInput).not.toBeDisabled()
    expect(valueInput).not.toBeDisabled()
  })
})
