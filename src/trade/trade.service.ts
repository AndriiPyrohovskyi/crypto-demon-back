import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CurrencyService } from '../currency/currency.service';
import { UserCurrencyService } from '../user-currency/user-currency.service';

@Injectable()
export class TradeService {
  private readonly MAX_LEVERAGE = 5;
  private readonly MAX_MARGIN_PERCENT = 0.2;
  logger: any;

  constructor(
    @InjectRepository(Trade) private repo: Repository<Trade>,
    private usersService: UsersService,
    private currencyService: CurrencyService,
    private userCurrencyService: UserCurrencyService,
  ) {}

  async createTrade(data: {
    symbol: string;
    margin: number;
    leverage: number;
    type: 'buy' | 'sell';
    entryPrice: number;
    closing_price: number;
    TP_value: number;
    TP_price: number;
    SL_value: number;
    SL_price: number;
  }, uid): Promise<Trade> {
    const { symbol, margin, leverage, type, entryPrice, closing_price, TP_value, TP_price, SL_price, SL_value} = data;
    
    if (margin <= 0 || leverage <= 0) {
      throw new BadRequestException('Маржа та кредитне плече мають бути > 0');
    }
    if (leverage > this.MAX_LEVERAGE) {
      throw new BadRequestException(`Кредитне плече не може перевищувати ${this.MAX_LEVERAGE}x`);
    }
    const user = await this.usersService.findUser({ uid: uid })
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const usdtBalance = await this.userCurrencyService.getOne(user.firebaseUid, 'USDT');
    if (!usdtBalance) {
      throw new NotFoundException('Баланс USDT не знайдено');
    }
    if (margin > usdtBalance.balance * this.MAX_MARGIN_PERCENT) {
      throw new BadRequestException(
        `Маржа не може перевищувати ${this.MAX_MARGIN_PERCENT * 100}% від вашого балансу`
      );
    }

    if (usdtBalance.balance - margin < 0) {
      throw new BadRequestException('Недостатньо коштів для відкриття позиції');
    }
    const currencyId= await this.currencyService.getCurrencyIdBySymbol(symbol);
    const existing = await this.repo.findOne({
      where: { user: { id: user.id }, currency: { id: currencyId }, status: 'open' },
    });
    if (existing) {
      throw new BadRequestException('У вас вже є відкрита позиція по цій валюті');
    }

    const value = parseFloat((margin * leverage).toFixed(8));

    let liquidationPrice: number;
    if (type === 'buy') {
      liquidationPrice = parseFloat((entryPrice - entryPrice / leverage).toFixed(8));
    } else {
      liquidationPrice = parseFloat((entryPrice + entryPrice / leverage).toFixed(8));
    }

    await this.userCurrencyService.setBalance(user.firebaseUid, 'USDT', parseFloat((usdtBalance.balance - margin).toFixed(8))); // Fixed precision


    const trade = this.repo.create({
      user: { id: user.id },
      currency: { id: currencyId },
      margin,
      leverage,
      value,
      type,
      bought_at_price: entryPrice,
      liquidation_price: liquidationPrice,
      status: 'open',
      fixed_user_profit: 0,
      fixed_company_profit: 0,
      closing_price: closing_price,
      TP_value: TP_value,
      TP_price: TP_price,
      SL_value: SL_value,
      SL_price: SL_price,
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
    return await this.close(trade, exitPrice);
  }

  async close(trade: Trade, exitPrice: number){
    const positionSize = parseFloat(trade.margin.toString()) * parseFloat(trade.leverage.toString());
    let profit = 0;
    if (trade.type === 'buy') {
      profit = (exitPrice - trade.bought_at_price) * (positionSize / trade.bought_at_price);
    } else {
      profit = (trade.bought_at_price - exitPrice) * (positionSize / trade.bought_at_price);
    }

    let companyCommission = 0;
    if (profit > 0) {
      companyCommission = parseFloat((profit * 0.05).toFixed(8));
    }
    const userProfit = parseFloat((profit > 0 ? profit - companyCommission : profit).toFixed(8));

    trade.fixed_company_profit = companyCommission;
    trade.fixed_user_profit = userProfit;
    trade.status = 'closed';
    trade.closed_at = new Date();

    const usdtBalance = await this.userCurrencyService.getOne(trade.user.firebaseUid, 'USDT');
    const amountToReturn = parseFloat(trade.margin.toString()) + parseFloat(profit.toString());
    await this.userCurrencyService.setBalance(trade.user.firebaseUid, 'USDT', usdtBalance.balance + amountToReturn);

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
      return await this.liquidateTrade(trade);
    }
    return trade;
  }

  async liquidateTrade(trade: Trade): Promise<Trade> {
    trade.status = 'liquidated';
    trade.closed_at = new Date();
    trade.fixed_user_profit = -parseFloat((trade.margin).toFixed(8));
    trade.fixed_company_profit = 0;
    return await this.repo.save(trade);
  }

  async findAll(): Promise<Trade[]> {
    return this.repo.find({ relations: ['user', 'currency'] });
  }

  async findUserTrades(uid: string): Promise<Trade[]> {
    const user = await this.usersService.findUser({ uid: uid });
    return this.repo.find({ where: { user: { id: user.id } }, relations: ['currency'] });
  }

  async findOpenTrades(uid: string): Promise<Trade[]> {
    const user = await this.usersService.findUser({ uid: uid });
    return this.repo.find({ where: { user: { id: user.id }, status: 'open' }, relations: ['currency'] });
  }

  async checkAndCloseTrades(): Promise<void> {
    const trades = await this.repo.find({
      where: { status: 'open' },
      relations: ['user', 'currency'],
    });

    for (const trade of trades) {
      const symbol = `${trade.currency.symbol.toUpperCase()}USDT`;

      let response;
      try {
        response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      } catch (error) {
        this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
        continue;
      }

      if (!response.ok) {
        this.logger.warn(`Non-OK response for ${symbol}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const currentPrice = parseFloat(data.price);
      if (isNaN(currentPrice)) {
        this.logger.warn(`Invalid price received for ${symbol}`);
        continue;
      }

      const margin = parseFloat(trade.margin?.toString() || '0');
      if (!margin || !trade.bought_at_price) {
        this.logger.warn(`Trade ${trade.id} has no valid margin or bought_at_price`);
        continue;
      }

      let shouldClose = false;
      let closeType: 'closed' | 'liquidated' | null = null;

      if (
        trade.liquidation_price &&
        (
          (trade.type === 'buy' && currentPrice <= trade.liquidation_price) ||
          (trade.type === 'sell' && currentPrice >= trade.liquidation_price)
        )
      ) {
        shouldClose = true;
        closeType = 'liquidated';
        trade.fixed_user_profit = -margin;
      }
      else if (
        trade.TP_price &&
        (
          (trade.type === 'buy' && currentPrice >= trade.TP_price) ||
          (trade.type === 'sell' && currentPrice <= trade.TP_price)
        )
      ) {
        shouldClose = true;
        closeType = 'closed';
        trade.fixed_user_profit = parseFloat(
          ((currentPrice - trade.bought_at_price) * margin / trade.bought_at_price).toFixed(8)
        );
      }
      else if (
        trade.SL_price &&
        (
          (trade.type === 'buy' && currentPrice <= trade.SL_price) ||
          (trade.type === 'sell' && currentPrice >= trade.SL_price)
        )
      ) {
        shouldClose = true;
        closeType = 'closed';
        trade.fixed_user_profit = -margin;
      }

      if (shouldClose && closeType) {
        trade.status = closeType;
        trade.closed_at = new Date();
        trade.closing_price = currentPrice;
        trade.fixed_company_profit = 0;

        await this.repo.save(trade);
        this.logger.log(`Trade ${trade.id} closed as ${closeType} at ${currentPrice}`);
      }
    }
  }
}
