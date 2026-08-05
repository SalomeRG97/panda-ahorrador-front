import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../core/interfaces/category.interface';
import { BudgetExpense, ExtraExpense } from '../../../core/interfaces/expense.interface';
import { CategoryWeekTotal, Week } from '../../../core/interfaces/week.interface';

@Component({
  selector: 'app-week-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="week-container animate-fade-in-up" *ngIf="weekData">
      <!-- HEADER -->
      <div class="week-header card-pastel">
        <div>
          <span class="chinese-title">周度详情 — Detalle de Semana</span>
          <h1>Semana {{ weekData.week.week_number }} ({{ weekData.week.start_date }} al {{ weekData.week.end_date }})</h1>
        </div>
        <a [routerLink]="['/years', yearId, 'months', monthId]" class="btn-pastel btn-secondary-pastel">
          <i class="fa-solid fa-arrow-left"></i> Volver a Agenda del Mes
        </a>
      </div>

      <!-- SECCIÓN 1: GASTOS PRESUPUESTADOS (DEL CALENDARIO) -->
      <section class="card-pastel section-box">
        <div class="section-header">
          <div>
            <h2>Gastos Presupuestados en Calendario</h2>
            <p class="subtitle">Registra el <strong>Valor Real</strong> de lo gastado en cada elemento presupuestado.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Presupuestado</th>
                <th>Valor Real Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of weekData.budgetExpenses">
                <td>
                  <select [(ngModel)]="b.category_id" (change)="updateBudgetRow(b)" class="table-select" [style.borderLeftColor]="b.category_color">
                    <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
                  </select>
                </td>
                <td><input type="date" [(ngModel)]="b.date" (change)="updateBudgetRow(b)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="b.concept" (change)="updateBudgetRow(b)" class="table-input"></td>
                <td class="font-bold">$ {{ b.budget_amount | number:'1.2-2' }}</td>
                <td>
                  <input type="number" [(ngModel)]="b.real_amount" (change)="updateBudgetRow(b)" class="table-input input-real-value" placeholder="$ 0">
                </td>
                <td>
                  <button (click)="deleteBudgetRow(b.id!)" class="btn-icon-danger" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="weekData.budgetExpenses.length === 0">
                <td colspan="6" class="text-center">No hay gastos presupuestados para esta semana desde el calendario.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECCIÓN 2: GASTOS EXTRA (NO PRESUPUESTADOS) -->
      <section class="card-pastel section-box">
        <div class="section-header">
          <div>
            <h2>Gastos No Presupuestados (Extra)</h2>
            <p class="subtitle">Agrega compras o imprevistos no planificados durante la semana.</p>
          </div>
          <button (click)="openExtraModal()" class="btn-pastel btn-primary-pastel">
            <i class="fa-solid fa-plus"></i> Agregar Gasto Extra
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Valor Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ext of weekData.extraExpenses">
                <td>
                  <select [(ngModel)]="ext.category_id" (change)="updateExtraRow(ext)" class="table-select">
                    <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
                  </select>
                </td>
                <td><input type="date" [(ngModel)]="ext.date" (change)="updateExtraRow(ext)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="ext.concept" (change)="updateExtraRow(ext)" class="table-input"></td>
                <td><input type="number" [(ngModel)]="ext.amount" (change)="updateExtraRow(ext)" class="table-input input-real-value"></td>
                <td>
                  <button (click)="deleteExtraRow(ext.id!)" class="btn-icon-danger" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="weekData.extraExpenses.length === 0">
                <td colspan="5" class="text-center">No se han registrado gastos extra en esta semana.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECCIÓN 3: TOTALES GASTADOS POR CATEGORÍA AL FINAL DE LA SEMANA -->
      <section class="card-pastel section-box">
        <div class="chinese-title-wrapper">
          <h2>Totales Gastados por Categoría (Semana {{ weekData.week.week_number }})</h2>
        </div>

        <div class="category-totals-grid">
          <div *ngFor="let catTotal of weekData.categoryTotals" 
               class="category-total-card" 
               [style.backgroundColor]="catTotal.categoryColor">
            <div class="cat-card-header">
              <span class="cat-icon">{{ catTotal.categoryIcon }}</span>
              <span class="cat-name">{{ catTotal.categoryName }}</span>
            </div>
            <div class="cat-card-body">
              <span>Presupuestado: $ {{ catTotal.totalBudget | number:'1.0-0' }}</span>
              <strong>Real Gastado: $ {{ catTotal.totalSpent | number:'1.2-2' }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL CREAR GASTO EXTRA -->
      <div class="modal-overlay" *ngIf="showExtraModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>🌸 Agregar Gasto No Presupuestado</h3>
            <button (click)="closeExtraModal()" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Fecha:</label>
              <input type="date" [(ngModel)]="newExtra.date" class="form-input">
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select [(ngModel)]="newExtra.category_id" class="form-input">
                <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Concepto / Detalle:</label>
              <input type="text" [(ngModel)]="newExtra.concept" placeholder="Ej: Salida espontánea a cenar" class="form-input">
            </div>
            <div class="form-group">
              <label>Monto Real Gastado ($):</label>
              <input type="number" [(ngModel)]="newExtra.amount" class="form-input">
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeExtraModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
            <button (click)="saveExtraExpense()" class="btn-pastel btn-primary-pastel">Guardar Gasto Extra</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .week-container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .week-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-box {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 12px;
      border-bottom: 1px solid #FFF0F4;
    }
    .data-table th {
      background: #FFF0F4;
      color: #4A3F55;
      text-align: left;
    }
    .table-input, .table-select {
      width: 100%;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #F4A6C1;
      font-family: 'Comfortaa', cursive;
    }
    .input-real-value {
      font-weight: 700;
      background: #FFF9FA;
      border-color: #D4566A;
    }
    .btn-icon-danger {
      background: none;
      border: none;
      color: #D4566A;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .category-totals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .category-total-card {
      padding: 16px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #333;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .cat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1.1rem;
    }
    .cat-card-body {
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;
    }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
    }
    .modal-card { width: 100%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-btn { background: none; border: none; font-size: 1.6rem; cursor: pointer; }
    .form-group { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
    .form-input { padding: 10px; border-radius: 10px; border: 1.5px solid #F4A6C1; outline: none; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `]
})
export class WeekDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  yearId!: number;
  monthId!: number;
  weekId!: number;

  weekData: any;
  categories: Category[] = [];

  showExtraModal = false;
  newExtra: Partial<ExtraExpense> = { amount: 0, concept: '' };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.monthId = +params['monthId'];
      this.weekId = +params['weekId'];
      this.loadWeekData();
    });

    this.apiService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadWeekData(): void {
    this.apiService.getWeekDetail(this.weekId).subscribe(data => {
      this.weekData = data;
    });
  }

  updateBudgetRow(b: BudgetExpense): void {
    this.apiService.updateBudgetExpense(b.id!, {
      category_id: b.category_id,
      date: b.date,
      concept: b.concept,
      budget_amount: b.budget_amount,
      real_amount: b.real_amount
    }).subscribe(() => this.loadWeekData());
  }

  deleteBudgetRow(id: number): void {
    this.apiService.deleteBudgetExpense(id).subscribe(() => this.loadWeekData());
  }

  updateExtraRow(ext: ExtraExpense): void {
    this.apiService.updateExtraExpense(ext.id!, {
      category_id: ext.category_id,
      date: ext.date,
      concept: ext.concept,
      amount: ext.amount
    }).subscribe(() => this.loadWeekData());
  }

  deleteExtraRow(id: number): void {
    this.apiService.deleteExtraExpense(id).subscribe(() => this.loadWeekData());
  }

  openExtraModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.newExtra = {
      month_id: this.monthId,
      week_id: this.weekId,
      category_id: this.categories[0]?.id || 1,
      date: today,
      concept: '',
      amount: 0
    };
    this.showExtraModal = true;
  }

  closeExtraModal(): void { this.showExtraModal = false; }

  saveExtraExpense(): void {
    if (!this.newExtra.concept || !this.newExtra.amount) return;
    this.apiService.createExtraExpense(this.newExtra as ExtraExpense).subscribe(() => {
      this.closeExtraModal();
      this.loadWeekData();
    });
  }
}
