import { Controller, Get, Post, Body } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { Budget } from './budget.entity';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  getBudget(): Promise<Budget> {
    return this.budgetService.getBudget();
  }

  @Post()
  updateBudget(@Body('limit') limit: number): Promise<Budget> {
    return this.budgetService.updateBudget(limit);
  }
}
