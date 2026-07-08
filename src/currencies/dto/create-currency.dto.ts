import { IsString, IsNumber, Min, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD', description: '3-letter currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({ example: 20, description: 'Monthly base fee in GBP' })
  @IsNumber()
  @Min(0)
  monthlyFeeGbp: number;
}
