import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get()
  async findAll() {
    const trades = await this.tradeService.findAll();
    return { status: 'success', trades };
  }

  @Get('user-trades')
  async findUserTrades(@Req() req: Request) {
    const trades = await this.tradeService.findUserTrades(req['user'].uid);
    return { status: 'success', trades };
  }

  @Post('create')
  async createTrade(@Body() body: {
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
  }, @Req() req: Request) {
    const userUid = req['user'].uid;
    const trade = await this.tradeService.createTrade(body, userUid);
    return {
      status: 'success',
      message: 'Позиція успішно відкрита',
      trade,
    };
  }

  @Post('close')
  async closeTrade(@Body() body: { tradeId: number; exitPrice: number }) {
    const trade = await this.tradeService.closeTrade(body.tradeId, body.exitPrice);
    return {
      status: 'success',
      message: 'Позиція успішно закрита',
      trade,
    };
  }

  @Post('check-liquidation')
  async checkLiquidation(@Body() body: { tradeId: number; currentPrice: number }) {
    const trade = await this.tradeService.checkLiquidation(body.tradeId, body.currentPrice);
    return {
      status: 'success',
      message: 'Перевірку ліквідації завершено',
      trade,
    };
  }
}