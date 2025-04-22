import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
