import type { APIGatewayProxyEventV2 } from 'aws-lambda'

export type Middleware = (event: APIGatewayProxyEventV2) => Promise<void> | void

export type ValidationErrors = Record<string, string | string[]>
export interface ValidationErrorsData {
  message: string
  errors: ValidationErrors
}

export type KnownErrorParser = 'ZOD_ERROR_PARSER'

export type ValidationErrorParser = ((error: Error) => ValidationErrorsData | undefined | null) | KnownErrorParser

export {}
