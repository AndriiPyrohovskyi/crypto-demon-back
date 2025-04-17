import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class TradeService {
  private readonly MAX_LEVERAGE = 5;
  private readonly MAX_MARGIN_PERCENT = 0.2;

  constructor(
    @InjectRepository(Trade) private repo: Repository<Trade>,
    private usersService: UsersService,
  ) {}

  async createTrade(data: {
    userId: number;
    currencyId: number;
    margin: number;
    leverage: number;
    type: 'buy' | 'sell';
    entryPrice: number;
  }): Promise<Trade> {
    const { userId, currencyId, margin, leverage, type, entryPrice } = data;
    if (margin <= 0 || leverage <= 0) {
      throw new BadRequestException('Маржа та кредитне плече мають бути > 0');
    }
    if (leverage > this.MAX_LEVERAGE) {
      throw new BadRequestException(`Кредитне плече не може перевищувати ${this.MAX_LEVERAGE}x`);
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (margin > user.balance * this.MAX_MARGIN_PERCENT) {
      throw new BadRequestException(
        `Маржа не може перевищувати ${this.MAX_MARGIN_PERCENT * 100}% від вашого балансу`
      );
    }

    if (user.balance - margin < 0) {
      throw new BadRequestException('Недостатньо коштів для відкриття позиції');
    }

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, currency: { id: currencyId }, status: 'open' },
    });
    if (existing) {
      throw new BadRequestException('У вас вже є відкрита позиція по цій валюті');
    }

    const value = margin * leverage;

    let liquidationPrice: number;
    if (type === 'buy') {
      liquidationPrice = entryPrice - (entryPrice / leverage);
    } else {
      liquidationPrice = entryPrice + (entryPrice / leverage);
    }

    await this.usersService.updateBalance(userId, -margin);

    const trade = this.repo.create({
      user: { id: userId },
      currency: { id: currencyId },
      margin,
      leverage,
      value: parseFloat(value.toFixed(8)),
      type,
      bought_at_price: entryPrice,
      liquidation_price: parseFloat(liquidationPrice.toFixed(8)),
      status: 'open',
      fixed_user_profit: 0,
      fixed_company_profit: 0,
    });

    return await this.repo.save(trade);
  }

  async closeTrade(tradeId: number, exitPrice: number): Promise<Trade> {
    const trade = await this.repo.findOne({ where: { id: tradeId }, relations: ['user'] });
    if (!trade) {
      throw new NotFoundException('Позицію не знайдено');
    }
    if (trade.status !== 'open') {
      throw new BadRequestException('Позиція вже закрита або ліквідована');
    }

    const positionSize = parseFloat(trade.margin.toString()) * parseFloat(trade.leverage.toString());
    let profit = 0;
    if (trade.type === 'buy') {
      profit = (exitPrice - trade.bought_at_price) * (positionSize / trade.bought_at_price);
    } else {
      profit = (trade.bought_at_price - exitPrice) * (positionSize / trade.bought_at_price);
    }

    trade.fixed_company_profit = parseFloat((profit * 0.05).toFixed(8));
    trade.fixed_user_profit = parseFloat(profit.toFixed(8))-trade.fixed_company_profit;
    trade.status = 'closed';
    trade.closed_at = new Date();

    const amountToReturn = parseFloat(trade.margin.toString()) + parseFloat(profit.toString());
    await this.usersService.updateBalance(trade.user.id, amountToReturn);

    return await this.repo.save(trade);
  }

  async checkLiquidation(tradeId: number, currentPrice: number): Promise<Trade> {
    const trade = await this.repo.findOne({ where: { id: tradeId }, relations: ['user'] });
    if (!trade) {
      throw new NotFoundException('Позицію не знайдено');
    }
    if (trade.status !== 'open') {
      return trade;
    }

    const shouldLiquidate =
      (trade.type === 'buy' && currentPrice <= trade.liquidation_price) ||
      (trade.type === 'sell' && currentPrice >= trade.liquidation_price);

    if (shouldLiquidate) {
      trade.status = 'liquidated';
      trade.closed_at = new Date();
      trade.fixed_user_profit = -parseFloat((trade.margin).toFixed(8));
      trade.fixed_company_profit = 0;
      return await this.repo.save(trade);
    }

    return trade;
  }

  async findAll(): Promise<Trade[]> {
    return this.repo.find({ relations: ['user', 'currency'] });
  }

  async findUserTrades(userId: number): Promise<Trade[]> {
    return this.repo.find({ where: { user: { id: userId } }, relations: ['currency'] });
  }

  async findOpenTrades(userId: number): Promise<Trade[]> {
    return this.repo.find({ where: { user: { id: userId }, status: 'open' }, relations: ['currency'] });
  }
}
