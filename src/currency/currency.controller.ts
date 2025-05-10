import { Controller, Get, Param } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly service: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку усіх валют' })
  @ApiResponse({
    status: 200,
    description: 'Список валют',
    schema: { example: [{ id: 1, symbol: 'BTC' }, { id: 2, symbol: 'ETH' }] },
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('prices')
  @ApiOperation({ summary: 'Отримання курсів валют' })
  @ApiResponse({
    status: 200,
    description: 'Список валют з їх поточними курсами',
    schema: { example: [{ symbol: 'BTC', price: 30000 }, { symbol: 'ETH', price: 2000 }] },
  })
  getPrices() {
    return this.service.getCurrenciesWithPrices();
  }

  @Get('price/:symbol')
  @ApiOperation({ summary: 'Отримання курсу валюти за символом' })
  @ApiParam({ name: 'symbol', type: String, description: 'Символ валюти, наприклад, BTC' })
  @ApiResponse({
    status: 200,
    description: 'Курс валюти',
    schema: { example: { symbol: 'BTC', price: 30000 } },
  })
  getPriceBySymbol(@Param('symbol') symbol: string) {
    return this.service.getCurrencyBySymbol(symbol);
  }
}