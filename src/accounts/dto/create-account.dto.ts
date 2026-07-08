import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'ACC001' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  transactionThreshold: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  discountDays: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate: number;
}
