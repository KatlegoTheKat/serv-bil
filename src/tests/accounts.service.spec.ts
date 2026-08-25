import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { IAccountsRepository } from '../repositories/interfaces/accounts-repository.interface';
import { AccountsRepository } from '../repositories/accounts.repository';
import { CurrenciesService } from '../currencies/currencies.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: AccountsRepository;

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
        {
          provide: IAccountsRepository,
          useExisting: AccountsRepository,
        },
        { provide: CurrenciesService, useValue: mockCurrenciesService },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repository = module.get<AccountsRepository>(AccountsRepository);
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
    expect(repository.findById('ACC001')).toBeDefined();
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

  it('should find an account by ID', () => {
    service.create({
      accountId: 'ACC003',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
    });
    const found = service.findById('ACC003');
    expect(found.accountId).toEqual('ACC003');
    expect(found.createdAt).toBeInstanceOf(Date);
  });

  it('should throw NotFoundException when account not found', () => {
    expect(() => {
      service.findById('NON_EXISTENT');
    }).toThrow(NotFoundException);
  });

  it('should return all accounts via findAll', () => {
    service.create({
      accountId: 'ACC010',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
    });
    service.create({
      accountId: 'ACC011',
      currency: 'USD',
      transactionThreshold: 50,
      discountDays: 15,
      discountRate: 10,
    });
    const all = service.findAll();
    expect(all.length).toBe(2);
    expect(all.map((a) => a.accountId)).toEqual(
      expect.arrayContaining(['ACC010', 'ACC011']),
    );
  });
});
