import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApi } from '../../hooks/useApi'

// Set up for testing the API
const API_URL = 'http://localhost:3000/api'

// Mock the config
vi.mock('../../config', () => ({
  API_URL: 'http://localhost:3000/api'
}))

// Mock fetch globally
let mockFetchSuccess = true
let mockResponseData = { success: true, data: { id: 1, name: 'Test' } }

global.fetch = vi.fn().mockImplementation((url, options) => {
  if (mockFetchSuccess) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    })
  } else {
    return Promise.resolve({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'Error message' }),
    })
  }
})

describe('useApi hook', () => {
  beforeEach(() => {
    mockFetchSuccess = true
    mockResponseData = { success: true, data: { id: 1, name: 'Test' } }
    vi.clearAllMocks()
  })
  
  it('initializes with default state', () => {
    const { result } = renderHook(() => useApi())
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.request).toBe('function')
  })
  
  it('makes a GET request correctly', async () => {
    const { result } = renderHook(() => useApi())
    
    let response: any
    
    await act(async () => {
      response = await result.current.request('/endpoint')
    })
    
    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/endpoint`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Object),
      })
    )
    
    // Check the state
    expect(result.current.data).toEqual({ id: 1, name: 'Test' })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    
    // Check the return value
    expect(response).toEqual({ id: 1, name: 'Test' })
  })
  
  it('makes a POST request with body correctly', async () => {
    const { result } = renderHook(() => useApi())
    
    const requestBody = { name: 'New Item', price: 99.99 }
    
    await act(async () => {
      await result.current.request('/endpoint', {
        method: 'POST',
        body: requestBody,
      })
    })
    
    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/endpoint`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(requestBody),
      })
    )
  })
  
  it('adds authorization header when requiresAuth is true', async () => {
    const { result } = renderHook(() => useApi())
    
    const token = 'test-token'
    
    await act(async () => {
      await result.current.request('/endpoint', {
        requiresAuth: true,
        token: token,
      })
    })
    
    // Check that fetch was called with the auth header
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/endpoint`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`,
        }),
      })
    )
  })
  
  it('throws an error when requiresAuth is true but no token is provided', async () => {
    const { result } = renderHook(() => useApi())
    
    let error: Error | null = null
    
    await act(async () => {
      try {
        await result.current.request('/endpoint', {
          requiresAuth: true,
          token: null,
        })
      } catch (e) {
        error = e as Error
      }
    })
    
    expect(error).not.toBeNull()
    expect(error?.message).toBe('Authentication required')
    expect(result.current.error).toBe('Authentication required')
  })
  
  it('handles API errors correctly', async () => {
    mockFetchSuccess = false
    
    const { result } = renderHook(() => useApi())
    
    let error: Error | null = null
    
    await act(async () => {
      try {
        await result.current.request('/endpoint')
      } catch (e) {
        error = e as Error
      }
    })
    
    // Check the error state
    expect(error).not.toBeNull()
    expect(error?.message).toBe('Error message')
    expect(result.current.error).toBe('Error message')
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })
  
  it('handles old and new response formats correctly', async () => {
    // Test with the new format (data field)
    mockResponseData = { success: true, data: { result: 'new format' } }
    
    const { result, rerender } = renderHook(() => useApi())
    
    await act(async () => {
      await result.current.request('/endpoint')
    })
    
    expect(result.current.data).toEqual({ result: 'new format' })
    
    // Test with the old format (no success/data fields)
    mockResponseData = { result: 'old format' }
    
    rerender()
    
    await act(async () => {
      await result.current.request('/endpoint')
    })
    
    expect(result.current.data).toEqual({ result: 'old format' })
  })
  
  it('sets loading state during requests', async () => {
    const { result } = renderHook(() => useApi())
    
    // Create a promise that resolves after a delay
    let resolveRequest: ((value: unknown) => void) | null = null
    const requestPromise = new Promise(resolve => {
      resolveRequest = resolve
    })
    
    global.fetch = vi.fn().mockImplementation(() => requestPromise)
    
    let requestPromiseResult: Promise<any> | null = null
    
    // Make the request but don't await it
    act(() => {
      requestPromiseResult = result.current.request('/endpoint')
    })
    
    // Loading should be true during the request
    expect(result.current.loading).toBe(true)
    
    // Now resolve the request
    await act(async () => {
      if (resolveRequest) {
        resolveRequest({
          ok: true,
          json: () => Promise.resolve({ result: 'success' }),
        })
      }
      await requestPromiseResult
    })
    
    // Loading should be false after the request
    expect(result.current.loading).toBe(false)
  })
})