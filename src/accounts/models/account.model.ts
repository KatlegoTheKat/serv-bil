import { ApiProperty } from '@nestjs/swagger';

export class Account {
  @ApiProperty({ example: 'ACC001' })
  readonly accountId: string;

  @ApiProperty({ example: 'USD' })
  readonly currency: string;

  @ApiProperty({ example: 100 })
  readonly transactionThreshold: number;

  @ApiProperty({ example: 30 })
  readonly discountDays: number;

  @ApiProperty({ example: 20 })
  readonly discountRate: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  readonly createdAt: Date;

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }
}
