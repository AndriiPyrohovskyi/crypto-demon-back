import { Controller, Get } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly service: ExchangeService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку всіх обмінів' })
  @ApiResponse({
    status: 200,
    description: 'Список обмінів',
    schema: { example: [{ id: 1, name: 'Binance' }, { id: 2, name: 'Coinbase' }] },
  })
  findAll() {
    return this.service.findAll();
  }
}