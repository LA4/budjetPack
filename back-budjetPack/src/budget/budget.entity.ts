import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Budget {
  @PrimaryColumn()
  id: number;

  @Column('float')
  limit: number;
}
