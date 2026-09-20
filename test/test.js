import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createRequire } from 'node:module'
import { validate, addSchemaDefaultErrorMessages } from '../lib/index.js'

const require = createRequire(import.meta.url)
const cjsModule = require('../lib/index.cjs')

describe('Data validation', () => {
  describe('validate()', () => {
    it('should return no errors on empty schema', async () => {
      const result = await validate({}, {})
      assert.deepEqual(result, {})
    })

    it('should return no errors on undefined schema', async () => {
      const result = await validate(undefined, {})
      assert.deepEqual(result, {})
    })

    it('should return no errors on null schema', async () => {
      const result = await validate(null, {})
      assert.deepEqual(result, {})
    })

    it('should return invalid-type error when specified type doesnt match', async () => {
      const schema = { type: 'object' }
      const expectedResult = { errors: [{ error: 'invalidType', message: 'Invalid data type' }] }
      const result = await validate(schema, [])
      assert.deepEqual(result, expectedResult)
    })

    it('should return invalid-type error with custom message when specified type doesnt match', async () => {
      const schema = { type: 'object', messages: { invalidType: 'Tipo de dato inválido' } }
      const expectedResult = { errors: [{ error: 'invalidType', message: 'Tipo de dato inválido' }] }
      const result = await validate(schema, [])
      assert.deepEqual(result, expectedResult)
    })

    it('should return is-required error when value is empty string', async () => {
      const schema = { type: 'string', isRequired: true }
      const expectedResult = { errors: [{ error: 'isRequired', message: 'The field is required' }] }
      const result = await validate(schema, '')
      assert.deepEqual(result, expectedResult)
    })

    it('should return is-required error when value is null', async () => {
      const schema = { type: 'string', isRequired: true }
      const expectedResult = { errors: [{ error: 'isRequired', message: 'The field is required' }] }
      const result = await validate(schema, null)
      assert.deepEqual(result, expectedResult)
    })

    it('should return is-required when required object field is not provided', async () => {
      const schema = {
        type: 'object',
        fields: {
          fieldName: { type: 'string', isRequired: true },
          fieldName2: { type: 'string', isRequired: false },
        },
      }
      const expectedResult = {
        fields: {
          fieldName: { errors: [{ error: 'isRequired', message: 'The field is required' }] },
          fieldName2: {},
        },
      }
      const result = await validate(schema, { fieldName: '', fieldName2: '' })
      assert.deepEqual(result, expectedResult)
    })

    it('should not return error when required value is provided', async () => {
      const schema = { type: 'string', isRequired: true }
      const result = await validate(schema, 'abc')
      assert.deepEqual(result, {})
    })

    it('should not return error when required object field is provided', async () => {
      const schema = { type: 'object', fields: { name: { type: 'string', isRequired: true } } }
      const expectedResult = { fields: { name: {} } }
      const result = await validate(schema, { name: 'abc' })
      assert.deepEqual(result, expectedResult)
    })

    it('should return min-length error', async () => {
      const schema = { type: 'string', minLength: 5 }
      const expectedResult = { errors: [{ error: 'minLength', message: 'This field must be larger' }] }
      const result = await validate(schema, 'abcd')
      assert.deepEqual(result, expectedResult)
    })

    it('should not return min-length error on empty string', async () => {
      const schema = { type: 'string', minLength: 5 }
      const expectedResult = {}
      const result = await validate(schema, '')
      assert.deepEqual(result, expectedResult)
    })

    it('should not return min-length error on undefined data', async () => {
      const schema = { type: 'string', minLength: 5 }
      const expectedResult = {}
      const result = await validate(schema, undefined)
      assert.deepEqual(result, expectedResult)
    })

    it('should return max-length error', async () => {
      const schema = { type: 'string', maxLength: 10 }
      const expectedResult = { errors: [{ error: 'maxLength', message: 'This field must be shorter' }] }
      const result = await validate(schema, 'abcde-abcde')
      assert.deepEqual(result, expectedResult)
    })

    it('should evaluate custom validation function', async () => {
      const validationFunction = value => (value === 'abc' ? { error: 'customError', message: 'Custom error' } : null)
      const schema = {
        type: 'object',
        fields: {
          field1: { type: 'string', validation: validationFunction },
          field2: { type: 'string', validation: validationFunction },
        },
      }
      const expectedResult = {
        fields: {
          field1: { errors: [{ error: 'customError', message: 'Custom error' }] },
          field2: {},
        },
      }
      const result = await validate(schema, { field1: 'abc', field2: 'abcde' })
      assert.deepEqual(result, expectedResult)
    })

    it('should evaluate custom validation promise', async () => {
      const validationFunction = value =>
        new Promise(resolve => {
          const error = value === 'abc' ? { error: 'customError', message: 'Custom error' } : null
          resolve(error)
        })
      const schema = {
        type: 'object',
        fields: {
          field1: { type: 'string', validation: validationFunction },
          field2: { type: 'string', validation: validationFunction },
        },
      }
      const expectedResult = {
        fields: {
          field1: { errors: [{ error: 'customError', message: 'Custom error' }] },
          field2: {},
        },
      }
      const result = await validate(schema, { field1: 'abc', field2: 'abcde' })
      assert.deepEqual(result, expectedResult)
    })

    it('allow the use of a regular expression to add validations', async () => {
      const schema = {
        type: 'object',
        fields: {
          correctChars: { type: 'string', regex: /^[a-zA-ZñÑ ]+$/ },
          incorrectChars: { type: 'string', regex: /^[a-zA-ZñÑ ]+$/ },
          correctNum: { type: 'string', regex: /^[0-9]+$/ },
          incorrectNum: { type: 'string', regex: /^[0-9]+$/ },
        },
      }
      const expectedResult = {
        fields: {
          correctChars: {},
          incorrectChars: { errors: [{ error: 'regex', message: 'The field value is invalid' }] },
          correctNum: {},
          incorrectNum: { errors: [{ error: 'regex', message: 'The field value is invalid' }] },
        },
      }
      const data = { correctChars: 'abcñ Ñ ABC', incorrectChars: '@abc', correctNum: '123', incorrectNum: '123a' }
      const result = await validate(schema, data)
      assert.deepEqual(result, expectedResult)
    })

    it('should return errors for each field on multiple fields schema', async () => {
      const schema = {
        type: 'object',
        fields: {
          numberField: { type: 'number', isRequired: true },
          textField: { type: 'string', isRequired: true },
        },
      }
      const expectedResult = {
        fields: {
          numberField: { errors: [{ error: 'isRequired', message: 'The field is required' }] },
          textField: { errors: [{ error: 'isRequired', message: 'The field is required' }] },
        },
      }
      const result = await validate(schema, {})
      assert.deepEqual(result, expectedResult)
    })

    it('should return errors on one fields on multiple fields schema', async () => {
      const schema = {
        type: 'object',
        fields: {
          numberField: { type: 'number', isRequired: true },
          textField: { type: 'string', isRequired: true },
        },
      }
      const expectedResult = {
        fields: {
          numberField: { errors: [{ error: 'isRequired', message: 'The field is required' }] },
          textField: {},
        },
      }
      const result = await validate(schema, { textField: '123' })
      assert.deepEqual(result, expectedResult)
    })

    it('should return error on array min length', async () => {
      const schema = { type: 'array', minLength: 3 }
      const expectedResult = { errors: [{ error: 'minLength', message: 'This field must be larger' }] }
      const result = await validate(schema, [1, 2])
      assert.deepEqual(result, expectedResult)
    })
  })

  describe('CommonJS compatibility', () => {
    it('should export validate and addSchemaDefaultErrorMessages via require()', async () => {
      assert.strictEqual(typeof cjsModule.validate, 'function')
      assert.strictEqual(typeof cjsModule.addSchemaDefaultErrorMessages, 'function')
      const result = await cjsModule.validate({}, {})
      assert.deepEqual(result, {})
    })
  })
})
