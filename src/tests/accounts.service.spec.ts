import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { AccountsRepository } from '../repositories/accounts.repository';
import { CurrenciesService } from '../currencies/currencies.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountsRepository: AccountsRepository;

  beforeEach(async () => {
    const mockCurrenciesService = {
      findByCode: jest.fn((code: string) => {
        if (code === 'INVALID') throw new NotFoundException();
        return { currency: code, monthlyFeeGbp: 20 };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        AccountsRepository,
        { provide: CurrenciesService, useValue: mockCurrenciesService },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<AccountsRepository>(AccountsRepository);
  });

  it('should create an account successfully', () => {
    const account = service.create({
      accountId: 'ACC001',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
    });
    expect(account.accountId).toEqual('ACC001');
    expect(accountsRepository.findById('ACC001')).toBeDefined();
  });

  it('should throw ConflictException on duplicate account', () => {
    service.create({
      accountId: 'ACC001',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
    });
    expect(() => {
      service.create({
        accountId: 'ACC001',
        currency: 'USD',
        transactionThreshold: 50,
        discountDays: 10,
        discountRate: 10,
      });
    }).toThrow(ConflictException);
  });

  it('should throw NotFoundException on invalid currency', () => {
    expect(() => {
      service.create({
        accountId: 'ACC002',
        currency: 'INVALID',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 20,
      });
    }).toThrow(NotFoundException);
  });
});
