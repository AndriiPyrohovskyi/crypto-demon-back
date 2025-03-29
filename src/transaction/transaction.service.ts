import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  async findAll(): Promise<Transaction[]> {
    return this.repo.find();
  }
  
  async create(tx: Partial<Transaction>): Promise<Transaction> {
    const newTx = this.repo.create(tx);
    return this.repo.save(newTx);
  }  
  constructor(@InjectRepository(Transaction) private repo: Repository<Transaction>) {}
}

