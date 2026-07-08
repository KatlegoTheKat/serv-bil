import { ApiProperty } from '@nestjs/swagger';

export class BillingPeriod {
  @ApiProperty({ example: '2025-06-01' })
  start: string;

  @ApiProperty({ example: '2025-06-30' })
  end: string;
}

export class BillingResult {
  @ApiProperty({ example: 'ACC001' })
  accountId: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ type: BillingPeriod })
  billingPeriod: BillingPeriod;

  @ApiProperty({ example: 20 })
  baseFee: number;

  @ApiProperty({ example: 100 })
  transactionThreshold: number;

  @ApiProperty({ example: 50 })
  billableTransactions: number;

  @ApiProperty({ example: 0.1 })
  transactionFeePerTransaction: number;

  @ApiProperty({ example: 5 })
  transactionFees: number;

  @ApiProperty({ example: 25 })
  subtotal: number;

  @ApiProperty({ example: 20 })
  discountRate: number;

  @ApiProperty({ example: 5 })
  discountApplied: number;

  @ApiProperty({ example: 20 })
  total: number;
}
