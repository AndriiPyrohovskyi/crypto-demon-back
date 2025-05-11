import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Operation } from '../operation.entity';

@Entity('Transactions')
export class Transaction extends Operation {
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column('decimal', { precision: 18, scale: 8 })
  price_at_transaction: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  fee: number;
}
