import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { TradeService } from './trade.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Trade')
@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку угод' })
  @ApiResponse({
    status: 200,
    description: 'Список угод',
    schema: { example: [{ tradeId: 1, symbol: 'BTC', status: 'open' }] },
  })
  async findAll() {
    const trades = await this.tradeService.findAll();
    return { status: 'success', trades };
  }

  @Get('user-trades')
  @ApiOperation({ summary: 'Отримання угод користувача' })
  @ApiResponse({
    status: 200,
    description: 'Список угод користувача',
    schema: { example: [{ tradeId: 1, symbol: 'BTC', status: 'open' }] },
  })
  async findUserTrades(@Req() req: Request) {
    const trades = await this.tradeService.findUserTrades(req['user'].uid);
    return { status: 'success', trades };
  }

  @Post('create')
  @ApiOperation({ summary: 'Створення нової угоди' })
  @ApiBody({
    schema: {
      example: {
        symbol: 'BTC',
        margin: 100,
        leverage: 10,
        type: 'buy',
        entryPrice: 30000,
        closing_price: 0,
        TP_value: 10,
        SL_value: 5,
        TP_price: 31000,
        SL_price: 29000,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Угода успішно створена',
    schema: {
      example: {
        status: 'success',
        message: 'Позиція успішно відкрита',
        trade: { tradeId: 1, symbol: 'BTC', status: 'open' },
      },
    },
  })
  async createTrade(
    @Body()
    body: {
      symbol: string;
      margin: number;
      leverage: number;
      type: 'buy' | 'sell';
      entryPrice: number;
      closing_price: number;
      TP_value: number;
      SL_value: number;
      TP_price: number;
      SL_price: number;
    },
    @Req() req: Request,
  ) {
    const userUid = req['user'].uid;
    const trade = await this.tradeService.createTrade(body, userUid);
    return {
      status: 'success',
      message: 'Позиція успішно відкрита',
      trade,
    };
  }

  @Post('close')
  @ApiOperation({ summary: 'Закриття угоди' })
  @ApiBody({
    schema: { example: { tradeId: 1, exitPrice: 30500 } },
  })
  @ApiResponse({
    status: 200,
    description: 'Угода успішно закрита',
    schema: {
      example: {
        status: 'success',
        message: 'Позиція успішно закрита',
        trade: { tradeId: 1, symbol: 'BTC', status: 'closed' },
      },
    },
  })
  async closeTrade(@Body() body: { tradeId: number; exitPrice: number }) {
    const trade = await this.tradeService.closeTrade(body.tradeId, body.exitPrice);
    return {
      status: 'success',
      message: 'Позиція успішно закрита',
      trade,
    };
  }

  @Post('check-liquidation')
  @ApiOperation({ summary: 'Перевірка умов ліквідації угоди' })
  @ApiBody({
    schema: { example: { tradeId: 1, currentPrice: 28000 } },
  })
  @ApiResponse({
    status: 200,
    description: 'Перевірку ліквідації завершено',
    schema: {
      example: {
        status: 'success',
        message: 'Перевірку ліквідації завершено',
        trade: { tradeId: 1, symbol: 'BTC', status: 'liquidated' },
      },
    },
  })
  async checkLiquidation(@Body() body: { tradeId: number; currentPrice: number }) {
    const trade = await this.tradeService.checkLiquidation(body.tradeId, body.currentPrice);
    return {
      status: 'success',
      message: 'Перевірку ліквідації завершено',
      trade,
    };
  }

  @Get('trade-risk')
  @ApiOperation({ summary: 'Отримання ризикових угод поточного користувача' })
  @ApiResponse({
    status: 200,
    description: 'Список ризикових угод',
    schema: { example: [{ id: 1, type: 'buy', liquidation_price: 29000 }] },
  })
  async getRiskyTrades(@Req() req) {
    return this.tradeService.getRiskyTrades(req.user.uid);
  }
}