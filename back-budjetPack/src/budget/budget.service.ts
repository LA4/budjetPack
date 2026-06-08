import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetService implements OnModuleInit {
  private readonly BUDGET_ID = 1;

  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async onModuleInit() {
    const exists = await this.budgetRepository.findOneBy({ id: this.BUDGET_ID });
    if (!exists) {
      const defaultBudget = this.budgetRepository.create({
        id: this.BUDGET_ID,
        limit: 1200,
      });
      await this.budgetRepository.save(defaultBudget);
    }
  }

  async getBudget(): Promise<Budget> {
    let budget = await this.budgetRepository.findOneBy({ id: this.BUDGET_ID });
    if (!budget) {
      budget = this.budgetRepository.create({ id: this.BUDGET_ID, limit: 1200 });
      await this.budgetRepository.save(budget);
    }
    return budget;
  }

  async updateBudget(limit: number): Promise<Budget> {
    let budget = await this.budgetRepository.findOneBy({ id: this.BUDGET_ID });
    if (!budget) {
      budget = this.budgetRepository.create({ id: this.BUDGET_ID, limit });
    } else {
      budget.limit = limit;
    }
    return this.budgetRepository.save(budget);
  }
}
