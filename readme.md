# Validd

A lightweight, **zero-dependency** data validation library for JavaScript and TypeScript.

- ⚡ **Zero dependencies**: 0 runtime dependencies, 0 build dependencies.
- 📦 **Dual package**: Native ES Modules (`import`) and CommonJS (`require`) support.
- 🔷 **TypeScript ready**: Built-in type definitions (`.d.ts`) included out of the box.
- 🚀 **Asynchronous & Synchronous**: Built-in support for sync and async validation rules.

---

## Installation

```bash
# Using npm
npm install validd

# Using pnpm
pnpm add validd

# Using yarn
yarn add validd
```

---

## Usage

### ES Modules (ESM)
```javascript
import { validate } from 'validd'
```

### CommonJS (CJS)
```javascript
const { validate } = require('validd')
```

---

## Defining a Schema

Create a schema defining the validation rules for your data:

```javascript
import { validate } from 'validd'

const customAsyncValidationFunction = (value) =>
  new Promise((resolve) => {
    const error = value === 'admin' ? { error: 'reservedName', message: 'Name is reserved' } : null
    resolve(error)
  })

const formSchema = {
  type: 'object',
  messages: {
    invalidType: 'Tipo de dato inválido',
  },
  fields: {
    personName: {
      type: 'string',
      isRequired: true,
      minLength: 5,
      maxLength: 20,
      regex: /^[a-zA-Z ]+$/,
      validation: customAsyncValidationFunction,
      messages: {
        minLength: 'Must have at least 5 characters',
        maxLength: 'Text is too long...',
      },
    },
  },
}
```

---

## Validating Data

Pass the schema and the object to validate. `validate` returns a Promise with the validation result:

```javascript
const dataToValidate = {
  personName: 'Alice',
}

const result = await validate(formSchema, dataToValidate)
console.log(result)
```

### Example Validation Result

If valid, an empty object or clean fields map is returned:
```javascript
{}
```

If errors are encountered:
```javascript
{
  errors: [
    {
      error: 'invalidType',
      message: 'Invalid data type',
    },
  ],
  fields: {
    personName: {
      errors: [
        {
          error: 'minLength',
          message: 'Must have at least 5 characters',
        },
      ],
    },
  },
}
```

---

## License

[ISC](file:///Users/oscar/code/validd/package.json) © Oscar Saraza
