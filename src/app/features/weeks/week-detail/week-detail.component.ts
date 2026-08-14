import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PandaCurrencyPipe } from '../../../shared/pipes/currency-format.pipe';
import { Category } from '../../../core/interfaces/category.interface';
import { BudgetExpense, ExtraExpense } from '../../../core/interfaces/expense.interface';
import { CategoryWeekTotal, Week } from '../../../core/interfaces/week.interface';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-week-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PandaCurrencyPipe],
  template: `
    <div class="week-container animate-fade-in-up" *ngIf="weekData">
      <!-- HEADER -->
      <div class="week-header card-pastel">
        <div>
          <span class="chinese-title">周度详情 — Detalle de Semana</span>
          <h1>Semana {{ weekData.week.week_number }} ({{ weekData.week.start_date }} al {{ weekData.week.end_date }})</h1>
        </div>
        <div class="header-nav-actions">
          <button *ngIf="prevWeekId" (click)="goToWeek(prevWeekId)" class="btn-pastel btn-secondary-pastel btn-nav">
            <i class="fa-solid fa-chevron-left"></i> Semana anterior
          </button>
          <a [routerLink]="['/years', yearId, 'months', monthId]" class="btn-pastel btn-secondary-pastel">
            <i class="fa-solid fa-calendar-days"></i> Agenda del Mes
          </a>
          <button *ngIf="nextWeekId" (click)="goToWeek(nextWeekId)" class="btn-pastel btn-secondary-pastel btn-nav">
            Semana siguiente <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
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
                <th>Medio de Pago</th>
                <th>Presupuestado</th>
                <th>Valor Real Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of weekData.budgetExpenses; trackBy: trackById">
                <td>
                  <select [(ngModel)]="b.category_id" (change)="queueBudgetUpdate(b)" class="table-select" [style.borderLeftColor]="b.category_color">
                    <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
                  </select>
                </td>
                <td><input type="date" [(ngModel)]="b.date" (change)="queueBudgetUpdate(b)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="b.concept" (input)="queueBudgetUpdate(b)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="b.payment_method" (input)="queueBudgetUpdate(b)" class="table-input" placeholder="Ej: Tarjeta, Efectivo"></td>
                <td class="font-bold">{{ b.budget_amount | pandaCurrency }}</td>
                <td>
                  <input type="text" [value]="formatAmountDisplay(b.real_amount)" (input)="onAmountInput($event, b, 'real_amount', true)" class="table-input input-real-value" placeholder="$ 0">
                </td>
                <td>
                  <button (click)="deleteBudgetRow(b.id!)" class="btn-icon-danger" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="weekData.budgetExpenses.length === 0">
                <td colspan="7" class="text-center">No hay gastos presupuestados para esta semana desde el calendario.</td>
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
                <th>Medio de Pago</th>
                <th>Valor Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ext of weekData.extraExpenses; trackBy: trackById">
                <td>
                  <select [(ngModel)]="ext.category_id" (change)="queueExtraUpdate(ext)" class="table-select">
                    <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
                  </select>
                </td>
                <td><input type="date" [(ngModel)]="ext.date" (change)="queueExtraUpdate(ext)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="ext.concept" (input)="queueExtraUpdate(ext)" class="table-input"></td>
                <td><input type="text" [(ngModel)]="ext.payment_method" (input)="queueExtraUpdate(ext)" class="table-input" placeholder="Ej: Tarjeta, Efectivo"></td>
                <td><input type="text" [value]="formatAmountDisplay(ext.amount)" (input)="onAmountInput($event, ext, 'amount', false)" class="table-input input-real-value" placeholder="$ 0"></td>
                <td>
                  <button (click)="deleteExtraRow(ext.id!)" class="btn-icon-danger" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="weekData.extraExpenses.length === 0">
                <td colspan="6" class="text-center">No se han registrado gastos extra en esta semana.</td>
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
          <div *ngFor="let catTotal of weekData.categoryTotals; trackBy: trackByCatId" 
               class="category-total-card" 
               [style.backgroundColor]="catTotal.categoryColor">
            <div class="cat-card-header">
              <span class="cat-icon">{{ catTotal.categoryIcon }}</span>
              <span class="cat-name">{{ catTotal.categoryName }}</span>
            </div>
            <div class="cat-card-body">
              <span>Presupuestado: {{ catTotal.totalBudget | pandaCurrency }}</span>
              <strong>Real Gastado: {{ catTotal.totalSpent | pandaCurrency }}</strong>
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
              <label>Medio de Pago:</label>
              <input type="text" [(ngModel)]="newExtra.payment_method" placeholder="Ej: Tarjeta débito, Efectivo" class="form-input">
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
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-nav-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .btn-nav {
      display: flex;
      align-items: center;
      gap: 6px;
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
  private router = inject(Router);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  yearId!: number;
  monthId!: number;
  weekId!: number;

  weekData: any;
  categories: Category[] = [];

  // Week navigation
  allWeeks: Week[] = [];
  prevWeekId: number | null = null;
  nextWeekId: number | null = null;

  showExtraModal = false;
  newExtra: Partial<ExtraExpense> = { amount: 0, concept: '', payment_method: '' };

  // Debounce subjects
  private budgetUpdateSubject = new Subject<BudgetExpense>();
  private extraUpdateSubject = new Subject<ExtraExpense>();

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.monthId = +params['monthId'];
      this.weekId = +params['weekId'];
      this.loadWeekData();
      this.loadAllWeeks();
    });

    this.apiService.getCategories().subscribe(cats => this.categories = cats);

    // Debounced updates (500ms delay)
    this.budgetUpdateSubject.pipe(debounceTime(500)).subscribe(b => this.updateBudgetRow(b));
    this.extraUpdateSubject.pipe(debounceTime(500)).subscribe(ext => this.updateExtraRow(ext));
  }

  loadWeekData(): void {
    this.apiService.getWeekDetail(this.weekId).subscribe(data => {
      this.weekData = data;
    });
  }

  loadAllWeeks(): void {
    this.apiService.getWeeksByMonth(this.monthId).subscribe(weeks => {
      this.allWeeks = weeks;
      this.calculateNavigation();
    });
  }

  calculateNavigation(): void {
    const idx = this.allWeeks.findIndex(w => w.id === this.weekId);
    this.prevWeekId = idx > 0 ? this.allWeeks[idx - 1].id : null;
    this.nextWeekId = idx < this.allWeeks.length - 1 ? this.allWeeks[idx + 1].id : null;
  }

  goToWeek(weekId: number): void {
    this.router.navigate(['/years', this.yearId, 'months', this.monthId, 'weeks', weekId]);
  }

  // Debounced queue methods
  queueBudgetUpdate(b: BudgetExpense): void {
    this.budgetUpdateSubject.next(b);
  }

  queueExtraUpdate(ext: ExtraExpense): void {
    this.extraUpdateSubject.next(ext);
  }

  updateBudgetRow(b: BudgetExpense): void {
    const isOutsideWeek = this.weekData?.week && b.date && (b.date < this.weekData.week.start_date || b.date > this.weekData.week.end_date);
    this.apiService.updateBudgetExpense(b.id!, {
      month_id: this.monthId,
      category_id: b.category_id,
      date: b.date,
      concept: b.concept,
      budget_amount: b.budget_amount,
      real_amount: b.real_amount,
      payment_method: b.payment_method
    }).subscribe(() => {
      if (isOutsideWeek) {
        this.toastService.info('El gasto ha sido movido a la semana correspondiente a su fecha 📅');
      }
      this.loadWeekData();
    });
  }

  async deleteBudgetRow(id: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas eliminar este gasto presupuestado?');
    if (!confirmed) return;
    this.apiService.deleteBudgetExpense(id).subscribe(() => {
      this.toastService.success('Gasto presupuestado eliminado');
      this.loadWeekData();
    });
  }

  updateExtraRow(ext: ExtraExpense): void {
    const isOutsideWeek = this.weekData?.week && ext.date && (ext.date < this.weekData.week.start_date || ext.date > this.weekData.week.end_date);
    this.apiService.updateExtraExpense(ext.id!, {
      month_id: this.monthId,
      category_id: ext.category_id,
      date: ext.date,
      concept: ext.concept,
      amount: ext.amount,
      payment_method: ext.payment_method
    }).subscribe(() => {
      if (isOutsideWeek) {
        this.toastService.info('El gasto ha sido movido a la semana correspondiente a su fecha 📅');
      }
      this.loadWeekData();
    });
  }

  async deleteExtraRow(id: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas eliminar este gasto extra?');
    if (!confirmed) return;
    this.apiService.deleteExtraExpense(id).subscribe(() => {
      this.toastService.success('Gasto extra eliminado');
      this.loadWeekData();
    });
  }

  openExtraModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.newExtra = {
      month_id: this.monthId,
      week_id: this.weekId,
      category_id: this.categories[0]?.id || 1,
      date: today,
      concept: '',
      amount: 0,
      payment_method: ''
    };
    this.showExtraModal = true;
  }

  closeExtraModal(): void { this.showExtraModal = false; }

  saveExtraExpense(): void {
    if (!this.newExtra.concept || !this.newExtra.amount) {
      this.toastService.warning('Por favor completa el concepto y el monto');
      return;
    }
    const isOutsideWeek = this.weekData?.week && this.newExtra.date && (this.newExtra.date < this.weekData.week.start_date || this.newExtra.date > this.weekData.week.end_date);
    this.apiService.createExtraExpense(this.newExtra as ExtraExpense).subscribe(() => {
      if (isOutsideWeek) {
        this.toastService.info('Gasto extra creado y movido a la semana que corresponde a su fecha 📅');
      } else {
        this.toastService.success('Gasto extra registrado exitosamente 🌸');
      }
      this.closeExtraModal();
      this.loadWeekData();
    });
  }

  formatAmountDisplay(val: any): string {
    if (val == null || val === '' || val === 0) return '';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num) || num === 0) return '';
    return '$ ' + num.toLocaleString('es-CO');
  }

  onAmountInput(event: Event, item: any, fieldName: string, isBudget: boolean): void {
    const inputEl = event.target as HTMLInputElement;
    const rawValue = inputEl.value.replace(/\D/g, '');
    const numValue = rawValue ? parseInt(rawValue, 10) : 0;

    item[fieldName] = numValue;
    inputEl.value = numValue ? '$ ' + numValue.toLocaleString('es-CO') : '';

    if (isBudget) {
      this.queueBudgetUpdate(item);
    } else {
      this.queueExtraUpdate(item);
    }
  }

  trackById(index: number, item: any): number { return item.id; }
  trackByCatId(index: number, item: CategoryWeekTotal): number { return item.categoryId; }
}
