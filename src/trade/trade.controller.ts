import { Controller, Get, Post, Body } from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get()
  async findAll() {
    const trades = await this.tradeService.findAll();
    return { status: 'success', trades };
  }

  @Post('create')
  async createTrade(@Body() body: {
    userId: number;
    currencyId: number;
    margin: number;
    leverage: number;
    type: 'buy' | 'sell';
    entryPrice: number;
  }) {
    const trade = await this.tradeService.createTrade(body);
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