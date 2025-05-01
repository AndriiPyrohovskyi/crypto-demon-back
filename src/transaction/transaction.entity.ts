import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Currency } from '../currency/currency.entity';

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TransactionStatus {
  ACTIVE = 'active',
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  PENDING = "PENDING",
}

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  // Власник ордеру: для BUY – покупець, для SELL – продавець
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Контрстороння сторона угоди (заповнюється при матчінгу)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'counterparty_id' })
  counterparty: User;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  // Сума (кількість крипти, яку хочуть купити/продати)
  @Column('decimal', { precision: 18, scale: 8 })
  amount: number;

  // Ціна за одиницю крипти (в доларах)
  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  // Заблокована сума:
  // для BUY – блокуються долари = amount * price,
  // для SELL – блокуються криптосуми = amount
  @Column('decimal', { precision: 18, scale: 8 })
  blocked: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.ACTIVE })
  status: TransactionStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;
}
