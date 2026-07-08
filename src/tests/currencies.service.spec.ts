import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CurrenciesService } from '../currencies/currencies.service';
import { CurrenciesRepository } from '../repositories/currencies.repository';

describe('CurrenciesService', () => {
  let service: CurrenciesService;
  let repository: CurrenciesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrenciesService, CurrenciesRepository],
    }).compile();

    service = module.get<CurrenciesService>(CurrenciesService);
    repository = module.get<CurrenciesRepository>(CurrenciesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a currency successfully', () => {
    const result = service.create({ currency: 'USD', monthlyFeeGbp: 20 });
    expect(result.currency).toEqual('USD');
    expect(result.monthlyFeeGbp).toEqual(20);
    expect(repository.findByCode('USD')).toBeDefined();
  });

  it('should throw ConflictException on duplicate currency', () => {
    service.create({ currency: 'USD', monthlyFeeGbp: 20 });
    expect(() => {
      service.create({ currency: 'USD', monthlyFeeGbp: 30 });
    }).toThrow(ConflictException);
  });

  it('should return currency by code', () => {
    service.create({ currency: 'GBP', monthlyFeeGbp: 25 });
    const currency = service.findByCode('GBP');
    expect(currency.monthlyFeeGbp).toEqual(25);
  });

  it('should throw NotFoundException if currency not found', () => {
    expect(() => {
      service.findByCode('EUR');
    }).toThrow(NotFoundException);
  });
});
