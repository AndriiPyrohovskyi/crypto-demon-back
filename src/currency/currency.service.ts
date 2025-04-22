import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from './currency.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CurrencyService {
  constructor(@InjectRepository(Currency) private repo: Repository<Currency>) {}

  async findAll(): Promise<Currency[]> {
    return this.repo.find();
  }

  async getCurrenciesWithPrices() {
    const currencies = await this.repo.find();

    const pricePromises = currencies.map(async (currency) => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${currency.symbol}USDT`);
        const data = await res.json();
        return {
          ...currency,
          price: parseFloat(data.price),
        };
      } catch (err) {
        return {
          ...currency,
          price: null,
        };
      }
    });
    return await Promise.all(pricePromises);
  }

  async getCurrencyBySymbol(symbol: string): Promise<(Currency & { price: number | null }) | null> {
    const currency = await this.repo.findOne({ where: { symbol } });
    if (!currency) return null;
  
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`);
      if (!res.ok) throw new Error('Failed to fetch price');
  
      const data = await res.json();
      return {
        ...currency,
        price: parseFloat(data.price),
      };
    } catch (err) {
      return {
        ...currency,
        price: null,
      };
    }
  }

  async getCurrencyIdBySymbol(symbol: string){
    const currency = await this.repo.findOne({ where: { symbol } });
    if (!currency) {
      throw new Error('Currency not found');
    }
    return currency.id;
  }
}  
