# Serveless Precognition Validation

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Light package for adding precognition validation.
Inspired by [Laravel Precognition](https://laravel.com/docs/11.x/precognition), this package implements runtime validation.
It works great with [Nuxt-Precognition](https://www.npmjs.com/package/nuxt-precognition).

## How use it
1. Install it in your package.json:
   ```sh
   npm install lambda-precognition
   ```
2. Import the definePrecognitiveHandler from the package, and use it as main handler:

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

Notice that there are three "lifecycle hooks".
- `before`: put here validation logic. It runs before the main handler. In case of _precognitive request_, it will be the only function to be triggered.
- `main`: standard function where writing business logic.
- `after`: in case you need to trigger some other behaviours, you can leverage this hook,, that runs as final handler.

### What are validationParsers
ValidationParsers are simple functions that accept an Error as input parameter, and return ValidationErrorsData object (if any).

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

For more details please refer to (this repo)[https://github.com/sot1986/nuxt-precognition]

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-precognition/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-precognition

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-precognition.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-precognition

[license-src]: https://img.shields.io/npm/l/nuxt-precognition.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-precognition
