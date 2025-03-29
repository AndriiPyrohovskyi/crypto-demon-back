import { Controller, Get} from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private readonly service: TradeService) {}
  @Get()
  findAll() {
  return this.service.findAll();
  }
}
