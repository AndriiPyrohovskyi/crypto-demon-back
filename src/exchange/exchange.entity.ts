import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';

@Entity('Exchanges')
export class Exchange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_from_id' })
  transaction_from: Transaction;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_to_id' })
  transaction_to: Transaction;
}
