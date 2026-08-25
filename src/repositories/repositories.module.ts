import { Module, Global } from '@nestjs/common';
import { CurrenciesRepository } from './currencies.repository';
import { AccountsRepository } from './accounts.repository';
import { ICurrenciesRepository } from './interfaces/currencies-repository.interface';
import { IAccountsRepository } from './interfaces/accounts-repository.interface';

@Global()
@Module({
  providers: [
    {
      provide: ICurrenciesRepository,
      useClass: CurrenciesRepository,
    },
    {
      provide: IAccountsRepository,
      useClass: AccountsRepository,
    },
    // Keep concrete classes available for direct injection (tests, etc.)
    CurrenciesRepository,
    AccountsRepository,
  ],
  exports: [
    ICurrenciesRepository,
    IAccountsRepository,
    CurrenciesRepository,
    AccountsRepository,
  ],
})
export class RepositoriesModule {}
