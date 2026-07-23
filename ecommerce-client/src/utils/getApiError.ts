import axios from 'axios'

interface ErrorBody {
  message?: string
  errors?: string[]
}

export function getApiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ErrorBody>(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const body = error.response?.data
  return body?.message || body?.errors?.join(' ') || fallback
}
