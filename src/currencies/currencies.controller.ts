import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
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

  @Get()
  @ApiOperation({
    summary: 'List all currencies',
    description: 'Returns all registered currencies.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of currencies',
    type: [Currency],
  })
  findAll(): Currency[] {
    return this.currenciesService.findAll();
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Get a currency by code',
    description: 'Returns a single currency by its 3-letter code.',
  })
  @ApiParam({ name: 'code', description: '3-letter currency code (e.g. USD)' })
  @ApiResponse({
    status: 200,
    description: 'Currency found',
    type: Currency,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  findByCode(@Param('code') code: string): Currency {
    return this.currenciesService.findByCode(code);
  }

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
