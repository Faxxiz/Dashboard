/**
 * Sports API service functions
 * All API calls are defined here
 */

import api from './axios'
import { AxiosError } from 'axios'

export interface Season {
  id: string
  year: number
  name: string
  startDate: string
  endDate: string
  sport: 'f1' | 'football' | 'basketball' | 'tennis'
}

interface ApiErrorResponse {
  message: string
  statusCode: number
  timestamp: string
}

/**
 * Get all seasons for a sport
 */
export async function getSeasons(sport: string = 'f1'): Promise<Season[]> {
  try {
    const response = await api.get<Season[]>(`/sports/${sport}/seasons`)
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse
      throw new Error(apiError.message || 'Failed to fetch seasons')
    }
    throw error
  }
}
