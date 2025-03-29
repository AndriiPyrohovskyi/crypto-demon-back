import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Currency } from '../currency/currency.entity';

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column('decimal', { precision: 18, scale: 8 })
  value: number;

  @Column('decimal', { precision: 18, scale: 8 })
  price_at_transaction: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  fee: number;

  @CreateDateColumn()
  created_at: Date;
}
