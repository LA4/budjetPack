import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Expense } from '../expenses/expense.entity';

@Entity()
export class Category {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @OneToMany(() => Expense, (expense) => expense.categoryRef)
  expenses: Expense[];
}
