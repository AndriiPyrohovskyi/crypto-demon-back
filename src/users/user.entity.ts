import { UserCurrency } from 'src/user-currency/user-currency.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'text' })
  avatar_url: string | null;
  
  @Column({ nullable: true })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;

  @Column({ nullable: true })
  firebaseUid: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @OneToMany(() => UserCurrency, uc => uc.user)
  userCurrencies: UserCurrency[];
}
