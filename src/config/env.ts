import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Variables por ambiente. Si una variable está definida en varios sitios, gana la primera:
 * 1. Variables del proceso (en CI: vars y secrets del Environment de GitHub)
 * 2. .env local (NO se sube: secretos y overrides personales)
 * 3. environments/<TEST_ENV>.env (se sube: solo URLs y valores no sensibles)
 */
// GitHub Actions pasa '' cuando una var no existe en el Environment: se trata como no definida
for (const key of ['TEST_ENV', 'BASE_URL', 'API_URL']) {
  if (process.env[key] === '') delete process.env[key];
}
dotenv.config({ quiet: true });

export const TEST_ENV = process.env.TEST_ENV || 'qa';

const ENVIRONMENTS_DIR = path.resolve(__dirname, '../../environments');
const envFile = path.join(ENVIRONMENTS_DIR, `${TEST_ENV}.env`);
if (!fs.existsSync(envFile)) {
  const available = fs.readdirSync(ENVIRONMENTS_DIR).map((f) => path.basename(f, '.env'));
  throw new Error(`TEST_ENV="${TEST_ENV}" no existe. Ambientes disponibles: ${available.join(', ')}`);
}
dotenv.config({ path: envFile, quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name} para el ambiente "${TEST_ENV}"`);
  return value;
}

/** Entero desde una variable; vacía o ausente → valor por defecto (GitHub pasa '' si la var no existe). */
export function intFromEnv(name: string, fallback: number): number {
  const value = process.env[name];
  return value ? Number.parseInt(value, 10) : fallback;
}

export const env = {
  name: TEST_ENV,
  baseURL: required('BASE_URL'),
  apiURL: required('API_URL'),
};

/**
 * Secretos: nunca se escriben en el código ni en environments/*.env.
 * Local → .env · CI → secrets del Environment de GitHub. Opcionales: el test que los usa se salta si faltan.
 */
export const secrets = {
  userEmail: process.env.TEST_USER_EMAIL,
  userPassword: process.env.TEST_USER_PASSWORD,
};
