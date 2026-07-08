import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BillingService } from '../billing/billing.service';
import { AccountsService } from '../accounts/accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';

describe('BillingService', () => {
  let service: BillingService;

  const mockAccountsService = {
    findById: jest.fn(),
  };

  const mockCurrenciesService = {
    findByCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: CurrenciesService, useValue: mockCurrenciesService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should bill with no transaction fees (below threshold)', () => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 40);

    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC001',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: creationDate,
    });

    mockCurrenciesService.findByCode.mockReturnValue({
      currency: 'USD',
      monthlyFeeGbp: 20,
    });

    const result = service.calculateBill(
      'ACC001',
      {
        billingPeriodStart: '2025-06-01',
        billingPeriodEnd: '2025-06-30',
        transactionCount: 50,
      },
      new Date(),
    );

    expect(result.billableTransactions).toEqual(0);
    expect(result.transactionFees).toEqual(0);
    expect(result.subtotal).toEqual(20);
    expect(result.discountApplied).toEqual(0);
    expect(result.total).toEqual(20);
  });

  it('should bill exceeding threshold', () => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 40);

    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC002',
      currency: 'GBP',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: creationDate,
    });

    mockCurrenciesService.findByCode.mockReturnValue({
      currency: 'GBP',
      monthlyFeeGbp: 25,
    });

    const result = service.calculateBill(
      'ACC002',
      {
        billingPeriodStart: '2025-06-01',
        billingPeriodEnd: '2025-06-30',
        transactionCount: 150,
      },
      new Date(),
    );

    expect(result.billableTransactions).toEqual(50);
    expect(result.transactionFees).toEqual(5);
    expect(result.subtotal).toEqual(30);
    expect(result.discountApplied).toEqual(0);
    expect(result.total).toEqual(30);
  });

  it('should bill with active discount', () => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 10);

    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC003',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: creationDate,
    });

    mockCurrenciesService.findByCode.mockReturnValue({
      currency: 'USD',
      monthlyFeeGbp: 20,
    });

    const result = service.calculateBill(
      'ACC003',
      {
        billingPeriodStart: '2025-06-01',
        billingPeriodEnd: '2025-06-30',
        transactionCount: 150,
      },
      new Date(),
    );

    expect(result.subtotal).toEqual(25);
    expect(result.discountApplied).toEqual(5);
    expect(result.total).toEqual(20);
  });

  it('should bill after discount expiry', () => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 31);

    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC004',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: creationDate,
    });

    mockCurrenciesService.findByCode.mockReturnValue({
      currency: 'USD',
      monthlyFeeGbp: 20,
    });

    const result = service.calculateBill(
      'ACC004',
      {
        billingPeriodStart: '2025-06-01',
        billingPeriodEnd: '2025-06-30',
        transactionCount: 150,
      },
      new Date(),
    );

    expect(result.subtotal).toEqual(25);
    expect(result.discountApplied).toEqual(0);
    expect(result.total).toEqual(25);
  });

  it('should handle zero transactions', () => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 40);

    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC005',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: creationDate,
    });

    mockCurrenciesService.findByCode.mockReturnValue({
      currency: 'USD',
      monthlyFeeGbp: 20,
    });

    const result = service.calculateBill(
      'ACC005',
      {
        billingPeriodStart: '2025-06-01',
        billingPeriodEnd: '2025-06-30',
        transactionCount: 0,
      },
      new Date(),
    );

    expect(result.billableTransactions).toEqual(0);
    expect(result.transactionFees).toEqual(0);
    expect(result.subtotal).toEqual(20);
    expect(result.total).toEqual(20);
  });

  it('should throw when account not found', () => {
    mockAccountsService.findById.mockImplementation(() => {
      throw new NotFoundException('Account not found');
    });

    expect(() => {
      service.calculateBill(
        'NON_EXISTENT',
        {
          billingPeriodStart: '2025-06-01',
          billingPeriodEnd: '2025-06-30',
          transactionCount: 100,
        },
        new Date(),
      );
    }).toThrow(NotFoundException);
  });

  it('should throw when currency not found', () => {
    mockAccountsService.findById.mockReturnValue({
      accountId: 'ACC006',
      currency: 'MISSING',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
      createdAt: new Date(),
    });

    mockCurrenciesService.findByCode.mockImplementation(() => {
      throw new NotFoundException('Currency not found');
    });

    expect(() => {
      service.calculateBill(
        'ACC006',
        {
          billingPeriodStart: '2025-06-01',
          billingPeriodEnd: '2025-06-30',
          transactionCount: 100,
        },
        new Date(),
      );
    }).toThrow(NotFoundException);
  });
});
