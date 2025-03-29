import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from './exchange.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeService {
  async findAll(): Promise<Exchange[]> {
    return this.repo.find();
  }
  
  async create(tx: Partial<Exchange>): Promise<Exchange> {
    const newTx = this.repo.create(tx);
    return this.repo.save(newTx);
  }  
  constructor(@InjectRepository(Exchange) private repo: Repository<Exchange>) {}
}

