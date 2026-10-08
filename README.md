# Practice Software Testing – Automatización QA con Playwright

Flujo **Login → búsqueda → compra → validación → logout** sobre
[Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com/), una aplicación pública
creada para practicar testing.

**Tecnologías:** Playwright · TypeScript · Node.js · VS Code · Git

| Requisito                     | Dónde                                                               |
|---                            |---                                                                  |
| 1 Happy Path                  | `tests/e2e/purchase-happy-path.spec.ts`                             |
| 2 casos negativos             | `tests/auth/login-negative.spec.ts` (N1, N2)                        |
| 1 validación de datos         | `tests/validations/data-validation.spec.ts` (D1)                    |
| 1 validación de mensajes      | `tests/validations/messages.spec.ts` (M1)                           |
| Screenshots ante error        | `screenshot: 'only-on-failure'` en `playwright.config.ts`           |
| HTML Report                   | Reporter `html` → `playwright-report/`; publicado en GitHub Pages   |
| Trace                         | `trace: 'retain-on-failure'`; `npm run test:trace` lo graba siempre |
| Ejecución Chrome / Firefox    | Proyectos `chrome` y `firefox`                                      |

Playwright aporta el test runner, las assertions, el aislamiento (un `BrowserContext` por test),
el paralelismo, la ejecución en Chromium/Firefox/WebKit y los reportes.

## Instalación

Requisito: **Node.js 20 o superior**.

```bash
npm install
npm run install:browsers   # Google Chrome y Firefox
```

## Estructura

```
├── playwright.config.ts       # navegadores, reportes, trace, screenshots
├── src/
│   ├── data/test-data.ts      # datos sintéticos y mensajes esperados
│   ├── fixtures/test.fixtures.ts  # Page Objects y usuario de prueba como fixtures
│   ├── pages/                 # Page Object Model (Login, Catalog, Product, Checkout, Header)
│   └── utils/                 # registro de usuario vía API, parseo de montos
└── tests/
    ├── e2e/purchase-happy-path.spec.ts
    ├── auth/login-negative.spec.ts
    └── validations/
        ├── data-validation.spec.ts
        └── messages.spec.ts
```

## Tests

| Test | Qué valida |
|---|---|
| Happy Path | Login → buscar "Pliers" → abrir el primer resultado con stock → agregar al carrito → checkout con *Cash on Delivery* → mensaje de confirmación con número de factura → logout (y `/account` redirige al login) |
| N1 | Credenciales inválidas muestran "Invalid email or password" |
| N2 | Campos vacíos muestran "Email is required" y "Password is required" |
| D1 | En el carrito, subtotal = precio unitario × cantidad, y total = subtotal |
| M1 | Mensaje "Searched for: Pliers" y toast "Product added to shopping cart." |

**Stock variable:** es una demo compartida que reinicia su base de datos y cuyas compras agotan
productos, por eso los tests no fijan un producto: eligen el primero con stock de la búsqueda.

**Sin datos reales:** el usuario del Happy Path se registra vía API con datos sintéticos
generados por [faker](https://fakerjs.dev/) (correo `@example.test`, contraseña aleatoria). El pago
*Cash on Delivery* no pide tarjeta ni cuenta bancaria.

## Locators

- `getByTestId`: la app expone atributos `data-test` (configurado con `testIdAttribute: 'data-test'`).
- `getByRole`: botones y alertas por nombre accesible (`getByRole('button', { name: 'Check payment' })`).
- `getByText` y CSS solo cuando no hay alternativa.

## Assertions

Web-first con reintento automático (`toHaveText`, `toHaveURL`, `toBeVisible`, `toBeEnabled`,
`toHaveValue`) y de valores (`toBe`, `toBeCloseTo`) con mensajes que explican el fallo.

## Waits

Sin esperas fijas: auto-waiting de las acciones, assertions como esperas explícitas
(`expect(proceed).toBeEnabled()`), `waitForResponse` en la búsqueda y `waitForURL` en la navegación.

## Hooks

- `test.beforeEach` en los casos negativos: abre `/auth/login` antes de cada test.
- Fixtures (`test.fixtures.ts`): crean los Page Objects y el usuario de prueba antes de cada test.
- `test.step` divide el Happy Path en pasos visibles en el reporte y el trace.

## Ejecución

| Comando | Qué hace |
|---|---|
| `npm test` | Chrome + Firefox |
| `npm run test:chrome` / `test:firefox` | Un solo navegador |
| `npm run test:headed` | Con navegador visible |
| `npm run test:trace` | Graba trace de todos los tests |

## Reportes

`npm run report` abre el reporte HTML con pasos, screenshots, video y trace de los tests fallidos.
Las evidencias quedan en `test-results/`.

### Reporte publicado (CI)

Cada push a `main` ejecuta la suite en GitHub Actions (Chrome + Firefox) y publica el reporte HTML,
con video, screenshots y trace de cada test, en:

**https://byakko12.github.io/practicesoftwaretesting/**

## Debugging

| Herramienta | Comando |
|---|---|
| Inspector paso a paso | `npm run test:debug` |
| UI Mode | `npm run test:ui` |
| Trace Viewer | `npx playwright show-trace test-results/<carpeta>/trace.zip` (o desde el reporte) |
| Pausa en código | `await page.pause();` dentro del test |
