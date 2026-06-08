import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const count = await this.categoriesRepository.count();
    if (count === 0) {
      const defaults = [
        { id: 'food', name: 'Alimentation', icon: '🍎', color: '#ff5a5f' },
        { id: 'transport', name: 'Transport', icon: '🚗', color: '#00a699' },
        { id: 'leisure', name: 'Loisirs & Fun', icon: '🎮', color: '#fc642d' },
        { id: 'housing', name: 'Logement & Factures', icon: '🏠', color: '#3b82f6' },
        { id: 'health', name: 'Santé', icon: '💊', color: '#ec4899' },
        { id: 'shopping', name: 'Shopping & Cadeaux', icon: '🛍️', color: '#8a2be2' }
      ];
      await this.categoriesRepository.save(defaults);
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  findOne(id: string): Promise<Category | null> {
    return this.categoriesRepository.findOneBy({ id });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    if (!categoryData.name) {
      throw new BadRequestException('Le nom de la catégorie est requis.');
    }
    
    // Auto-generate ID if not provided (matching frontend slugify)
    const id = categoryData.id || 
      categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4);

    const category = this.categoriesRepository.create({
      ...categoryData,
      id,
      icon: categoryData.icon || '💸',
      color: categoryData.color || '#9333ea'
    });
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
