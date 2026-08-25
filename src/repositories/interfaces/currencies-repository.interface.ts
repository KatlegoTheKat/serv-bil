import { Currency } from '../../currencies/models/currency.model';

/**
 * Abstract repository interface for Currency persistence.
 *
 * Any concrete implementation (in-memory, PostgreSQL, MongoDB, etc.)
 * must implement these methods. Services depend on this abstraction,
 * not on a specific implementation — enabling clean DI swaps.
 */
export abstract class ICurrenciesRepository {
  abstract save(currency: Currency): void;
  abstract findByCode(code: string): Currency | undefined;
  abstract findAll(): Currency[];
  abstract clear(): void;
}
