import { Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { CalculateBillDto } from './dto/calculate-bill.dto';
import { BillingResult } from './models/billing-result.model';

export const TRANSACTION_FEE_GBP = 0.1; // Configure transaction fee per transaction here

@Injectable()
export class BillingService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly currenciesService: CurrenciesService,
  ) {}

  calculateBill(
    accountId: string,
    dto: CalculateBillDto,
    currentDate: Date = new Date(),
  ): BillingResult {
    const account = this.accountsService.findById(accountId);
    const currency = this.currenciesService.findByCode(account.currency);

    const baseFee = currency.monthlyFeeGbp;
    const transactionThreshold = account.transactionThreshold;
    const transactionCount = dto.transactionCount;

    const billableTransactions = Math.max(
      0,
      transactionCount - transactionThreshold,
    );
    const transactionFees = Number(
      (billableTransactions * TRANSACTION_FEE_GBP).toFixed(2),
    );

    const subtotal = Number((baseFee + transactionFees).toFixed(2));

    // Calculate discount expiration date based on Account Creation Date + Discount Days
    const expirationDate = new Date(account.createdAt.getTime());
    expirationDate.setDate(expirationDate.getDate() + account.discountDays);

    let discountApplied = 0;
    let activeDiscountRate = account.discountRate;

    // The discount only applies while Current Date <= Account Creation Date + Discount Days
    if (currentDate.getTime() <= expirationDate.getTime()) {
      discountApplied = Number(
        (subtotal * (activeDiscountRate / 100)).toFixed(2),
      );
    } else {
      activeDiscountRate = 0; // Expired
    }

    const total = Number((subtotal - discountApplied).toFixed(2));

    return {
      accountId: account.accountId,
      currency: account.currency,
      billingPeriod: {
        start: dto.billingPeriodStart,
        end: dto.billingPeriodEnd,
      },
      baseFee,
      transactionThreshold,
      billableTransactions,
      transactionFeePerTransaction: TRANSACTION_FEE_GBP,
      transactionFees,
      subtotal,
      discountRate: activeDiscountRate,
      discountApplied,
      total,
    };
  }
}
