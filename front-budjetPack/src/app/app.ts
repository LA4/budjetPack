import { Component, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string; // references Category.id
  date: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);

  // Navigation state
  currentTab = signal<'dashboard' | 'expenses' | 'categories'>('dashboard');

  // Health check states
  healthStatus = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Budget states
  monthlyBudget = signal<number>(1200);

  // Default categories
  categories = signal<Category[]>([
    { id: 'food', name: 'Alimentation', icon: '🍎', color: '#ff5a5f' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#00a699' },
    { id: 'leisure', name: 'Loisirs & Fun', icon: '🎮', color: '#fc642d' },
    { id: 'housing', name: 'Logement & Factures', icon: '🏠', color: '#3b82f6' },
    { id: 'health', name: 'Santé', icon: '💊', color: '#ec4899' },
    { id: 'shopping', name: 'Shopping & Cadeaux', icon: '🛍️', color: '#8a2be2' }
  ]);

  // Default expenses
  expenses = signal<Expense[]>([
    { id: '1', title: 'Courses hebdomadaires Super U', amount: 84.50, category: 'food', date: '2026-06-05' },
    { id: '2', title: 'Plein d\'essence voiture', amount: 65.00, category: 'transport', date: '2026-06-04' },
    { id: '3', title: 'Abonnement Netflix & Spotify', amount: 24.98, category: 'housing', date: '2026-06-01' },
    { id: '4', title: 'Achat jeu vidéo', amount: 59.99, category: 'leisure', date: '2026-05-28' },
    { id: '5', title: 'Consultation Médecin', amount: 25.00, category: 'health', date: '2026-06-07' }
  ]);

  // Form states for adding expense
  newTitle = signal<string>('');
  newAmount = signal<number | null>(null);
  newCategory = signal<string>('food');
  newDate = signal<string>(new Date().toISOString().split('T')[0]);

  // Form states for adding category
  showAddCategoryForm = signal<boolean>(false);
  newCategoryName = signal<string>('');
  newCategoryIcon = signal<string>('💸');
  newCategoryColor = signal<string>('#9333ea');

  // List of pre-defined icons for category creator
  presetIcons = ['🍎', '🍕', '🍔', '🚗', '🚇', '✈️', '🎮', '🍿', '🎵', '🏠', '💡', '💊', '👕', '🛍️', '🎁', '🎨', '📚', '💼', '💪', '🐕', '💸', '✨'];
  presetColors = ['#ff5a5f', '#00a699', '#fc642d', '#3b82f6', '#ec4899', '#8a2be2', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1'];

  constructor() {
    // Load from LocalStorage
    const storedBudget = localStorage.getItem('budjetpack_budget');
    if (storedBudget) this.monthlyBudget.set(parseFloat(storedBudget));

    const storedCategories = localStorage.getItem('budjetpack_categories');
    if (storedCategories) {
      try { this.categories.set(JSON.parse(storedCategories)); } catch (e) {}
    }

    const storedExpenses = localStorage.getItem('budjetpack_expenses');
    if (storedExpenses) {
      try { this.expenses.set(JSON.parse(storedExpenses)); } catch (e) {}
    }

    // Effect to persist changes
    effect(() => {
      localStorage.setItem('budjetpack_budget', this.monthlyBudget().toString());
    });
    effect(() => {
      localStorage.setItem('budjetpack_categories', JSON.stringify(this.categories()));
    });
    effect(() => {
      localStorage.setItem('budjetpack_expenses', JSON.stringify(this.expenses()));
    });
  }

  // Computed properties
  totalExpenses = computed(() => {
    return this.expenses().reduce((sum, exp) => sum + exp.amount, 0);
  });

  remainingBudget = computed(() => {
    return this.monthlyBudget() - this.totalExpenses();
  });

  budgetUsagePercentage = computed(() => {
    const budget = this.monthlyBudget();
    if (budget <= 0) return 0;
    return Math.min((this.totalExpenses() / budget) * 100, 100);
  });

  categoryStats = computed(() => {
    const statsMap = new Map<string, { category: Category; amount: number; percentage: number }>();
    
    // Initialize map with all categories
    this.categories().forEach(cat => {
      statsMap.set(cat.id, { category: cat, amount: 0, percentage: 0 });
    });

    // Sum up expenses
    let total = 0;
    this.expenses().forEach(exp => {
      const stat = statsMap.get(exp.category);
      if (stat) {
        stat.amount += exp.amount;
        total += exp.amount;
      } else {
        // Fallback for custom or deleted categories
        const miscCat = this.categories().find(c => c.id === 'shopping') || this.categories()[0];
        if (miscCat) {
          const mStat = statsMap.get(miscCat.id);
          if (mStat) {
            mStat.amount += exp.amount;
            total += exp.amount;
          }
        }
      }
    });

    // Calculate percentage
    const statsList = Array.from(statsMap.values()).filter(s => s.amount > 0);
    statsList.forEach(s => {
      s.percentage = total > 0 ? (s.amount / total) * 100 : 0;
    });

    // Sort descending by amount
    return statsList.sort((a, b) => b.amount - a.amount);
  });

  // Action methods
  addExpense(): void {
    const title = this.newTitle().trim();
    const amount = this.newAmount();
    const category = this.newCategory();
    const date = this.newDate();

    if (!title || amount === null || amount <= 0) return;

    const newExp: Expense = {
      id: Date.now().toString(),
      title,
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0]
    };

    this.expenses.update(exps => [newExp, ...exps]);

    // Reset inputs
    this.newTitle.set('');
    this.newAmount.set(null);
  }

  deleteExpense(id: string): void {
    this.expenses.update(exps => exps.filter(e => e.id !== id));
  }

  addCategory(): void {
    const name = this.newCategoryName().trim();
    const icon = this.newCategoryIcon();
    const color = this.newCategoryColor();

    if (!name) return;

    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4);
    const newCat: Category = { id, name, icon, color };

    this.categories.update(cats => [...cats, newCat]);
    
    // Automatically select the new category
    this.newCategory.set(id);

    // Reset form
    this.newCategoryName.set('');
    this.showAddCategoryForm.set(false);
  }

  deleteCategory(catId: string): void {
    // Prevent deleting categories that are in use
    const inUse = this.expenses().some(e => e.category === catId);
    if (inUse) {
      alert("Impossible de supprimer cette catégorie car des dépenses y sont associées.");
      return;
    }
    this.categories.update(cats => cats.filter(c => c.id !== catId));
    if (this.newCategory() === catId) {
      this.newCategory.set(this.categories()[0]?.id || '');
    }
  }

  // Health check methods
  checkHealth(): void {
    this.loading.set(true);
    this.healthStatus.set(null);
    this.error.set(null);

    this.http.get<{ status: string; timestamp: string }>('http://localhost:3000/health').subscribe({
      next: (res) => {
        this.healthStatus.set(`${res.status} — ${res.timestamp}`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de joindre le backend.');
        this.loading.set(false);
      },
    });
  }

  // Helper to get category details
  getCategory(id: string): Category | undefined {
    return this.categories().find(c => c.id === id);
  }
}
