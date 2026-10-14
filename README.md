# Practice Software Testing – Automatización QA con Playwright

Flujo **Login → búsqueda → compra → validación → logout** sobre
[Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com/), una aplicación pública
creada para practicar testing.

**Tecnologías:** Playwright · TypeScript · Node.js · VS Code · Git

| Requisito                     | Dónde                                                                    |
|---                            |---                                                                       |
| 1 Happy Path                  | `tests/e2e/purchase-happy-path.spec.ts`                                  |
| 2 casos negativos             | `tests/auth/login-negative.spec.ts` (N1, N2)                             |
| 1 validación de datos         | `tests/validations/data-validation.spec.ts` (D1)                         |
| 1 validación de mensajes      | `tests/validations/messages.spec.ts` (M1)                                |
| Variables por ambiente        | `environments/<ambiente>.env` + `TEST_ENV` (`src/config/env.ts`)         |
| Secrets fuera del código      | `.env` local / GitHub Secrets → `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`  |
| Tags                          | `@smoke`, `@critical`, `@regression` (+ `@negative`, `@data`, `@messages`) |
| Retries controlados           | `RETRIES` (por defecto 2 en CI, 0 en local), `forbidOnly`, `maxFailures` |
| Screenshots ante error        | `screenshot: 'only-on-failure'` en `playwright.config.ts`                |
| HTML Report                   | Reporter `html` → `playwright-report/`; artefacto en CI + GitHub Pages   |
| Trace                         | `trace: 'retain-on-failure'`; en CI y con `npm run test:trace` siempre   |
| Ejecución Chrome / Firefox    | Proyectos `chrome` y `firefox`                                           |
| Ejecución automática          | `.github/workflows/playwright.yml`: PR, push a `main`, diario y manual   |

Playwright aporta el test runner, las assertions, el aislamiento (un `BrowserContext` por test),
el paralelismo, la ejecución en Chromium/Firefox/WebKit y los reportes.

## Instalación

Requisito: **Node.js 20 o superior**.

```bash
npm install
npm run install:browsers   # Google Chrome y Firefox
cp .env.example .env       # ambiente y secretos locales (opcional)
```

## Ambientes y secretos

| Archivo | Se sube | Contenido |
|---|---|---|
| `environments/qa.env` | Sí | URLs de la versión estable (por defecto) |
| `environments/with-bugs.env` | Sí | URLs de la versión con defectos sembrados |
| `.env` | **No** | `TEST_ENV`, secretos (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) y overrides |

Prioridad: variable del proceso (CI) → `.env` → `environments/<ambiente>.env`.
Para agregar un ambiente basta con crear `environments/<nombre>.env` con `BASE_URL` y `API_URL`.

```powershell
$env:TEST_ENV="with-bugs"; npm test     # PowerShell
TEST_ENV=with-bugs npm test             # bash
```

El test **C1** usa un usuario ya registrado cuyas credenciales llegan solo como secretos; si no
están definidos, se salta (por ejemplo en PRs desde forks, que no reciben secretos).

## Estructura

```
├── playwright.config.ts       # navegadores, reportes, trace, screenshots, retries
├── environments/              # variables NO sensibles por ambiente (qa, with-bugs)
├── .github/workflows/playwright.yml  # pipeline de QA
├── src/
│   ├── config/env.ts          # carga del ambiente y de los secretos
│   ├── data/test-data.ts      # datos sintéticos y mensajes esperados
│   ├── fixtures/test.fixtures.ts  # Page Objects y usuario de prueba como fixtures
│   ├── pages/                 # Page Object Model (Login, Catalog, Product, Checkout, Header)
│   └── utils/                 # registro de usuario vía API, parseo de montos
└── tests/
    ├── e2e/purchase-happy-path.spec.ts
    ├── auth/login-negative.spec.ts
    ├── auth/login-registered-user.spec.ts
    └── validations/
        ├── data-validation.spec.ts
        └── messages.spec.ts
```

## Tests

| Test | Qué valida |
|---|---|
| Happy Path | Login → buscar "Pliers" → abrir el primer resultado con stock → agregar al carrito → checkout con *Cash on Delivery* → mensaje de confirmación con número de factura → logout (y `/account` redirige al login) |
| C1 | Un usuario existente (credenciales desde secretos) inicia sesión |
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

## Tags

| Tag | Tests | Cuándo se ejecuta |
|---|---|---|
| `@smoke` | Happy Path, C1 | Verificación rápida de que la app funciona |
| `@critical` | Happy Path, C1, N1, D1 | Flujos que bloquean la salida si fallan |
| `@regression` | Todos | Suite completa |

## Ejecución

| Comando | Qué hace |
|---|---|
| `npm test` | Chrome + Firefox, todos los tests |
| `npm run test:smoke` / `test:critical` / `test:regression` | Filtra por tag |
| `npm run test:chrome` / `test:firefox` | Un solo navegador |
| `npm run test:headed` | Con navegador visible |
| `npm run test:trace` | Graba trace de todos los tests |
| `npm run test:list` | Lista los tests sin ejecutarlos |

Los argumentos se combinan: `npm run test:smoke -- --project=chrome`.

## Pipeline de QA (GitHub Actions)

| Evento | Suite | Reporte |
|---|---|---|
| Pull Request a `main` | `@smoke` + `@critical` | Artefacto descargable |
| Push a `main` | `@regression` | Artefacto + GitHub Pages |
| Programado (L-V 06:00 COT) | `@regression` | Artefacto + GitHub Pages |
| Manual (*Run workflow*) | Ambiente, suite y navegador a elegir | Artefacto (+ Pages si es `main`) |

Cada ejecución usa el *Environment* de GitHub del ambiente elegido (`qa` o `with-bugs`), de donde
toma los secretos y las variables opcionales (`BASE_URL`, `API_URL`, `RETRIES`, `WORKERS`).

## Reportes

`npm run report` abre el reporte HTML con pasos, screenshots, video y trace de los tests fallidos.
Las evidencias quedan en `test-results/`.

### Reporte publicado (CI)

Cada push a `main` y la ejecución diaria publican el reporte HTML (Chrome + Firefox), con video,
screenshots y trace de cada test, en:

**https://byakko12.github.io/practicesoftwaretesting/**

## Debugging

| Herramienta | Comando |
|---|---|
| Inspector paso a paso | `npm run test:debug` |
| UI Mode | `npm run test:ui` |
| Trace Viewer | `npx playwright show-trace test-results/<carpeta>/trace.zip` (o desde el reporte) |
| Pausa en código | `await page.pause();` dentro del test |
