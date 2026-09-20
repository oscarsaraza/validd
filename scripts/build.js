import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcFile = path.join(rootDir, 'src', 'index.js');
const libDir = path.join(rootDir, 'lib');

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const srcContent = fs.readFileSync(srcFile, 'utf8');

// 1. Build ESM output (lib/index.js)
fs.writeFileSync(path.join(libDir, 'index.js'), srcContent, 'utf8');

// 2. Build CommonJS output (lib/index.cjs)
const cjsContent = srcContent
  .replace(/^export const /gm, 'const ')
  + '\nmodule.exports = {\n  addSchemaDefaultErrorMessages,\n  validate,\n};\n';

fs.writeFileSync(path.join(libDir, 'index.cjs'), cjsContent, 'utf8');

// 3. Build TypeScript definition files (lib/index.d.ts & lib/index.d.cts)
const dtsContent = `export interface ValidationError {
  error: string;
  message?: string;
  [key: string]: any;
}

export interface ValidationResult {
  errors?: ValidationError[];
  fields?: Record<string, ValidationResult>;
  [key: string]: any;
}

export interface SchemaField {
  type?: 'string' | 'number' | 'object' | 'array' | string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  validation?: (value: any) => Promise<ValidationError | null | undefined> | ValidationError | null | undefined;
  messages?: Record<string, string>;
  fields?: Record<string, SchemaField>;
}

export function addSchemaDefaultErrorMessages<T extends Record<string, any>>(schema: T): T;
export function validate(schema: SchemaField | null | undefined, data: any): Promise<ValidationResult>;
`;

fs.writeFileSync(path.join(libDir, 'index.d.ts'), dtsContent, 'utf8');
fs.writeFileSync(path.join(libDir, 'index.d.cts'), dtsContent, 'utf8');

console.log('Build completed successfully: lib/index.js (ESM), lib/index.cjs (CJS), lib/index.d.ts (Types).');
