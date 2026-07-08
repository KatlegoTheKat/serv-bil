import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
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
