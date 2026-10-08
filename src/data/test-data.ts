import { faker } from '@faker-js/faker';

/**
 * Datos de prueba 100% sintéticos, generados en cada ejecución.
 * Ningún nombre, correo, contraseña, dirección ni medio de pago es real.
 */

/** Término de búsqueda; se compra el primer resultado con stock. */
export const SEARCH_TERM = 'Pliers';

/** "Cash on Delivery" completa la compra sin pedir datos de tarjeta ni cuentas bancarias. */
export const PAYMENT_METHOD = 'cash-on-delivery';

export const MESSAGES = {
  emailRequired: 'Email is required',
  passwordRequired: 'Password is required',
  invalidCredentials: 'Invalid email or password',
  searchCaption: (term: string) => `Searched for: ${term}`,
  addedToCart: 'Product added to shopping cart.',
  paymentSuccess: 'Payment was successful',
  orderConfirmation: /^Thanks for your order! Your invoice number is INV-\d+\.$/,
} as const;

/** Correo en dominio reservado .test: nunca entrega correo real. */
function syntheticEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@example.test`;
}

/** Contraseña aleatoria que cumple la política (mayúscula, minúscula, número y símbolo). */
function syntheticPassword(): string {
  return `Qa1!${faker.string.alphanumeric(12)}`;
}

export function buildUser() {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    dob: faker.date.birthdate({ mode: 'age', min: 25, max: 60 }).toISOString().slice(0, 10),
    phone: faker.string.numeric(10),
    email: syntheticEmail('qa'),
    password: syntheticPassword(),
    address: {
      street: faker.location.street(),
      house_number: '1',
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: faker.location.zipCode('#####'),
    },
  };
}

export function buildInvalidCredentials() {
  return { email: syntheticEmail('no.existe'), password: syntheticPassword() };
}
