import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ICurrenciesRepository } from '../repositories/interfaces/currencies-repository.interface';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { Currency } from './models/currency.model';

@Injectable()
export class CurrenciesService {
  constructor(
    private readonly currenciesRepository: ICurrenciesRepository,
  ) {}

  create(createCurrencyDto: CreateCurrencyDto): Currency {
    const existing = this.currenciesRepository.findByCode(
      createCurrencyDto.currency,
    );
    if (existing) {
      throw new ConflictException(
        `Currency ${createCurrencyDto.currency} already exists`,
      );
    }

    const currency = new Currency({
      currency: createCurrencyDto.currency,
      monthlyFeeGbp: createCurrencyDto.monthlyFeeGbp,
    });

    this.currenciesRepository.save(currency);
    return currency;
  }

  findByCode(code: string): Currency {
    const currency = this.currenciesRepository.findByCode(code);
    if (!currency) {
      throw new NotFoundException(`Currency ${code} not found`);
    }
    return currency;
  }

  findAll(): Currency[] {
    return this.currenciesRepository.findAll();
  }
}
