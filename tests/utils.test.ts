import { expect, it } from 'vitest'
import { createResponse, resolveHandlers } from '../src/core/utils'

it.each([
  () => Promise.resolve(),
  [() => Promise.resolve()],
])('can resolve single or array middlewares handlers', (handlers) => {
  const resolvedHandlers = resolveHandlers(handlers)
  expect(resolvedHandlers).toBeInstanceOf(Array)
  expect(resolvedHandlers).toHaveLength(1)
  resolvedHandlers.forEach(handler => typeof handler === 'function')
})

it('creates a response object with status code and headers', () => {
  const response = createResponse(200, { message: 'ok' }, { 'X-Test': 'test' })

  expect(response).toEqual({
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Test': 'test',
    },
    body: '{"message":"ok"}',
  })

  const response2 = createResponse(200, undefined, { 'X-Test': 'test' })

  expect(response2).toEqual({
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Test': 'test',
    },
  })
})
