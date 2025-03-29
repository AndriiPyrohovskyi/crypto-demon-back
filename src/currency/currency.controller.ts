import { Controller, Get} from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly service: CurrencyService) {}
  @Get()
  findAll() {
  return this.service.findAll();
  }
}
