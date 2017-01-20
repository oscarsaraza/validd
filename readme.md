# Validd

This is an attempt to create a simple data validation library.

To use it you need to create a validation schema.

```
const formSchema = {
  type: 'object',
  messages: { // Schema is filled with default error messages before evaluation.
    invalidType: 'Tipo de dato inválido',
    // ...
  },
  fields: {
    personName: {
      type: 'string',
      isRequired: true,
      minLength: 5,
      maxLength: 20,
      regex: /^[0-9]+$/,
      validation: customAsyncValidationFunction, // Allow sync/async validations
      messages: { // Custom error messages
        minLength: 'Must have at least 5 characters',
        maxLength: 'Text is too long...',
      },
    },
  },
};

const customAsyncValidationFunction = (value) => new Promise((resolve) => {
  const error = (value === 'abc' ? { error: 'customError' } : null);
  resolve(error);
});
```

To validate data just use the validate function

```
const dataToValidate = {
  personName: 'abcd',
};
validate(formSchema, dataToValidate)
  .then(validationResult => console.log(validationResut))
```

The validation result must have an structure similar to this.

```
const validationResultExample = {
  errors: [
    {
      error: 'invalid-type',
      message: 'Tipo de dato inválido',
    },
  ],
  fields: {
    personName: {
      errors: [
        {
          error: 'minLength',
          message: 'Debe tener al menos 5 caracteres.',
        },
      ],
    },
    emailsGroup: [
      {
        errors: [
          {
            error: 'email',
            message: 'Invalid email address',
          },
        ],
      },
    ],
  }, // Fields end
};
```
