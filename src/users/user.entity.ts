import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firebaseUid: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'text' })
  avatar_url: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
}
