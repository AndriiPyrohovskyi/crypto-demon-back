import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TradeService {
  async findAll(): Promise<Trade[]> {
    return this.repo.find();
  }
  
  async create(tx: Partial<Trade>): Promise<Trade> {
    const newTx = this.repo.create(tx);
    return this.repo.save(newTx);
  }  
  constructor(@InjectRepository(Trade) private repo: Repository<Trade>) {}
}

