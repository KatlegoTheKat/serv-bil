import { Module, Global } from '@nestjs/common';
import { CurrenciesRepository } from './currencies.repository';
import { AccountsRepository } from './accounts.repository';

@Global()
@Module({
  providers: [CurrenciesRepository, AccountsRepository],
  exports: [CurrenciesRepository, AccountsRepository],
})
export class RepositoriesModule {}
