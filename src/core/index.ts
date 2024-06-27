import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { createResponse, resolveHandlers } from './utils'
import type { Middleware, ValidationErrorParser, ValidationErrorsData } from './types'
import { resolveErrorParser } from './parsers'

export function definePrecognitiveHandler<T>(
  handlers: {
    before?: Middleware | Middleware[]
    main: (event: APIGatewayProxyEventV2) => Promise<T>
    after?: Middleware | Middleware[]
  },
  errorParsers: ValidationErrorParser[],
) {
  return async function handler(event: APIGatewayProxyEventV2) {
    const beforeHandlers = resolveHandlers(handlers.before)
    const afterHandlers = resolveHandlers(handlers.after)

    if (event.headers.Precognitive === 'true') {
      return handlePrecognitiveRequest(event, beforeHandlers, errorParsers)
    }

    for (const beforeHandler of beforeHandlers) {
      await beforeHandler(event)
    }

    const result = await handlers.main(event)

    for (const afterHandler of afterHandlers) {
      await afterHandler(event)
    }

    return result
  }
}

async function handlePrecognitiveRequest(
  event: APIGatewayProxyEventV2,
  beforeHandlers: Middleware[],
  errorParsers: ValidationErrorParser[],
) {
  try {
    for (const beforeHandler of beforeHandlers) {
      await beforeHandler(event)
    }
    return resolveSuccessPrecognitiveResponse(event)
  }
  catch (err) {
    assertIsError(err)

    const data = errorParsers.reduce<ValidationErrorsData | null | undefined>((data, parser) => data ?? resolveErrorParser(parser)(err as Error), null)

    if (!data) {
      return createResponse(500, { message: err.message })
    }

    return handleValidationErrorsData(data, event)
  }
}

function assertIsError(err: unknown): asserts err is Error {
  if (!(err instanceof Error)) {
    throw new TypeError('Unexpected error')
  }
}

function resolveSuccessPrecognitiveResponse(event: APIGatewayProxyEventV2) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Precognition': 'true',
    'Precognition-Success': 'true',
  }
  if (event.headers['Precognition-Validate-Only']) {
    headers['Precognition-Validate-Only'] = event.headers['Precognition-Validate-Only']
  }
  return createResponse(204, undefined, headers)
}

function handleValidationErrorsData(
  errorsData: ValidationErrorsData,
  event: APIGatewayProxyEventV2,
) {
  if ('Precognition-Validate-Only' in event.headers && event.headers['Precognition-Validate-Only']) {
    const keys = event.headers['Precognition-Validate-Only'].split(',')
    return handlePartialValidationErrorsData(errorsData, keys)
  }

  return createResponse(422, errorsData, { Precognition: 'true' })
}

function handlePartialValidationErrorsData(
  errorsData: ValidationErrorsData,
  keys: string[],
) {
  const data: ValidationErrorsData = {
    errors: {},
    message: '',
  }

  keys.forEach((key) => {
    const errors = errorsData.errors[key]

    if (!errors) {
      return
    }

    data.errors[key] = errors

    if (data.message) {
      return
    }

    data.message = typeof errors == 'string' ? errors : (errors[0] ?? '')
  })

  if (!data.message) {
    return createResponse(204, undefined, { 'Precognition': 'true', 'Precognition-Success': 'true' })
  }

  return createResponse(
    422,
    data,
    { 'Precognition': 'true', 'Precognition-Validate-Only': keys.join(',') },
  )
}
