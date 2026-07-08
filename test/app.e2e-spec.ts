import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// Use default import for supertest since tsconfig esModuleInterop might be off/on depending on Nest versions
const supertest = require('supertest');

describe('Billing Service API (e2e)', () => {
  let app: INestApplication;
  const API_KEY = 'secret-billing-api-key';

  beforeAll(async () => {
    // Inject the mock API key into the process environment for the e2e test
    process.env.API_KEY = API_KEY;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // We must mirror the global pipes used in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Security', () => {
    it('should reject requests without a valid API key', () => {
      return supertest(app.getHttpServer())
        .post('/currencies')
        .send({ currency: 'USD', monthlyFeeGbp: 20 })
        .expect(401);
    });
  });

  describe('/currencies (POST)', () => {
    it('should securely create a new currency', () => {
      return supertest(app.getHttpServer())
        .post('/currencies')
        .set('x-api-key', API_KEY)
        .send({ currency: 'USD', monthlyFeeGbp: 20 })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.currency).toEqual('USD');
          expect(res.body.monthlyFeeGbp).toEqual(20);
        });
    });

    it('should return 409 Conflict if currency already exists', () => {
      return supertest(app.getHttpServer())
        .post('/currencies')
        .set('x-api-key', API_KEY)
        .send({ currency: 'USD', monthlyFeeGbp: 20 })
        .expect(409);
    });

    it('should return 400 Bad Request if validation fails (invalid currency code)', () => {
      return supertest(app.getHttpServer())
        .post('/currencies')
        .set('x-api-key', API_KEY)
        .send({ currency: 'US', monthlyFeeGbp: -5 }) // Invalid length and negative fee
        .expect(400);
    });
  });

  describe('/accounts (POST)', () => {
    it('should successfully create an account for an existing currency', () => {
      return supertest(app.getHttpServer())
        .post('/accounts')
        .set('x-api-key', API_KEY)
        .send({
          accountId: 'ACC001',
          currency: 'USD',
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 20
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.accountId).toEqual('ACC001');
          expect(res.body.createdAt).toBeDefined();
        });
    });

    it('should return 404 Not Found if currency does not exist', () => {
      return supertest(app.getHttpServer())
        .post('/accounts')
        .set('x-api-key', API_KEY)
        .send({
          accountId: 'ACC002',
          currency: 'EUR', // EUR was never created
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 20
        })
        .expect(404);
    });

    it('should return 409 Conflict if account already exists', () => {
      return supertest(app.getHttpServer())
        .post('/accounts')
        .set('x-api-key', API_KEY)
        .send({
          accountId: 'ACC001',
          currency: 'USD',
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 20
        })
        .expect(409);
    });
  });

  describe('/accounts/:accountId/bill (POST)', () => {
    it('should calculate the bill successfully (with discount active and transactions over threshold)', () => {
      return supertest(app.getHttpServer())
        .post('/accounts/ACC001/bill')
        .set('x-api-key', API_KEY)
        .send({
          billingPeriodStart: '2025-06-01',
          billingPeriodEnd: '2025-06-30',
          transactionCount: 150
        })
        .expect(200)
        .expect((res: any) => {
          // Expected: Base Fee (20) + Transaction Fees ((150-100) * 0.10 = 5) = Subtotal (25)
          // Discount (20% of 25 = 5)
          // Total: 20
          expect(res.body.accountId).toEqual('ACC001');
          expect(res.body.baseFee).toEqual(20);
          expect(res.body.transactionFees).toEqual(5);
          expect(res.body.subtotal).toEqual(25);
          expect(res.body.discountApplied).toEqual(5);
          expect(res.body.total).toEqual(20);
        });
    });

    it('should return 400 Bad Request if end date is before start date', () => {
      return supertest(app.getHttpServer())
        .post('/accounts/ACC001/bill')
        .set('x-api-key', API_KEY)
        .send({
          billingPeriodStart: '2025-06-30',
          billingPeriodEnd: '2025-06-01', // Invalid
          transactionCount: 150
        })
        .expect(400);
    });

    it('should return 404 Not Found if account does not exist', () => {
      return supertest(app.getHttpServer())
        .post('/accounts/MISSING/bill')
        .set('x-api-key', API_KEY)
        .send({
          billingPeriodStart: '2025-06-01',
          billingPeriodEnd: '2025-06-30',
          transactionCount: 150
        })
        .expect(404);
    });
  });
});
