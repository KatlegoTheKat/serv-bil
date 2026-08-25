import { Injectable } from '@nestjs/common';
import { Currency } from '../currencies/models/currency.model';
import { ICurrenciesRepository } from './interfaces/currencies-repository.interface';

@Injectable()
export class CurrenciesRepository extends ICurrenciesRepository {
  private readonly currencies: Map<string, Currency> = new Map();

  save(currency: Currency): void {
    this.currencies.set(currency.currency, currency);
  }

  findByCode(code: string): Currency | undefined {
    return this.currencies.get(code);
  }

  findAll(): Currency[] {
    return Array.from(this.currencies.values());
  }

  clear(): void {
    this.currencies.clear();
  }
}
