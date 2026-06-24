import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';
import { Category } from '../categories/category.entity';

@Entity()
export class Expense {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = randomUUID();
  }

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
