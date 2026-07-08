import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { Currency } from './models/currency.model';

@ApiTags('Currencies')
@ApiSecurity('x-api-key')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new currency',
    description: 'Registers a new currency with its monthly base fee in GBP.',
  })
  @ApiBody({ type: CreateCurrencyDto })
  @ApiResponse({
    status: 201,
    description: 'Currency successfully created',
    type: Currency,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request payload',
  })
  @ApiResponse({ status: 409, description: 'Currency already exists' })
  create(@Body() createCurrencyDto: CreateCurrencyDto): Currency {
    return this.currenciesService.create(createCurrencyDto);
  }
}
