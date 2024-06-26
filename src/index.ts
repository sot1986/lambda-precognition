import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { Middleware } from './types'

export function precognitiveHandler<T>(
  handlers: {
    before?: Middleware | Middleware[]
    main: (event: APIGatewayProxyEvent) => Promise<T>
    after?: Middleware | Middleware[]
  },
) {
  return async function handler(event: APIGatewayProxyEvent) {
    const beforeHandlers = resolveHandlers(handlers.before)
    const afterHandlers = resolveHandlers(handlers.after)

    if (isPrecognitiveRequest(event)) {
      return handlePrecognitiveRequest(event, beforeHandlers)
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

function resolveHandlers(handlers?: Middleware | Middleware[]) {
  return Array.isArray(handlers)
    ? handlers
    : handlers
      ? [handlers]
      : []
}

function wrapPrecognitiveHandler<T>(
  handler: (event: APIGatewayProxyEvent) => Promise<void>,
) {

}

function isPrecognitiveRequest(event: APIGatewayProxyEvent) {
  return event.headers.Precognitive === 'true'
}

async function handlePrecognitiveRequest(event: APIGatewayProxyEvent, beforeHandlers: Middleware[]) {
  try {
    for (const beforeHandler of beforeHandlers) {
      await beforeHandler(event)
    }
    return resolveSuccessPrecognitiveResponse(event)
  }
  catch (error) {

  }
}

function resolveSuccessPrecognitiveResponse(event: APIGatewayProxyEvent) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Precognition': 'true',
    'Precognition-Success': 'true',
  }
  if (event.headers['Validate-Only-key']) {
    headers['Validate-Only-key'] = event.headers['Validate-Only-key']
  }
  return {
    statusCode: 204,
    headers,
  }
}
