import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../core/interfaces/category.interface';
import { BudgetExpense, ExtraExpense } from '../../../core/interfaces/expense.interface';
import { Income } from '../../../core/interfaces/income.interface';
import { Week } from '../../../core/interfaces/week.interface';
import { MonthChallengeData, ChallengeDayProgress } from '../../../core/interfaces/challenge.interface';

@Component({
  selector: 'app-month-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="month-container animate-fade-in-up" *ngIf="monthDetails">
      <!-- HEADER DEL MES -->
      <div class="month-header card-pastel">
        <div class="header-left">
          <span class="chinese-title">月度议程 — Agenda del Mes</span>
          <h1>{{ monthDetails.month.month_name }} {{ monthDetails.month.year }}</h1>
        </div>
        <div class="header-actions">
          <a [routerLink]="['/years', yearId]" class="btn-pastel btn-secondary-pastel">
            <i class="fa-solid fa-chart-line"></i> Dashboard Anual
          </a>
        </div>
      </div>

      <!-- PESTAÑAS TIPO AGENDA -->
      <div class="agenda-tabs">
        <button class="agenda-tab-btn" [class.active]="activeTab === 'calendar'" (click)="setTab('calendar')">
          <i class="fa-solid fa-calendar-days"></i> Calendario
        </button>
        <button class="agenda-tab-btn" [class.active]="activeTab === 'incomes'" (click)="setTab('incomes')">
          <i class="fa-solid fa-wallet"></i> Ingresos & Ahorro
        </button>
        <button class="agenda-tab-btn" [class.active]="activeTab === 'summary'" (click)="setTab('summary')">
          <i class="fa-solid fa-table-list"></i> Resumen del Mes
        </button>
        <button class="agenda-tab-btn" [class.active]="activeTab === 'challenge'" (click)="setTab('challenge')">
          <i class="fa-solid fa-bullseye"></i> Reto Interactivo
        </button>
      </div>

      <!-- PESTAÑA 1: CALENDARIO INTERACTIVO -->
      <div class="tab-content card-pastel" *ngIf="activeTab === 'calendar'">
        <div class="calendar-header-actions">
          <h3>Calendario de Gastos Presupuestados</h3>
          <p class="subtitle">Haz clic en cualquier día para programar un gasto o ver sus detalles.</p>
          <div class="weeks-shortcut">
            <span>Acceso rápido a Semanas:</span>
            <a *ngFor="let w of monthDetails.weeks" [routerLink]="['/years', yearId, 'months', monthId, 'weeks', w.id]" class="week-pill">
              Semana {{ w.week_number }}
            </a>
          </div>
        </div>

        <!-- GRID DEL CALENDARIO -->
        <div class="calendar-grid">
          <div class="day-name">Dom</div>
          <div class="day-name">Lun</div>
          <div class="day-name">Mar</div>
          <div class="day-name">Mié</div>
          <div class="day-name">Jue</div>
          <div class="day-name">Vie</div>
          <div class="day-name">Sáb</div>

          <div *ngFor="let dayCell of calendarDays" 
               class="calendar-day-cell" 
               [class.empty-day]="!dayCell.dateStr"
               (click)="dayCell.dateStr && openExpenseModal(dayCell.dateStr)">
            <div class="day-number" *ngIf="dayCell.dayNumber">{{ dayCell.dayNumber }}</div>
            <div class="day-expenses">
              <div *ngFor="let exp of dayCell.expenses" 
                   class="expense-tag" 
                   [style.backgroundColor]="exp.category_color"
                   (click)="$event.stopPropagation(); openDetailPopup(exp)">
                <span class="exp-icon">{{ exp.category_icon }}</span>
                <span class="exp-concept">{{ exp.concept }}</span>
                <span class="exp-amount">$ {{ exp.budget_amount | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA 2: INGRESOS & AHORRO -->
      <div class="tab-content card-pastel" *ngIf="activeTab === 'incomes'">
        <div class="incomes-layout">
          <!-- FORMULARIO & TABLA INGRESOS -->
          <div class="incomes-main">
            <div class="section-title-row">
              <h3>Ingresos del Mes</h3>
              <button (click)="openIncomeModal()" class="btn-pastel btn-primary-pastel">
                <i class="fa-solid fa-plus"></i> Agregar Ingreso
              </button>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inc of monthDetails.incomes">
                  <td>{{ inc.date }}</td>
                  <td><strong>{{ inc.concept }}</strong></td>
                  <td class="text-green">$ {{ inc.amount | number:'1.2-2' }}</td>
                  <td>
                    <button (click)="deleteIncome(inc.id!)" class="btn-icon-danger"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
                <tr *ngIf="monthDetails.incomes.length === 0">
                  <td colspan="4" class="text-center">No has registrado ingresos aún.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- SECCIÓN AHORRO DEL MES -->
          <div class="savings-card card-pastel">
            <div class="savings-icon">🪙</div>
            <h3>Ahorro del Mes</h3>
            <p>Define la cantidad que deseas destinar al ahorro este mes:</p>
            <div class="saving-input-group">
              <span class="currency-symbol">$</span>
              <input type="number" [(ngModel)]="monthSaving" class="form-input">
              <button (click)="saveMonthSaving()" class="btn-pastel btn-primary-pastel">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA 3: RESUMEN MENSUAL -->
      <div class="tab-content card-pastel" *ngIf="activeTab === 'summary'">
        <h3>Resumen Semanal por Categoría</h3>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th *ngFor="let w of monthDetails.weeks">Semana {{ w.week_number }}</th>
                <th>TOTAL MENSUAL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let catRow of weeklyBreakdown">
                <td class="category-title-cell">
                  <span class="badge-category" [style.backgroundColor]="catRow.categoryColor">
                    {{ catRow.categoryIcon }} {{ catRow.categoryName }}
                  </span>
                </td>
                <td *ngFor="let w of catRow.weeks">$ {{ w.total | number:'1.0-0' }}</td>
                <td class="total-col">$ {{ catRow.monthTotal | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOTALES FINALES -->
        <div class="totals-summary-grid">
          <div class="total-box bg-ingresos">
            <span>Total Ingresos</span>
            <strong>$ {{ totalIncomes | number:'1.2-2' }}</strong>
          </div>
          <div class="total-box bg-gastos">
            <span>Total Gastos</span>
            <strong>$ {{ totalExpenses | number:'1.2-2' }}</strong>
          </div>
          <div class="total-box bg-ahorros">
            <span>Total Ahorro</span>
            <strong>$ {{ monthSaving | number:'1.2-2' }}</strong>
          </div>
          <div class="total-box" style="background:#A8D8EA; color:#1E4B5E">
            <span>Restante Libre</span>
            <strong>$ {{ totalRemaining | number:'1.2-2' }}</strong>
          </div>
        </div>
      </div>

      <!-- PESTAÑA 4: RETO INTERACTIVO -->
      <div class="tab-content card-pastel" *ngIf="activeTab === 'challenge' && challengeData">
        <div class="challenge-header">
          <span class="challenge-icon-big">{{ challengeData.challenge.icon }}</span>
          <div>
            <h2 class="chinese-title">{{ challengeData.challenge.title }}</h2>
            <p class="challenge-desc">{{ challengeData.challenge.description }}</p>
          </div>
        </div>

        <!-- BARRA DE PROGRESO -->
        <div class="progress-bar-wrapper">
          <div class="progress-text">
            <span>Progreso del Reto: {{ challengeData.stats.completedDays }} de {{ challengeData.stats.totalDays }} días</span>
            <strong>{{ challengeData.stats.percentage }}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="challengeData.stats.percentage"></div>
          </div>
        </div>

        <!-- GRID DE DÍAS DEL RETO -->
        <div class="challenge-days-grid">
          <div *ngFor="let day of challengeData.progress" 
               class="challenge-day-card" 
               [class.completed]="day.completed"
               (click)="toggleChallengeDay(day)">
            <span class="day-num">Día {{ day.day }}</span>
            <span class="check-icon">{{ day.completed ? '🌸 Done' : '⚪' }}</span>
          </div>
        </div>
      </div>

      <!-- MODAL CREAR GASTO EN CALENDARIO -->
      <div class="modal-overlay" *ngIf="showExpenseModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>🌸 Agregar Gasto Presupuestado</h3>
            <button (click)="closeExpenseModal()" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Fecha:</label>
              <input type="date" [(ngModel)]="newExpense.date" class="form-input">
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select [(ngModel)]="newExpense.category_id" class="form-input">
                <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Concepto / Detalle:</label>
              <input type="text" [(ngModel)]="newExpense.concept" placeholder="Ej: Servicio de luz" class="form-input">
            </div>
            <div class="form-group">
              <label>Monto Presupuestado ($):</label>
              <input type="number" [(ngModel)]="newExpense.budget_amount" class="form-input">
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeExpenseModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
            <button (click)="saveBudgetExpense()" class="btn-pastel btn-primary-pastel">Guardar Gasto</button>
          </div>
        </div>
      </div>

      <!-- POPUP DETALLE DE GASTO -->
      <div class="modal-overlay" *ngIf="selectedExpense">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>Detalle del Gasto</h3>
            <button (click)="selectedExpense = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="badge-category" [style.backgroundColor]="selectedExpense.category_color">
              {{ selectedExpense.category_icon }} {{ selectedExpense.category_name }}
            </div>
            <h2 style="margin-top:12px;">{{ selectedExpense.concept }}</h2>
            <p>Fecha: <strong>{{ selectedExpense.date }}</strong></p>
            <p>Monto Presupuestado: <strong>$ {{ selectedExpense.budget_amount | number:'1.2-2' }}</strong></p>
            <p *ngIf="selectedExpense.real_amount">Monto Real: <strong>$ {{ selectedExpense.real_amount | number:'1.2-2' }}</strong></p>
          </div>
          <div class="modal-footer">
            <button (click)="deleteBudgetExpense(selectedExpense.id!)" class="btn-pastel btn-delete-sm">Eliminar</button>
            <button (click)="selectedExpense = null" class="btn-pastel btn-primary-pastel">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- MODAL CREAR INGRESO -->
      <div class="modal-overlay" *ngIf="showIncomeModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>💰 Agregar Nuevo Ingreso</h3>
            <button (click)="closeIncomeModal()" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Fecha:</label>
              <input type="date" [(ngModel)]="newIncome.date" class="form-input">
            </div>
            <div class="form-group">
              <label>Concepto:</label>
              <input type="text" [(ngModel)]="newIncome.concept" placeholder="Ej: Salario quincenal" class="form-input">
            </div>
            <div class="form-group">
              <label>Valor ($):</label>
              <input type="number" [(ngModel)]="newIncome.amount" class="form-input">
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeIncomeModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
            <button (click)="saveIncome()" class="btn-pastel btn-primary-pastel">Guardar Ingreso</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .month-container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .month-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .tab-content {
      padding: 24px;
    }
    .calendar-header-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .weeks-shortcut {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    .week-pill {
      background: #FFF0F4;
      border: 1px solid #F4A6C1;
      color: #D4566A;
      padding: 6px 14px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .week-pill:hover {
      background: #D4566A;
      color: white;
    }
    /* CALENDARIO */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }
    .day-name {
      text-align: center;
      font-weight: 700;
      color: #4A3F55;
      padding: 8px;
      background: #FFF0F4;
      border-radius: 8px;
    }
    .calendar-day-cell {
      min-height: 100px;
      background: #FFFFFF;
      border: 1px solid rgba(244, 166, 193, 0.4);
      border-radius: 12px;
      padding: 6px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: background 0.2s ease;
    }
    .calendar-day-cell:hover:not(.empty-day) {
      background: #FFF9FA;
      border-color: #D4566A;
    }
    .empty-day {
      background: #FAFAFA;
      border-color: transparent;
      cursor: default;
    }
    .day-number {
      font-weight: 700;
      font-size: 0.9rem;
      color: #4A3F55;
    }
    .day-expenses {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .expense-tag {
      padding: 4px 6px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    /* INGRESOS LAYOUT */
    .incomes-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
      text-align: left;
      background: #FFF0F4;
      color: #4A3F55;
    }
    .savings-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .savings-icon { font-size: 3rem; }
    .saving-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .currency-symbol { font-weight: 700; font-size: 1.2rem; }

    /* RESUMEN TOTALES */
    .totals-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .total-box {
      padding: 16px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    /* RETOS */
    .challenge-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }
    .challenge-icon-big { font-size: 3.5rem; }
    .progress-bar-wrapper {
      margin-bottom: 30px;
    }
    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .progress-track {
      height: 16px;
      background: #FFF0F4;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #F4A6C1, #D4566A);
      transition: width 0.4s ease;
    }
    .challenge-days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px;
    }
    .challenge-day-card {
      background: #FFFFFF;
      border: 2px solid #F4A6C1;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .challenge-day-card.completed {
      background: #FFE5EC;
      border-color: #D4566A;
      transform: scale(1.05);
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
    .btn-icon-danger { background: none; border: none; color: #D4566A; cursor: pointer; font-size: 1.1rem; }
    @media (max-width: 768px) {
      .incomes-layout { grid-template-columns: 1fr; }
      .calendar-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class MonthLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  yearId!: number;
  monthId!: number;
  activeTab: 'calendar' | 'incomes' | 'summary' | 'challenge' = 'calendar';

  monthDetails: any;
  categories: Category[] = [];
  calendarDays: { dayNumber: number | null; dateStr: string; expenses: BudgetExpense[] }[] = [];
  weeklyBreakdown: any[] = [];
  challengeData?: MonthChallengeData;

  monthSaving: number = 0;
  totalIncomes: number = 0;
  totalExpenses: number = 0;
  totalRemaining: number = 0;

  showExpenseModal = false;
  showIncomeModal = false;
  selectedExpense: BudgetExpense | null = null;

  newExpense: Partial<BudgetExpense> = { budget_amount: 0, concept: '' };
  newIncome: Partial<Income> = { amount: 0, concept: '' };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.monthId = +params['monthId'];
      this.loadMonthData();
    });

    this.apiService.getCategories().subscribe(cats => this.categories = cats);
  }

  setTab(tab: 'calendar' | 'incomes' | 'summary' | 'challenge'): void {
    this.activeTab = tab;
    if (tab === 'summary') this.loadSummaryTab();
    if (tab === 'challenge') this.loadChallengeTab();
  }

  loadMonthData(): void {
    this.apiService.getMonthDetails(this.monthId).subscribe(data => {
      this.monthDetails = data;
      this.monthSaving = data.saving || 0;
      this.calculateTotals();
      this.generateCalendarGrid();
    });
  }

  calculateTotals(): void {
    if (!this.monthDetails) return;
    this.totalIncomes = (this.monthDetails.incomes || []).reduce((sum: number, i: Income) => sum + parseFloat(i.amount as any || 0), 0);
    
    const budgetSum = (this.monthDetails.budgetExpenses || []).reduce((sum: number, e: BudgetExpense) => sum + parseFloat(e.real_amount || e.budget_amount as any || 0), 0);
    const extraSum = (this.monthDetails.extraExpenses || []).reduce((sum: number, e: ExtraExpense) => sum + parseFloat(e.amount as any || 0), 0);
    
    this.totalExpenses = budgetSum + extraSum;
    this.totalRemaining = this.totalIncomes - this.totalExpenses - this.monthSaving;
  }

  generateCalendarGrid(): void {
    if (!this.monthDetails) return;
    const year = this.monthDetails.month.year;
    const monthNum = this.monthDetails.month.month_number;

    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, dateStr: '', expenses: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayExpenses = (this.monthDetails.budgetExpenses || []).filter((e: BudgetExpense) => e.date === dateStr);
      days.push({ dayNumber: d, dateStr, expenses: dayExpenses });
    }

    this.calendarDays = days;
  }

  loadSummaryTab(): void {
    this.apiService.getMonthWeeklyCategoryBreakdown(this.monthId).subscribe(data => {
      this.weeklyBreakdown = data;
    });
  }

  loadChallengeTab(): void {
    this.apiService.getMonthChallenge(this.monthId).subscribe(data => {
      this.challengeData = data;
    });
  }

  toggleChallengeDay(day: ChallengeDayProgress): void {
    if (!this.challengeData) return;
    const newCompleted = !day.completed;
    this.apiService.updateChallengeProgress(this.challengeData.challenge.month_challenge_id!, day.day, newCompleted).subscribe(() => {
      day.completed = newCompleted;
      this.loadChallengeTab();
    });
  }

  openExpenseModal(dateStr: string): void {
    this.newExpense = {
      month_id: this.monthId,
      date: dateStr,
      category_id: this.categories[0]?.id || 1,
      concept: '',
      budget_amount: 0
    };
    this.showExpenseModal = true;
  }

  closeExpenseModal(): void { this.showExpenseModal = false; }

  saveBudgetExpense(): void {
    if (!this.newExpense.concept || !this.newExpense.budget_amount) return;
    this.apiService.createBudgetExpense(this.newExpense as BudgetExpense).subscribe(() => {
      this.closeExpenseModal();
      this.loadMonthData();
    });
  }

  openDetailPopup(exp: BudgetExpense): void { this.selectedExpense = exp; }

  deleteBudgetExpense(id: number): void {
    this.apiService.deleteBudgetExpense(id).subscribe(() => {
      this.selectedExpense = null;
      this.loadMonthData();
    });
  }

  openIncomeModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.newIncome = { month_id: this.monthId, date: today, concept: '', amount: 0 };
    this.showIncomeModal = true;
  }

  closeIncomeModal(): void { this.showIncomeModal = false; }

  saveIncome(): void {
    if (!this.newIncome.concept || !this.newIncome.amount) return;
    this.apiService.createIncome(this.newIncome as Income).subscribe(() => {
      this.closeIncomeModal();
      this.loadMonthData();
    });
  }

  deleteIncome(id: number): void {
    this.apiService.deleteIncome(id).subscribe(() => this.loadMonthData());
  }

  saveMonthSaving(): void {
    this.apiService.setMonthSaving(this.monthId, this.monthSaving).subscribe(() => {
      this.calculateTotals();
    });
  }
}
