// user-currency.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCurrency } from './user-currency.entity';
import { UsersService } from 'src/users/users.service';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class UserCurrencyService {
  constructor(
    @InjectRepository(UserCurrency)
    private userCurrencyRepo: Repository<UserCurrency>,
    private usersService: UsersService,
    private currencyService: CurrencyService,
  ) {}

  async getAllByUser(firebaseUid): Promise<UserCurrency[]> {
    const userId = (await this.usersService.findUser({ uid: firebaseUid })).id;
    return this.userCurrencyRepo.find({
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
    const record = await this.userCurrencyRepo.findOne({
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
    let userCurrency = await this.userCurrencyRepo.findOne({
      where: { user: { id: userId }, currency: { id: currencyId } },
    });

    if (userCurrency) {
      userCurrency.balance = (userCurrency.balance || 0) + amount;
    } else {
      userCurrency = this.userCurrencyRepo.create({
        user: { id: userId },
        currency: { id: currencyId },
        balance: amount,
      });
    }
    return this.userCurrencyRepo.save(userCurrency);
  }

  async setBalance(firebaseUid: string, symbol:string, newBalance: number): Promise<UserCurrency> {
    const userCurrency = await this.getOne(firebaseUid, symbol);
    userCurrency.balance = newBalance;
    return this.userCurrencyRepo.save(userCurrency);
  }
}
