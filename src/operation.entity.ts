import { PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Currency } from './currency/currency.entity';

export abstract class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  value: number;

  @CreateDateColumn()
  created_at: Date;
}
