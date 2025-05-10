import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { UserCurrencyService } from './user-currency.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('User Currency')
@Controller('user-currency')
export class UserCurrencyController {
  constructor(private readonly service: UserCurrencyService) {}

  @Get('')
  @ApiOperation({ summary: 'Отримання всіх валют користувача' })
  @ApiResponse({
    status: 200,
    description: 'Список валют користувача',
    schema: { example: [{ symbol: 'BTC', balance: 1.234 }, { symbol: 'ETH', balance: 10 }] },
  })
  getAll(@Req() req: Request) {
    return this.service.getAllByUser(req['user'].uid);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Отримання загального балансу користувача' })
  @ApiResponse({
    status: 200,
    description: 'Загальний баланс',
    schema: { example: { totalBalance: 2000 } },
  })
  getBalance(@Req() req: Request) {
    return this.service.getUserTotalBalance(req['user'].uid);
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Отримання конкретної валюти користувача' })
  @ApiParam({ name: 'symbol', type: String, description: 'Символ валюти' })
  @ApiResponse({
    status: 200,
    description: 'Дані валюти користувача',
    schema: { example: { symbol: 'BTC', balance: 1.234 } },
  })
  getOne(@Req() req: Request, @Param('symbol') symbol: string) {
    return this.service.getOne(req['user'].uid, symbol);
  }

  @Post('add')
  @ApiOperation({ summary: 'Додавання коштів до валюти користувача' })
  @ApiBody({
    schema: { example: { symbol: 'BTC', amount: 0.5 } },
  })
  @ApiResponse({
    status: 201,
    description: 'Валюту оновлено успішно',
    schema: { example: { symbol: 'BTC', balance: 1.734 } },
  })
  createOrUpdate(
    @Req() req: Request,
    @Body('symbol') symbol: string,
    @Body('amount') amount: number,
  ) {
    return this.service.createOrUpdate(req['user'].uid, symbol, amount);
  }

  @Post('set')
  @ApiOperation({ summary: 'Встановлення нового значення балансу для валюти користувача' })
  @ApiBody({
    schema: { example: { symbol: 'BTC', balance: 2.0 } },
  })
  @ApiResponse({
    status: 200,
    description: 'Баланс збережено',
    schema: { example: { symbol: 'BTC', balance: 2.0 } },
  })
  setBalance(
    @Req() req: Request,
    @Body('symbol') symbol: string,
    @Body('balance') balance: number,
  ) {
    return this.service.setBalance(req['user'].uid, symbol, balance);
  }
}