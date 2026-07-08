import { ApiProperty } from '@nestjs/swagger';

export class Currency {
  @ApiProperty({ example: 'USD', description: 'The 3-letter currency code' })
  readonly currency: string;

  @ApiProperty({ example: 20, description: 'The monthly base fee in GBP' })
  readonly monthlyFeeGbp: number;

  constructor(partial: Partial<Currency>) {
    Object.assign(this, partial);
  }
}
