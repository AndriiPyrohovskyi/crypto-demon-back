import { Controller, Get, Post, Param, Body, ParseIntPipe, Req } from '@nestjs/common';
import { UserCurrencyService } from './user-currency.service';

@Controller('user-currency')
export class UserCurrencyController {
  constructor(private readonly service: UserCurrencyService) {}

  @Get('')
  getAll(@Req() req: Request) {
    return this.service.getAllByUser(req['user'].uid);
  }

  @Get(':symbol')
  getOne(
    @Req() req: Request,
    @Param('symbol') symbol: string,
  ) {
    return this.service.getOne(req['user'].uid, symbol);
  }

  @Post('add')
  createOrUpdate(
    @Req() req: Request,
    @Body('symbol') symbol: string,
    @Body('amount') amount: number,
  ) {
    return this.service.createOrUpdate(req['user'].uid, symbol, amount);
  }

  @Post('set')
  setBalance(
    @Req() req: Request,
    @Body('symbol') symbol: string,
    @Body('balance') balance: number,
  ) {
    return this.service.setBalance(req['user'].uid, symbol, balance);
  }
}
