import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Currency } from 'src/currency/currency.entity';

@Entity('UserCurrency')
export class UserCurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Currency, currency => currency.userCurrencies, { eager: true })
  currency: Currency;

  @Column()
  symbol: string;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'float', default: 0 })
  reserved: number;
}