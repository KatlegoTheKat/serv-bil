import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestApiKey = request.headers['x-api-key'] as string;

    // Retrieve the valid expected API key directly from the .env configuration
    const validApiKey = this.configService.get<string>('API_KEY');

    if (!validApiKey || requestApiKey !== validApiKey) {
      throw new UnauthorizedException(
        'Invalid API Key provided in x-api-key header',
      );
    }

    return true;
  }
}
