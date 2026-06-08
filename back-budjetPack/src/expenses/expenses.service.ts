import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ExpensesService implements OnModuleInit {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private categoriesService: CategoriesService,
  ) {}

  async onModuleInit() {
    // Wait a brief moment or check if categories are seeded
    const count = await this.expensesRepository.count();
    if (count === 0) {
      const defaults = [
        { title: 'Courses hebdomadaires Super U', amount: 84.50, category: 'food', date: '2026-06-05' },
        { title: 'Plein d\'essence voiture', amount: 65.00, category: 'transport', date: '2026-06-04' },
        { title: 'Abonnement Netflix & Spotify', amount: 24.98, category: 'housing', date: '2026-06-01' },
        { title: 'Achat jeu vidéo', amount: 59.99, category: 'leisure', date: '2026-05-28' },
        { title: 'Consultation Médecin', amount: 25.00, category: 'health', date: '2026-06-07' }
      ];
      
      const activeCategories = await this.categoriesService.findAll();
      if (activeCategories.length > 0) {
        await this.expensesRepository.save(defaults);
      }
    }
  }

  findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      order: {
        date: 'DESC',
        id: 'DESC'
      }
    });
  }

  async create(expenseData: Partial<Expense>): Promise<Expense> {
    if (!expenseData.title || expenseData.amount === undefined || expenseData.amount <= 0 || !expenseData.category) {
      throw new BadRequestException('La description, le montant (supérieur à 0) et la catégorie sont obligatoires.');
    }

    // Verify category exists
    const categoryExists = await this.categoriesService.findOne(expenseData.category);
    if (!categoryExists) {
      throw new BadRequestException(`La catégorie "${expenseData.category}" n'existe pas.`);
    }

    const expense = this.expensesRepository.create({
      title: expenseData.title,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date || new Date().toISOString().split('T')[0]
    });

    return this.expensesRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    await this.expensesRepository.delete(id);
  }
}
