import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from './currency.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CurrencyService {
  async findAll(): Promise<Currency[]> {
    return this.repo.find();
  }
  
  async create(tx: Partial<Currency>): Promise<Currency> {
    const newTx = this.repo.create(tx);
    return this.repo.save(newTx);
  }  
  constructor(@InjectRepository(Currency) private repo: Repository<Currency>) {}
}

