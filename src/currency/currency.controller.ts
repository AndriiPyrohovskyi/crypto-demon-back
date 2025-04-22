import { Controller, Get, Param} from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly service: CurrencyService) {}
  @Get()
  findAll() {
  return this.service.findAll();
  }

  @Get('prices')
  getPrices() {
    return this.service.getCurrenciesWithPrices();
  }

  @Get('price/:symbol')
  getPriceBySymbol(@Param('symbol') symbol: string) {
    return this.service.getCurrencyBySymbol(symbol);
  }
}
