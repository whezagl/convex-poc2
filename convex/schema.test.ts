/**
 * Convex Schema Tests
 *
 * Unit tests for the Convex schema definition.
 * Verifies that the schema is properly defined with the expected structure.
 *
 * References:
 * - Convex Schema Docs: https://docs.convex.dev/home
 * - Vitest Docs: https://vitest.dev/guide/
 */

import { describe, it, expect } from 'vitest'
import schema from './schema'

describe('Convex Schema', () => {
  it('should be defined', () => {
    expect(schema).toBeDefined()
    expect(typeof schema).toBe('object')
  })

  it('should have a mockData table', () => {
    // The schema should contain a mockData table definition
    expect(schema).toHaveProperty('mockData')
  })

  it('should have exactly one table', () => {
    const tables = Object.keys(schema)
    expect(tables.length).toBe(1)
    expect(tables).toContain('mockData')
  })

  it('mockData table should have correct structure', () => {
    // The mockData table is expected to have:
    // - name: string (required)
    // - value: number (required)
    // - description: string (optional)
    // - _id: auto-generated
    // - _creationTime: auto-generated

    const mockDataTable = schema.mockData

    expect(mockDataTable).toBeDefined()
    expect(typeof mockDataTable).toBe('object')

    // The table should have a validator with the field definitions
    expect(mockDataTable).toHaveProperty('validator')
  })

  it('should be exportable as default', () => {
    // Verify the schema can be imported as default export
    expect(typeof schema).toBe('object')
  })

  it('should have a table definition function', () => {
    // The table definition should be a function/object with validator property
    expect(typeof schema.mockData).toBe('object')
    expect(typeof schema.mockData.validator).toBe('object')
  })
})
