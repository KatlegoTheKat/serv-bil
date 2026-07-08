import { IsDateString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAfter } from '../../common/validators/is-after.validator';

export class CalculateBillDto {
  @ApiProperty({ example: '2025-06-01' })
  @IsDateString()
  @IsNotEmpty()
  billingPeriodStart: string;

  @ApiProperty({ example: '2025-06-30' })
  @IsDateString()
  @IsNotEmpty()
  @IsAfter('billingPeriodStart', {
    message: 'billingPeriodEnd must be after or equal to billingPeriodStart',
  })
  billingPeriodEnd: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  transactionCount: number;
}
