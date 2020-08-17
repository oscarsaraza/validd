const isArray = value => typeof value === 'object' && value !== null && !isNaN(Number(value.length))

const getType = value => (isArray(value) ? 'array' : typeof value)

const resolveObjectPromises = object => {
  let promises = []
  const objectKeys = Object.keys(object)
  objectKeys.forEach(key => promises.push(object[key]))
  return Promise.all(promises).then(resolvedValues => {
    return resolvedValues.reduce((resolvedObject, property, index) => {
      resolvedObject[objectKeys[index]] = property
      return resolvedObject
    }, {})
  })
}

export const addSchemaDefaultErrorMessages = schema => {
  const defaultErrorMessages = {
    invalidType: 'Invalid data type',
    isRequired: 'The field is required',
    minLength: 'This field must be larger',
    maxLength: 'This field must be shorter',
    regex: 'The field value is invalid',
  }
  const schemaMessages = schema.messages || {}
  const messages = Object.keys(defaultErrorMessages)
    .map(errorType => ({ [errorType]: schemaMessages[errorType] || defaultErrorMessages[errorType] }))
    .reduce((prev, curr) => Object.assign({}, prev, curr), {})
  return Object.assign({}, schema, { messages })
}

export const validate = (schema, data) =>
  new Promise(resolve => {
    const result = {}
    if (!schema || Object.keys(schema).length === 0 || !schema.type) {
      resolve(result)
      return
    }

    schema = addSchemaDefaultErrorMessages(schema)
    const dataType = getType(data)
    if (data && dataType !== schema.type) {
      result.errors = result.errors || []
      result.errors.push({ error: 'invalidType', message: schema.messages['invalidType'] })
      resolve(result)
    }

    if (schema.isRequired && !data) {
      result.errors = result.errors || []
      result.errors.push({ error: 'isRequired', message: schema.messages['isRequired'] })
    }

    if (schema.type === 'object' && data !== null) {
      // null is also of type 'object'
      const fieldNames = schema.fields && Object.keys(schema.fields)
      const validationPromises = fieldNames
        .map(name => ({ [name]: validate(schema.fields[name], data[name]) }))
        .reduce((prev, curr) => {
          return Object.assign({}, prev, curr)
        }, {})
      resolveObjectPromises(validationPromises).then(fieldsValidationResult => {
        result.fields = fieldsValidationResult
        resolve(result)
      })
    } else if (schema.type === 'array') {
      resolve(result)
    } else if (schema.type === 'string') {
      if (schema.minLength) {
        if (!data || data.length === 0) {
          resolve(result)
        } else if (data.length < schema.minLength) {
          result.errors = result.errors || []
          result.errors.push({ error: 'minLength', message: schema.messages['minLength'] })
          resolve(result)
        }
      }
      if (schema.maxLength && data.length > schema.maxLength) {
        result.errors = result.errors || []
        result.errors.push({ error: 'maxLength', message: schema.messages['maxLength'] })
        resolve(result)
      }
      if (schema.validation) {
        if (typeof schema.validation === 'function') {
          const customValidationResult = schema.validation(data)
          if (customValidationResult && customValidationResult.then) {
            // Is a promise
            customValidationResult.then(promiseValidationResult => {
              if (promiseValidationResult) {
                result.errors = result.errors || []
                result.errors.push(promiseValidationResult)
              }
              resolve(result)
            })
          } else if (customValidationResult) {
            // Is a validation result
            result.errors = result.errors || []
            result.errors.push(customValidationResult)
          }
          resolve(result)
        }
      } else {
        resolve(result)
      }

      if (schema.regex && schema.regex instanceof RegExp) {
        if (!schema.regex.test(data)) {
          result.errors = result.errors || []
          result.errors.push({ error: 'regex', message: schema.messages['regex'] })
        }
        resolve(result)
      }
    } else if (schema.type === 'number') {
      resolve(result)
    } else {
      resolve(result)
    }
  })
