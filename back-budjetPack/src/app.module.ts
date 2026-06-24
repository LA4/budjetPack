import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ à désactiver en prod
      ssl: { rejectUnauthorized: false },
    }),
    CategoriesModule,
    ExpensesModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
