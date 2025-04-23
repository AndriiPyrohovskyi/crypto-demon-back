import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Currency } from '../currency/currency.entity';

@Entity('Trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  margin: number;

  @Column({ type: 'enum', enum: ['buy', 'sell'], default: 'buy' })
  type: 'buy' | 'sell';

  @Column({ type: 'int', nullable: true })
  leverage: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  value: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  bought_at_price: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  liquidation_price: number;

  @Column({ type: 'enum', enum: ['open', 'closed', 'liquidated'], default: 'open' })
  status: 'open' | 'closed' | 'liquidated';

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  fixed_user_profit: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  fixed_company_profit: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @Column({ type: 'decimal', precision: 18, scale: 8})
  closing_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2})
  TP_value: number;

  @Column({ type: 'decimal', precision: 18, scale: 8})
  TP_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2})
  SL_value: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  SL_price: number;
}
