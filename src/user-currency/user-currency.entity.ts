import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Currency } from 'src/currency/currency.entity';

@Entity()
@Unique(['user', 'currency'])
export class UserCurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userCurrencies, { eager: true })
  user: User;

  @ManyToOne(() => Currency, currency => currency.userCurrencies, { eager: true })
  currency: Currency;

  @Column({ type: 'float', default: 0 })
  balance: number;
}