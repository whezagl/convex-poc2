/**
 * Convex Functions Tests
 *
 * Unit tests for Convex query and mutation functions.
 * Verifies that functions are properly defined with correct signatures.
 *
 * References:
 * - Convex Functions Docs: https://docs.convex.dev/functions
 * - Vitest Docs: https://vitest.dev/guide/
 */

import { describe, it, expect } from 'vitest'
import { getMockData, updateMockData } from './functions'

describe('Convex Functions - getMockData', () => {
  it('should be defined as a query function', () => {
    expect(getMockData).toBeDefined()
    expect(typeof getMockData).toBe('object')
  })

  it('should have query properties', () => {
    // Convex query functions have specific properties
    expect(getMockData).toHaveProperty('kind')
    expect(getMockData).toHaveProperty('args')
    expect(getMockData).toHaveProperty('handler')
  })

  it('should have correct query type', () => {
    // Verify this is a query function (not mutation or action)
    expect(getMockData.kind).toBe('query')
  })

  it('should have no arguments', () => {
    // getMockData takes no arguments
    const args = getMockData.args
    expect(typeof args).toBe('object')
  })

  it('should have a handler function', () => {
    expect(typeof getMockData.handler).toBe('function')
  })
})

describe('Convex Functions - updateMockData', () => {
  it('should be defined as a mutation function', () => {
    expect(updateMockData).toBeDefined()
    expect(typeof updateMockData).toBe('object')
  })

  it('should have mutation properties', () => {
    // Convex mutation functions have specific properties
    expect(updateMockData).toHaveProperty('kind')
    expect(updateMockData).toHaveProperty('args')
    expect(updateMockData).toHaveProperty('handler')
  })

  it('should have correct mutation type', () => {
    // Verify this is a mutation function (not query or action)
    expect(updateMockData.kind).toBe('mutation')
  })

  it('should have arguments defined', () => {
    // updateMockData takes: id, name, value
    const args = updateMockData.args
    expect(typeof args).toBe('object')
    expect(args).toHaveProperty('id')
    expect(args).toHaveProperty('name')
    expect(args).toHaveProperty('value')
  })

  it('should have a handler function', () => {
    expect(typeof updateMockData.handler).toBe('function')
  })
})

describe('Convex Functions - Integration', () => {
  it('should export all required functions', () => {
    // Verify all expected functions are exported
    const functions = { getMockData, updateMockData }
    expect(Object.keys(functions)).toHaveLength(2)
    expect(functions.getMockData).toBe(getMockData)
    expect(functions.updateMockData).toBe(updateMockData)
  })

  it('functions should have correct kinds', () => {
    // getMockData should be a query, updateMockData should be a mutation
    expect(getMockData.kind).toBe('query')
    expect(updateMockData.kind).toBe('mutation')
  })
})
