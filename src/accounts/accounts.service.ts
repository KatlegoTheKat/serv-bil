import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AccountsRepository } from '../repositories/accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './models/account.model';
import { CurrenciesService } from '../currencies/currencies.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly currenciesService: CurrenciesService,
  ) {}

  create(createAccountDto: CreateAccountDto): Account {
    const existing = this.accountsRepository.findById(
      createAccountDto.accountId,
    );
    if (existing) {
      throw new ConflictException(
        `Account ${createAccountDto.accountId} already exists`,
      );
    }

    // Validate if currency exists
    this.currenciesService.findByCode(createAccountDto.currency);

    const account = new Account({
      ...createAccountDto,
      createdAt: new Date(),
    });

    this.accountsRepository.save(account);
    return account;
  }

  findById(accountId: string): Account {
    const account = this.accountsRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
    return account;
  }
}
