import { describe, it } from 'mocha';
import { assert } from 'chai';
import { validate } from '../src';

// TODO Warn about missing schema.type
// TODO: Handle custom types: 'email', 'phoneNumber', ...
// TODO: Handle exceptions for arrays and objects...
// TODO: Warn about object type without fields
// TODO: warn about schema errors

describe('Data validation', () => {
  describe('validate()', () => {
    it('should return no errors on empty schema', (done) => {
      validate({}, {}).then(result => {
        assert.deepEqual(result, {});
        done();
      });
    });

    it('should return no errors on undefined schema', (done) => {
      validate(undefined, {}).then(result => {
        assert.deepEqual(result, {});
        done();
      });
    });

    it('should return no errors on null schema', (done) => {
      validate(null, {}).then(result => {
        assert.deepEqual(result, {});
        done();
      });
    });

    it('should return invalid-type error when specified type doesnt match', (done) => {
      const schema = { type: 'object' };
      const expectedResult = {
        errors: [
          {
            error: 'invalidType',
            message: 'Invalid data type',
          },
        ],
      };
      validate(schema, []).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return invalid-type error with custom message when specified type doesnt match', (done) => {
      const schema = { type: 'object', messages: { invalidType: 'Tipo de dato inválido' } };
      const expectedResult = {
        errors: [
          {
            error: 'invalidType',
            message: 'Tipo de dato inválido',
          },
        ],
      };
      validate(schema, []).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return is-required error when value is empty string', (done) => {
      const schema = { type: 'string', isRequired: true };
      const expectedResult = { errors: [{ error: 'isRequired' }] };

      validate(schema, '').then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return is-required error when value is null', (done) => {
      const schema = { type: 'string', isRequired: true };
      const expectedResult = { errors: [{ error: 'isRequired' }] };

      validate(schema, null).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return is-required when required object field is not provided', (done) => {
      const schema = {
        type: 'object',
        fields: {
          fieldName: { type: 'string', isRequired: true },
          fieldName2: { type: 'string', isRequired: false },
        },
      };
      const expectedResult = {
        fields: {
          fieldName: { errors: [{ error: 'isRequired' }] },
          fieldName2: { },
        },
      };

      validate(schema, { fieldName: '', fieldName2: '' }).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should not return error when required value is provided', (done) => {
      const schema = { type: 'string', isRequired: true };
      validate(schema, 'abc').then(result => {
        assert.deepEqual(result, { });
        done();
      });
    });

    it('should not return error when required object field is provided', (done) => {
      const schema = {
        type: 'object',
        fields: { name: { type: 'string', isRequired: true } },
      };
      const expectedResult = { fields: { name: { } } };
      validate(schema, { name: 'abc' }).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return min-length error', (done) => {
      const schema = { type: 'string', minLength: 5 };
      const expectedResult = { errors: [{ error: 'minLength' }] };
      validate(schema, 'abcd').then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should return max-length error', (done) => {
      const schema = { type: 'string', maxLength: 10 };
      const expectedResult = { errors: [{ error: 'maxLength' }] };
      validate(schema, 'abcde-abcde').then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should evaluate custom validation function', (done) => {
      const validationFunction = (value) =>
        (value === 'abc' ? { error: 'customError' } : null);
      const schema = { type: 'object', fields: {
        field1: { type: 'string', validation: validationFunction },
        field2: { type: 'string', validation: validationFunction },
      } };
      const expectedResult = { fields: {
        field1: { errors: [{ error: 'customError' }] },
        field2: { },
      } };
      validate(schema, { field1: 'abc', field2: 'abcde' }).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('should evaluate custom validation promise', (done) => {
      const validationFunction = (value) => new Promise((resolve) => {
        const error = (value === 'abc' ? { error: 'customError' } : null);
        resolve(error);
      });
      const schema = { type: 'object', fields: {
        field1: { type: 'string', validation: validationFunction },
        field2: { type: 'string', validation: validationFunction },
      } };
      const expectedResult = { fields: {
        field1: { errors: [{ error: 'customError' }] },
        field2: { },
      } };
      validate(schema, { field1: 'abc', field2: 'abcde' }).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });

    it('allow the use of a regular expression to add validations', (done) => {
      const schema = { type: 'object', fields: {
        correctChars: { type: 'string', regex: /^[a-zA-ZñÑ ]+$/ },
        incorrectChars: { type: 'string', regex: /^[a-zA-ZñÑ ]+$/ },
        correctNum: { type: 'string', regex: /^[0-9]+$/ },
        incorrectNum: { type: 'string', regex: /^[0-9]+$/ },
      } };
      const expectedResult = { fields: {
        correctChars: { },
        incorrectChars: { errors: [{ error: 'regex' }] },
        correctNum: { },
        incorrectNum: { errors: [{ error: 'regex' }] },
      } };
      const data = {
        correctChars: 'abcñ Ñ ABC',
        incorrectChars: '@abc',
        correctNum: '123',
        incorrectNum: '123a',
      };
      validate(schema, data).then(result => {
        assert.deepEqual(result, expectedResult);
        done();
      });
    });
  });
});
