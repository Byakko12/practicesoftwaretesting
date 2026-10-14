import { APIRequestContext, expect } from '@playwright/test';
import { buildUser } from '../data/test-data';
import { env } from '../config/env';

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Registra un usuario desechable vía API con datos sintéticos.
 * Así no hay credenciales escritas en el código.
 */
export async function registerUser(api: APIRequestContext): Promise<TestUser> {
  const user = buildUser();
  const response = await api.post(`${env.apiURL}/users/register`, { data: user });
  expect(response.status(), `Registro fallido: ${await response.text()}`).toBe(201);
  return { email: user.email, password: user.password, fullName: `${user.first_name} ${user.last_name}` };
}
