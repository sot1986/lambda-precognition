import { expect, it } from 'vitest'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { z } from 'zod'
import { definePrecognitiveHandler } from '../src/core'

interface LambdaResponse {
  statusCode: number
  headers: Record<string, string>
  body?: string
}

it ('returns a handler function', () => {
  const handler = definePrecognitiveHandler({
    main: () => Promise.resolve({ message: 'ok' }),
  }, [])

  expect(typeof handler).toBe('function')
})

function makeEvent(body?: object, headers?: Record<string, string>): APIGatewayProxyEventV2 {
  return {
    headers: {
      Content: 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    isBase64Encoded: false,
    routeKey: '',
    rawPath: '',
    rawQueryString: '',
    version: '',
    requestContext: {
      accountId: '',
      requestId: '',
      timeEpoch: 0,
      routeKey: '',
      stage: '',
      time: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
        method: 'POST',
        userAgent: '',
        path: '',
        protocol: '',
        sourceIp: '',
      },
    },
  }
}

it('calls before, main and after handlers in sequence', async () => {
  const event = makeEvent()
  const data: string[] = []

  const handler = definePrecognitiveHandler({
    main: async () => {
      data.push('main')
      return { message: 'ok' }
    },
    before: async () => {
      data.push('before')
    },
    after: async () => {
      data.push('after')
    },
  }, [])

  await handler(event)

  expect(data).toEqual(['before', 'main', 'after'])
})

it('returns success response if validation pass and precognitive header is true', async () => {
  const data = { name: 'Name' }
  const schema = z.object({
    name: z.string().min(3),
  })

  const event = makeEvent(data, { 'Precognitive': 'true', 'Precognition-Validate-Only': 'name' })

  const handlers: string[] = []

  const handler = definePrecognitiveHandler({
    before: (event) => {
      handlers.push('before')
      const data = JSON.parse(event.body!)
      schema.parse(data)
    },
    main: async () => {
      handlers.push('main')
      return { message: 'ok' }
    },
  }, ['ZOD_ERROR_PARSER'])

  const response = await handler(event) as LambdaResponse

  expect(response.statusCode).toBe(204)
  expect(response.headers.Precognition).toBe('true')
  expect(response.body).toBeUndefined()
  expect(response.headers['Content-Type']).toBe('application/json')
  expect(response.headers['Precognition-Success']).toBe('true')
  expect(response.headers['Precognition-Validate-Only']).toBe('name')
  expect(handlers).toEqual(['before'])
})

it('returns validation error if validation fails and precognitive header is true', async () => {
  const data = { name: '' }
  const schema = z.object({
    name: z.string().min(3),
  })

  const event = makeEvent(data, { 'Precognitive': 'true', 'Precognition-Validate-Only': 'name' })

  const handlers: string[] = []

  const handler = definePrecognitiveHandler({
    before: (event) => {
      handlers.push('before')
      const data = JSON.parse(event.body!)
      schema.parse(data)
    },
    main: async () => {
      handlers.push('main')
      return { message: 'ok' }
    },
  }, ['ZOD_ERROR_PARSER'])

  const response = await handler(event) as LambdaResponse

  expect(response.statusCode).toBe(422)
  expect(response.headers['Content-Type']).toBe('application/json')
  expect(JSON.parse(response.body!)).toEqual({
    message: 'String must contain at least 3 character(s)',
    errors: { name: ['String must contain at least 3 character(s)'] },
  })
  expect(response.headers.Precognition).toBe('true')
  expect(response.headers['Precognition-Success']).toBeUndefined()
  expect(response.headers['Precognition-Validate-Only']).toBe('name')
  expect(handlers).toEqual(['before'])
})

it('returns success if the validation error is not related to the validating key', async () => {
  const data = { name: 'Name', age: 18 }
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().min(21),
  })

  const event = makeEvent(data, { 'Precognitive': 'true', 'Precognition-Validate-Only': 'name' })

  const handler = definePrecognitiveHandler({
    before: (event) => {
      const data = JSON.parse(event.body!)
      schema.parse(data)
    },
    main: async () => {
      return { message: 'ok' }
    },
  }, ['ZOD_ERROR_PARSER'])

  const response = await handler(event) as LambdaResponse

  expect(response.statusCode).toBe(204)



})
