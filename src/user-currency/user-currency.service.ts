// user-currency.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCurrency } from './user-currency.entity';
import { UsersService } from '../users/users.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class UserCurrencyService {
  constructor(
    @InjectRepository(UserCurrency)
    private repo: Repository<UserCurrency>,
    private usersService: UsersService,
    private currencyService: CurrencyService,
  ) {}

  async getAllByUser(firebaseUid): Promise<UserCurrency[]> {
    const userId = (await this.usersService.findUser({ uid: firebaseUid })).id;
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['currency'],
    });
  }

  async getUserTotalBalance(firebaseUid: string): Promise<number> {
    const userCurrencies = await this.getAllByUser(firebaseUid);
    let totalBalance = 0;
    for (const uc of userCurrencies) {
      let currencyPrice = 1;
      if (uc.currency.symbol !== 'USDT') {
        const currencyData = await this.currencyService.getCurrencyBySymbol(uc.currency.symbol);
        if (!currencyData || currencyData.price === null) continue;
        currencyPrice = currencyData.price;
      }
      totalBalance += uc.balance * currencyPrice;
    }
    return totalBalance;
  }

  async getOne(firebaseUid: string, symbol:string): Promise<UserCurrency> {
    const currencyId = await this.currencyService.getCurrencyIdBySymbol(symbol);
    const userId = (await this.usersService.findUser({ uid: firebaseUid })).id;
    const record = await this.repo.findOne({
      where: { user: { id: userId }, currency: { id: currencyId } },
    });

    if (!record) {
      throw new NotFoundException('Валюта користувача не знайдена');
    }

    return record;
  }

  async createOrUpdate(firebaseUid: string, symbol: string, amount: number): Promise<UserCurrency> {
    const currencyId = await this.currencyService.getCurrencyIdBySymbol(symbol);
    const userId = (await this.usersService.findUser({ uid: firebaseUid })).id;
    let userCurrency = await this.repo.findOne({
      where: { user: { id: userId }, currency: { id: currencyId } },
    });

    if (userCurrency) {
      userCurrency.balance = (userCurrency.balance || 0) + amount;
    } else {
      userCurrency = this.repo.create({
        user: { id: userId },
        currency: { id: currencyId },
        balance: amount,
      });
    }
    return this.repo.save(userCurrency);
  }

  async setBalance(firebaseUid: string, symbol:string, newBalance: number): Promise<UserCurrency> {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    userCurrency.balance = newBalance;
    return this.repo.save(userCurrency);
  }

  async reserveBalance(firebaseUid: string, symbol: string, amount: number) {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    if (userCurrency.balance < amount) {
      throw new BadRequestException('Недостатньо коштів для резервування');
    }
    userCurrency.balance -= parseFloat(amount.toString());
    userCurrency.reserved += parseFloat(amount.toString());
    return this.repo.save(userCurrency);
  }

  async releaseReservedBalance(firebaseUid: string, symbol: string, amount: number) {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    userCurrency.balance += parseFloat(amount.toString());
    userCurrency.reserved = Math.max(userCurrency.reserved - parseFloat(amount.toString()), 0);
    return this.repo.save(userCurrency);
  }

  async spendReserved(firebaseUid: string, symbol: string, amount: number) {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    if (userCurrency.reserved < amount) {
      throw new BadRequestException('Недостатньо зарезервованих коштів');
    }
    userCurrency.reserved -= parseFloat(amount.toString());
    return this.repo.save(userCurrency);
  }

  async addBalance(firebaseUid: string, symbol: string, amount: number) {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    userCurrency.balance += parseFloat(amount.toString());
    return this.repo.save(userCurrency);
  }

  async exchangeCurrency(
    firebaseUid: string,
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    toAmount: number,
  ): Promise<UserCurrency[]> {
    const fromCurrency = await this.getOne(firebaseUid, fromSymbol);
    

    if (fromCurrency.balance < fromAmount) {
      throw new BadRequestException('Недостатньо коштів для обміну');
    }

    fromCurrency.balance -= fromAmount;
    let toCurrency;
    try {
      toCurrency = await this.getOne(firebaseUid, toSymbol);
      toCurrency.balance += parseFloat(toAmount.toString());
    } catch (error) {
      const currencyId = await this.currencyService.getCurrencyIdBySymbol(toSymbol);
      toCurrency = this.repo.create({
        user: { id: fromCurrency.user.id },
        currency: { id: currencyId },
        balance: parseFloat(toAmount.toString()),
      });
    }

    return Promise.all([this.repo.save(fromCurrency), this.repo.save(toCurrency)]);
  }
}
