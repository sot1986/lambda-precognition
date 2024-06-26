import type { APIGatewayProxyEvent } from 'aws-lambda'

export type Middleware = (e: APIGatewayProxyEvent) => Promise<void> | void
