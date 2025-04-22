import { UserCurrency } from 'src/user-currency/user-currency.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('Currency')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @OneToMany(() => UserCurrency, uc => uc.currency)
  userCurrencies: UserCurrency[];
}
