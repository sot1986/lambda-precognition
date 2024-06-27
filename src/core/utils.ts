import type { Middleware } from './types'

export function resolveHandlers(handlers?: Middleware | Middleware[]) {
  return Array.isArray(handlers)
    ? handlers
    : handlers
      ? [handlers]
      : []
}

export function createResponse(statusCode: number, body?: object, headers?: Record<string, string>) {
  if (body) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }
  }

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
}
