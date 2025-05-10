import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';

@Entity('Exchanges')
export class Exchange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_from_id' })
  transaction_from: Transaction;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_to_id' })
  transaction_to: Transaction;

  @Column()
  fromSymbol: string;

  @Column()
  toSymbol: string;

  @Column('decimal', { precision: 18, scale: 8 })
  fromAmount: number;

  @Column('decimal', { precision: 18, scale: 8 })
  toAmount: number;

  @Column('decimal', { precision: 18, scale: 8 })
  exchangeRate: number;

  @Column('decimal', { precision: 18, scale: 8 })
  fromPriceUsd: number;

  @Column('decimal', { precision: 18, scale: 8 })
  toPriceUsd: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';
}
