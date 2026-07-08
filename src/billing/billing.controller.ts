import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CalculateBillDto } from './dto/calculate-bill.dto';
import { BillingResult } from './models/billing-result.model';

@ApiTags('Billing')
@ApiSecurity('x-api-key')
@Controller('accounts')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post(':accountId/bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate bill for an account',
    description:
      'Calculates the bill for a specific account for a given period.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'The unique identifier of the account',
  })
  @ApiBody({ type: CalculateBillDto })
  @ApiResponse({
    status: 200,
    description: 'Bill successfully calculated',
    type: BillingResult,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request payload',
  })
  @ApiResponse({ status: 404, description: 'Account or Currency not found' })
  calculateBill(
    @Param('accountId') accountId: string,
    @Body() calculateBillDto: CalculateBillDto,
  ): BillingResult {
    return this.billingService.calculateBill(accountId, calculateBillDto);
  }
}
