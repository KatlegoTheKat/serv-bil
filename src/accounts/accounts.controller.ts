import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './models/account.model';

@ApiTags('Accounts')
@ApiSecurity('x-api-key')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all accounts',
    description: 'Returns all registered accounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accounts',
    type: [Account],
  })
  findAll(): Account[] {
    return this.accountsService.findAll();
  }

  @Get(':accountId')
  @ApiOperation({
    summary: 'Get an account by ID',
    description: 'Returns a single account by its unique ID.',
  })
  @ApiParam({ name: 'accountId', description: 'Unique account identifier' })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: Account,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findById(@Param('accountId') accountId: string): Account {
    return this.accountsService.findById(accountId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new account',
    description: 'Registers a new account. Requires an existing currency.',
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account successfully created',
    type: Account,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request payload',
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiResponse({ status: 409, description: 'Account already exists' })
  create(@Body() createAccountDto: CreateAccountDto): Account {
    return this.accountsService.create(createAccountDto);
  }
}
