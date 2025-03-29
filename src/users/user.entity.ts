import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  uid: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 10000 })
  balance: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}