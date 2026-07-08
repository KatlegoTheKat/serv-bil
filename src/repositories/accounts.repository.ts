import { Injectable } from '@nestjs/common';
import { Account } from '../accounts/models/account.model';

@Injectable()
export class AccountsRepository {
  private readonly accounts: Map<string, Account> = new Map();

  save(account: Account): void {
    this.accounts.set(account.accountId, account);
  }

  findById(accountId: string): Account | undefined {
    return this.accounts.get(accountId);
  }

  findAll(): Account[] {
    return Array.from(this.accounts.values());
  }

  clear(): void {
    this.accounts.clear();
  }
}
