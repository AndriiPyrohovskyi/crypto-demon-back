import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Currency } from '../currency/currency.entity';

@Entity('UserCurrency')
export class UserCurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Currency, currency => currency.userCurrencies, { eager: true })
  currency: Currency;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'float', default: 0 })
  reserved: number;
}