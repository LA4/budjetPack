import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);

  healthStatus = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

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
}
