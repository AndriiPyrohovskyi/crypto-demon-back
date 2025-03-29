import { Controller, Get} from '@nestjs/common';
import { ExchangeService } from './exchange.service';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly service: ExchangeService) {}
  @Get()
  findAll() {
  return this.service.findAll();
  }
}
