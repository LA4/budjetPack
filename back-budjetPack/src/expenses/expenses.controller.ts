import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from './expense.entity';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(): Promise<Expense[]> {
    return this.expensesService.findAll();
  }

  @Post()
  create(@Body() expenseData: Partial<Expense>): Promise<Expense> {
    return this.expensesService.create(expenseData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.expensesService.remove(id);
  }
}
