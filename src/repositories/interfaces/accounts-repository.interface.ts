import { Account } from '../../accounts/models/account.model';

/**
 * Abstract repository interface for Account persistence.
 *
 * Any concrete implementation (in-memory, PostgreSQL, MongoDB, etc.)
 * must implement these methods. Services depend on this abstraction,
 * not on a specific implementation — enabling clean DI swaps.
 */
export abstract class IAccountsRepository {
  abstract save(account: Account): void;
  abstract findById(accountId: string): Account | undefined;
  abstract findAll(): Account[];
  abstract clear(): void;
}
