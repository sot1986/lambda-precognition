# Serveless Precognition Validation

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Light package for adding precognition validation.
Inspired by [Laravel Precognition](https://laravel.com/docs/11.x/precognition), this package implements runtime validation.
It works great with [Nuxt-Precognition](https://www.npmjs.com/package/nuxt-precognition).

## How use it
Import the definePrecognitiveHandler from the package, and use it as Lambda funcation handler:

```ts
import { definePrecognitiveHandler } from 'lambda-precognition'

export const handler = definePrecognitiveHandler({
  before: async (event) => {
    // request body validation handler
  },
  main: async (event) => {
    // main logic handler
  },
  after: async (event) => {
    // after response handler
  },
}, [/* ValidationParsers */])
```

### What are validationParsers
ValidationParsers are simple functions that accept and Error parameters and extrace the ValidationErrorsData object (if any).

```ts
export type ValidationErrors = Record<string, string | string[]>

export interface ValidationErrorsData {
  message: string
  errors: ValidationErrors
}

export type ValidationErrorParser = (error: Error) => ValidationErrorsData | undefined | null
```

User can define any parser, based on the validation library used.
To simplify usage, `ZodErrorParser` is already defined, and it can be used like that:

```ts
export const handler = definePrecognitiveHandler({
  before: async (event) => {
    body = JSON.parse(event.body!)
    schema.parse(body)
  },
  main: async (event) => {
    // main logic handler
  }
}, ['ZOD_ERROR_PARSER'])
```
