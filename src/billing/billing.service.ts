import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountsService } from '../accounts/accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { CalculateBillDto } from './dto/calculate-bill.dto';
import { BillingResult } from './models/billing-result.model';
import {
  addGbp,
  subtractGbp,
  multiplyGbp,
  percentOfGbp,
} from '../common/utils/money.util';

/** Default transaction fee per transaction in GBP (10p) */
const DEFAULT_TRANSACTION_FEE_GBP = 0.1;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly transactionFeeGbp: number;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly currenciesService: CurrenciesService,
    private readonly configService: ConfigService,
  ) {
    // Allow the per-transaction fee to be configured via TRANSACTION_FEE env var
    const configured = this.configService.get<string>('TRANSACTION_FEE');
    this.transactionFeeGbp = configured
      ? parseFloat(configured)
      : DEFAULT_TRANSACTION_FEE_GBP;

    if (configured) {
      this.logger.log(
        `Transaction fee configured from env: £${this.transactionFeeGbp}`,
      );
    }
  }

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

    // Calculate billable transactions (those exceeding the threshold)
    const billableTransactions = Math.max(
      0,
      transactionCount - transactionThreshold,
    );

    // Safe integer-cents arithmetic for all monetary calculations
    const transactionFees = multiplyGbp(
      billableTransactions,
      this.transactionFeeGbp,
    );
    const subtotal = addGbp(baseFee, transactionFees);

    // Calculate discount expiration date based on Account Creation Date + Discount Days
    const expirationDate = new Date(account.createdAt.getTime());
    expirationDate.setDate(expirationDate.getDate() + account.discountDays);

    let discountApplied = 0;
    let activeDiscountRate = account.discountRate;

    // The discount only applies while Current Date <= Account Creation Date + Discount Days
    if (currentDate.getTime() <= expirationDate.getTime()) {
      discountApplied = percentOfGbp(subtotal, activeDiscountRate);
    } else {
      activeDiscountRate = 0; // Expired
    }

    const total = subtractGbp(subtotal, discountApplied);

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
      transactionFeePerTransaction: this.transactionFeeGbp,
      transactionFees,
      subtotal,
      discountRate: activeDiscountRate,
      discountApplied,
      total,
    };
  }
}
