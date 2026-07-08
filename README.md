# Billing Service API

## Project Overview
This project is a RESTful Billing Service API built with NestJS and TypeScript. It adheres to Domain-Driven Design (DDD), SOLID principles, and Clean Architecture. The application handles currencies, accounts, and automated billing generation based on well-defined business rules, using completely in-memory persistence.

---

## Architecture
The application is structured into domain-specific modules, promoting **Separation of Concerns (SoC)** and strict adherence to the **Single Responsibility Principle (SRP)**:
- **Currencies**: Manages supported currencies and their base monthly fees.
- **Accounts**: Handles account registration with specific thresholds and promotional rules.
- **Billing**: Isolates complex logic for transaction fee calculations and promotional discounts.
- **Repositories**: In-memory data store abstractions representing persistence without coupling business logic to actual database drivers.


### System Flow Diagram
```mermaid
flowchart LR
  Client([Client / Postman]) --> Interceptor[Logging Interceptor]
  Interceptor --> Guard{ApiKey Guard}
  
  Guard -- Valid --> CC[Currencies Controller]
  Guard -- Valid --> AC[Accounts Controller]
  Guard -- Valid --> BC[Billing Controller]

  CC --> CS[Currencies Service]
  AC --> AS[Accounts Service]
  BC --> BS[Billing Service]

  AS -. Validates Currency .-> CS
  BS -. Fetches Account .-> AS
  BS -. Fetches Currency .-> CS

  CS --> CR[(Currencies Repo)]
  AS --> AR[(Accounts Repo)]
```


Controllers are kept extremely thin—they only handle HTTP transport logic and validation, delegating entirely to domain services. Global interceptors and pipes cleanly validate user payloads.

## Folder Structure
```text
src/
├── accounts/
│   ├── dto/
│   ├── models/
│   ├── accounts.controller.ts
│   ├── accounts.module.ts
│   └── accounts.service.ts
├── billing/
│   ├── dto/
│   ├── models/
│   ├── billing.controller.ts
│   ├── billing.module.ts
│   └── billing.service.ts
├── common/
│   ├── guards/
│   ├── interceptors/
│   └── validators/
├── currencies/
│   ├── dto/
│   ├── models/
│   ├── currencies.controller.ts
│   ├── currencies.module.ts
│   └── currencies.service.ts
├── repositories/
│   ├── accounts.repository.ts
│   ├── currencies.repository.ts
│   └── repositories.module.ts
├── tests/
│   ├── accounts.service.spec.ts
│   ├── billing.service.spec.ts
│   └── currencies.service.spec.ts
├── app.module.ts
└── main.ts
```

## Requirements Met
- **Base Fee**: Checked. Derived dynamically from the `currency` passed.
- **Transaction Fees**: Checked. Applied automatically for all transactions over the specific account's `transactionThreshold`.
- **Promotional Discounts**: Checked. Validated securely using account creation date + configured days.
- **Error Handling**: Checked. Covers duplicate payloads, non-existent references, invalid dates, and invalid datatypes with proper 4xx codes.

## Additional Features Built-In
1. **API Key Authorization**: A static API key Guard protects endpoints against unauthorized modifications.
2. **Action Logging**: A Global HTTP Interceptor intercepts all requests seamlessly to log payloads, response times, and status results mimicking an APM/logging stream behavior.
3. **Docker-Compose Ready**: Contains fully portable configuration setup to execute natively as a container.

---

## Installation

1. Clone the repository and navigate into the project folder:
```bash
git clone <this-repo> && cd billing-service
```

2. Install all dependencies:
```bash
npm install
```

3. **Crucial setup**: Duplicate the example environment variables file so the application can retrieve the expected configuration:
```bash
cp .env.example .env
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Testing

The application includes both comprehensive Unit tests and End-to-End (E2E) tests.

```bash
# Run unit tests (Services & Logic)
npm run test

# Run e2e tests (Controllers, Validation & Network Layer)
npm run test:e2e
```
*Note: When running E2E tests, you will see `[ERR]` console logs. This is expected behavior, as the tests intentionally trigger `400`, `404`, and `409` exceptions to verify that the `LoggingInterceptor` securely catches and logs bad requests.*

## Running with Docker (Optional)

If you'd like to spin up the entire application smoothly inside a container without running local Node commands:

```bash
# Important: ensure .env exists first
cp .env.example .env

# Re-build and run detached to inject the .env variables
docker-compose up -d --build

# View application logs
docker-compose logs -f api
```
The application will map directly to **port 3000** locally.

---

## Swagger URL

With the application running locally, you can access the Swagger UI documentation at:
**http://localhost:3000/api/docs**

---

## Business Assumptions
1. **Transaction Fee**: As required, a transaction fee needs to be explicitly defined. It is assumed to be **£0.10 (10p)** for each transaction over the account's specified transaction threshold.
2. **Date Evaluation**: For promotional discounts (`Current Date <= Account Creation Date + Discount Days`), the "Current Date" evaluated is assumed to be the system date the bill is successfully *requested* (via `new Date()`).
3. **Discount Scope**: The promotional discount is applied as a percentage to the **subtotal** (which includes both the monthly base fee and any accrued transaction fees).
4. **Currencies**: A currency must be successfully initialized before creating accounts under that currency code.

## Design Decisions
1. **In-Memory Repositories**: A dedicated `RepositoriesModule` abstracts the basic `Map`-based storage. When moving to a persistent database (e.g., PostgreSQL), we can simply swap the provider injections without touching service logic.
2. **Custom Validators**: We created a custom `@IsAfter()` class-validator decorator. This allows us to transparently validate that `billingPeriodEnd` occurs chronologically after `billingPeriodStart` directly at the DTO layer, removing messy validation logic from controllers.
3. **Immutability**: Domain models use `readonly` properties heavily. This ensures services don't accidentally mutate objects after reading them from repositories.

## Future Improvements
1. **Persistence Integration**: Integrate `TypeORM` or `Prisma` to connect the repository layer directly to a PostgreSQL database.
2. **Monetary Precision**: Introduce a library like `dinero.js` or `currency.js` to handle floats accurately to avoid standard floating-point precision issues with deep arithmetic scaling over time.
3. **Automated End-to-End Testing**: Expand testing to full supertest HTTP E2E checks to guarantee controller validation matches actual JSON network payloads seamlessly.

## API Testing with Postman

We provide a Postman collection to simplify testing the business rules sequentially.

1. Download [postman_collection.json](./postman_collection.json).
2. Import it into Postman (`File → Import`).
3. The collection is already pre-configured to hit `http://localhost:3000` and automatically passes the required `x-api-key: secret-billing-api-key` header for every request.
4. Run the requests sequentially from top to bottom (Create Currency -> Create Account -> Calculate Bill) to observe the system working correctly.

---

## Example API Calls and Responses

**IMPORTANT**: Since the API Key Guard is enabled, all requests must contain the `x-api-key` header with the secret value: `secret-billing-api-key`.

### 1. Create Currency

**Request**
```bash
curl -X POST http://localhost:3000/currencies \
-H "Content-Type: application/json" \
-H "x-api-key: secret-billing-api-key" \
-d '{
  "currency": "USD",
  "monthlyFeeGbp": 20
}'
```

**Response (201 Created)**
```json
{
  "currency": "USD",
  "monthlyFeeGbp": 20
}
```

---

### 2. Create Account

**Request**
```bash
curl -X POST http://localhost:3000/accounts \
-H "Content-Type: application/json" \
-H "x-api-key: secret-billing-api-key" \
-d '{
  "accountId": "ACC001",
  "currency": "USD",
  "transactionThreshold": 100,
  "discountDays": 30,
  "discountRate": 20
}'
```

**Response (201 Created)**
```json
{
  "accountId": "ACC001",
  "currency": "USD",
  "transactionThreshold": 100,
  "discountDays": 30,
  "discountRate": 20,
  "createdAt": "2026-06-26T15:20:00.000Z"
}
```

---

### 3. Calculate Bill

**Request**
```bash
curl -X POST http://localhost:3000/accounts/ACC001/bill \
-H "Content-Type: application/json" \
-H "x-api-key: secret-billing-api-key" \
-d '{
  "billingPeriodStart": "2025-06-01",
  "billingPeriodEnd": "2025-06-30",
  "transactionCount": 150
}'
```

**Response (200 OK)**
```json
{
  "accountId": "ACC001",
  "currency": "USD",
  "billingPeriod": {
    "start": "2025-06-01",
    "end": "2025-06-30"
  },
  "baseFee": 20,
  "transactionThreshold": 100,
  "billableTransactions": 50,
  "transactionFeePerTransaction": 0.1,
  "transactionFees": 5,
  "subtotal": 25,
  "discountRate": 20,
  "discountApplied": 5,
  "total": 20
}
```
