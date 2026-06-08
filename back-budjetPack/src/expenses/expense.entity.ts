import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('float')
  amount: number;

  @Column()
  category: string;

  @ManyToOne(() => Category, (category) => category.expenses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category' })
  categoryRef: Category;

  @Column()
  date: string;
}
