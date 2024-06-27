import { expect, it } from 'vitest'
import { z } from 'zod'
import { resolveErrorParser } from '../src/core/parsers'
import type { ValidationErrorParser } from '../src/core/types'

it('can resolve custom error parser', () => {
  const customParser: ValidationErrorParser = (error) => {
    return { message: error.message, errors: {
      name: ['Name is required'],
    } }
  }

  const parser = resolveErrorParser(customParser)

  const error = new Error('Custom error')
  const parsedError = parser(error)

  expect(parsedError).toEqual({
    message: 'Custom error',
    errors: { name: ['Name is required'] },
  })
})

it('can resolve zod error', () => {
  const schema = z.object({
    name: z.string().min(3),
  })
  const body = {
    name: '',
  }
  const result = schema.safeParse(body)
  const parser = resolveErrorParser('ZOD_ERROR_PARSER')

  if (result.success) {
    throw new Error('Expected Validation failed')
  }

  const parsedError = parser(result.error)

  expect(parsedError).toEqual({
    message: 'Validation error',
    errors: { name: ['String must contain at least 3 character(s)'] },
  })
})
