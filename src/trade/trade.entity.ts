import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Operation } from '../operation.entity';

@Entity('Trades')
export class Trade extends Operation {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  margin: number;

  @Column({ type: 'enum', enum: ['buy', 'sell'], default: 'buy' })
  type: 'buy' | 'sell';

  @Column({ type: 'int', nullable: true })
  leverage: number;

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

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  closing_price: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  TP_value: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  TP_price: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  SL_value: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  SL_price: number;
}
