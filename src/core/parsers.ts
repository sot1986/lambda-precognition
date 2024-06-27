import { ZodError } from 'zod'
import type { ValidationErrorParser } from './types'

function zodErrorParser(error: Error) {
  if (error instanceof ZodError) {
    const errors = {} as Record<string, string[]>
    error.errors.forEach((e) => {
      const key = e.path.join('.')
      if (key in errors) {
        (errors[key] ?? []).push(e.message)
        return
      }
      errors[key] = [e.message]
    })
    return { errors, message: 'Validation error' }
  }
  return null
}

export function resolveErrorParser(parser: ValidationErrorParser) {
  if (parser === 'ZOD_ERROR_PARSER') {
    return zodErrorParser
  }
  return parser
}
