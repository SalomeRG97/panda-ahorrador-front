import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PandaCurrencyPipe } from '../../../shared/pipes/currency-format.pipe';
import { Category } from '../../../core/interfaces/category.interface';
import { BudgetExpense, ExtraExpense } from '../../../core/interfaces/expense.interface';
import { Income } from '../../../core/interfaces/income.interface';
import { Week } from '../../../core/interfaces/week.interface';
import { MonthChallengeData, ChallengeDayProgress } from '../../../core/interfaces/challenge.interface';

@Component({
  selector: 'app-month-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PandaCurrencyPipe],
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
            <span>Acceso a Semanas:</span>
            <a *ngFor="let w of monthDetails.weeks; trackBy: trackByWeekId" [routerLink]="['/years', yearId, 'months', monthId, 'weeks', w.id]" class="week-pill">
              Semana {{ w.week_number }}
            </a>
          </div>
        </div>

        <!-- GRID DEL CALENDARIO -->
        <div class="calendar-grid-wrapper">
          <div class="calendar-grid">
            <div class="day-name">Dom</div>
            <div class="day-name">Lun</div>
            <div class="day-name">Mar</div>
            <div class="day-name">Mié</div>
            <div class="day-name">Jue</div>
            <div class="day-name">Vie</div>
            <div class="day-name">Sáb</div>

            <div *ngFor="let dayCell of calendarDays; trackBy: trackByDateStr" 
                 class="calendar-day-cell" 
                 [class.empty-day]="!dayCell.dateStr"
                 (click)="dayCell.dateStr && openExpenseModal(dayCell.dateStr)">
              <div class="day-number" *ngIf="dayCell.dayNumber">{{ dayCell.dayNumber }}</div>
              <div class="day-expenses">
                <div *ngFor="let exp of dayCell.expenses; trackBy: trackById" 
                     class="expense-tag" 
                     [style.backgroundColor]="exp.category_color"
                     (click)="$event.stopPropagation(); openDetailPopup(exp)">
                  <span class="exp-icon">{{ exp.category_icon }}</span>
                  <span class="exp-concept">{{ exp.concept }}</span>
                  <span class="exp-amount">{{ exp.budget_amount | pandaCurrency }}</span>
                </div>
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

            <div class="table-responsive">
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
                  <tr *ngFor="let inc of monthDetails.incomes; trackBy: trackById">
                    <td>{{ inc.date }}</td>
                    <td><strong>{{ inc.concept }}</strong></td>
                    <td class="text-green">{{ inc.amount | pandaCurrency }}</td>
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
                <th *ngFor="let w of monthDetails.weeks; trackBy: trackByWeekId">Semana {{ w.week_number }}</th>
                <th>TOTAL MENSUAL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let catRow of weeklyBreakdown; trackBy: trackByCatRowId">
                <td class="category-title-cell">
                  <span class="badge-category" [style.backgroundColor]="catRow.categoryColor">
                    {{ catRow.categoryIcon }} {{ catRow.categoryName }}
                  </span>
                </td>
                <td *ngFor="let w of catRow.weeks">{{ w.total | pandaCurrency }}</td>
                <td class="total-col">{{ catRow.monthTotal | pandaCurrency }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOTALES FINALES -->
        <div class="totals-summary-grid">
          <div class="total-box bg-ingresos">
            <span>Total Ingresos</span>
            <strong>{{ totalIncomes | pandaCurrency }}</strong>
          </div>
          <div class="total-box bg-gastos">
            <span>Total Gastos</span>
            <strong>{{ totalExpenses | pandaCurrency }}</strong>
          </div>
          <div class="total-box bg-ahorros">
            <span>Total Ahorro</span>
            <strong>{{ monthSaving | pandaCurrency }}</strong>
          </div>
          <div class="total-box" style="background:#A8D8EA; color:#1E4B5E">
            <span>Restante Libre</span>
            <strong>{{ totalRemaining | pandaCurrency }}</strong>
          </div>
        </div>

        <!-- SECCIÓN DESGLOSE POR MEDIO DE PAGO -->
        <div class="payment-methods-section" style="margin-top: 32px;">
          <h3 style="margin-bottom: 16px; color: #D4566A;">💳 Totalización de Gastos por Medio de Pago</h3>
          
          <!-- TOTALES GENERALES POR MEDIO DE PAGO -->
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.05rem; color: #4A3F55; margin-bottom: 12px;">Totales Generales por Tipo de Pago</h4>
            <div class="totals-summary-grid" *ngIf="paymentMethodsOverall.length > 0; else noPayments">
              <div *ngFor="let pm of paymentMethodsOverall" class="total-box" style="background: #FFF0F4; border: 1.5px solid #F4A6C1; color: #4A3F55;">
                <span style="font-weight: 700; font-size: 0.9rem;">💳 {{ pm.method }}</span>
                <strong style="color: #D4566A; font-size: 1.15rem;">{{ pm.total | pandaCurrency }}</strong>
              </div>
            </div>
            <ng-template #noPayments>
              <p style="color: #8C7B99; font-style: italic; font-size: 0.9rem;">No hay registrados medios de pago para este mes aún.</p>
            </ng-template>
          </div>

          <!-- DETALLE DESPLEGABLE POR CATEGORÍA -->
          <div style="margin-top: 20px;">
            <h4 style="font-size: 1.05rem; color: #4A3F55; margin-bottom: 12px;">Desglose por Categoría (Clic para desplegar)</h4>
            <div class="category-payment-list" style="display: flex; flex-direction: column; gap: 10px;">
              <div *ngFor="let catRow of categoryPaymentBreakdown" class="card-pastel" style="padding: 14px 18px; margin: 0; background: #FFF9FA;">
                <div (click)="toggleCategoryBreakdown(catRow)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
                  <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <span class="badge-category" [style.backgroundColor]="catRow.categoryColor">
                      {{ catRow.categoryIcon }} {{ catRow.categoryName }}
                    </span>
                    <span style="font-size: 0.85rem; color: #8C7B99; font-weight: 600;">({{ catRow.methods.length }} medios de pago)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <strong style="color: #D4566A; font-size: 1rem;">{{ catRow.total | pandaCurrency }}</strong>
                    <span style="font-size: 0.9rem; color: #D4566A; font-weight: bold;">{{ catRow.expanded ? '▲' : '▼' }}</span>
                  </div>
                </div>

                <div *ngIf="catRow.expanded" style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #F4A6C1;">
                  <table class="data-table" style="font-size: 0.85rem;">
                    <thead>
                      <tr>
                        <th>Medio de Pago Usado</th>
                        <th>Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let m of catRow.methods">
                        <td>💳 <strong>{{ m.method }}</strong></td>
                        <td style="color: #D4566A; font-weight: 700;">{{ m.total | pandaCurrency }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
            <span>Progreso: {{ challengeData.stats.completedDays }} de {{ challengeData.stats.totalDays }} días</span>
            <strong>{{ challengeData.stats.percentage }}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="challengeData.stats.percentage"></div>
          </div>
        </div>

        <!-- GRID DE DÍAS DEL RETO -->
        <div class="challenge-days-grid">
          <div *ngFor="let day of challengeData.progress; trackBy: trackByDayNum" 
               class="challenge-day-card" 
               [class.completed]="day.completed"
               (click)="toggleChallengeDay(day)">
            <span class="day-num">Día {{ day.day }}</span>
            <span class="check-icon">{{ day.completed ? '🌸 Listo' : '⚪' }}</span>
          </div>
        </div>
      </div>

      <!-- MODAL CREAR GASTO EN CALENDARIO -->
      <div class="modal-overlay" *ngIf="showExpenseModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>🌸 Agregar Gasto Presupuestado</h3>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Fecha:</label>
              <input type="date" [(ngModel)]="newExpense.date" class="form-input">
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select [(ngModel)]="newExpense.category_id" class="form-input">
                <option *ngFor="let c of categories; trackBy: trackById" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Concepto / Detalle:</label>
              <input type="text" [(ngModel)]="newExpense.concept" placeholder="Ej: Servicio de luz" class="form-input">
            </div>
            <div class="form-group">
              <label>Medio de Pago:</label>
              <input type="text" [(ngModel)]="newExpense.payment_method" placeholder="Ej: Débito, Efectivo" class="form-input">
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
          </div>
          <div class="modal-body">
            <div class="badge-category" [style.backgroundColor]="selectedExpense.category_color">
              {{ selectedExpense.category_icon }} {{ selectedExpense.category_name }}
            </div>
            <h2 style="margin-top:12px;">{{ selectedExpense.concept }}</h2>
            <p>Fecha: <strong>{{ selectedExpense.date }}</strong></p>
            <p *ngIf="selectedExpense.payment_method">Medio de Pago: <strong>{{ selectedExpense.payment_method }}</strong></p>
            <p>Monto Presupuestado: <strong>{{ selectedExpense.budget_amount | pandaCurrency }}</strong></p>
            <p *ngIf="selectedExpense.real_amount">Monto Real: <strong>{{ selectedExpense.real_amount | pandaCurrency }}</strong></p>
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
    .month-container { max-width: 1200px; margin: 20px auto; padding: 0 16px; }
    .month-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .tab-content { padding: clamp(14px, 3vw, 24px); }
    .calendar-header-actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .weeks-shortcut { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .week-pill {
      background: #FFF0F4; border: 1px solid #F4A6C1; color: #D4566A; padding: 6px 12px; border-radius: 20px;
      text-decoration: none; font-weight: 700; font-size: 0.8rem; transition: all 0.2s ease;
    }
    .week-pill:hover { background: #D4566A; color: white; }
    .calendar-grid-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(80px, 1fr)); gap: 6px; min-width: 580px; }
    .day-name { text-align: center; font-weight: 700; color: #4A3F55; padding: 6px; background: #FFF0F4; border-radius: 8px; font-size: 0.85rem; }
    .calendar-day-cell {
      min-height: 95px; max-height: 125px; background: #FFFFFF; border: 1px solid rgba(244, 166, 193, 0.4); border-radius: 10px;
      padding: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: background 0.2s ease; overflow: hidden;
    }
    .calendar-day-cell:hover:not(.empty-day) { background: #FFF9FA; border-color: #D4566A; }
    .empty-day { background: #FAFAFA; border-color: transparent; cursor: default; }
    .day-number { font-weight: 700; font-size: 0.85rem; color: #4A3F55; }
    .day-expenses {
      display: flex; flex-direction: column; gap: 4px; max-height: 85px; overflow-y: auto; padding-right: 2px;
    }
    .day-expenses::-webkit-scrollbar { width: 3px; }
    .day-expenses::-webkit-scrollbar-thumb { background: #F4A6C1; border-radius: 10px; }
    .expense-tag {
      padding: 3px 5px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; color: #333;
      display: flex; align-items: center; gap: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .incomes-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 10px; border-bottom: 1px solid #FFF0F4; font-size: 0.9rem; }
    .data-table th { text-align: left; background: #FFF0F4; color: #4A3F55; }
    .savings-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .savings-icon { font-size: 2.5rem; }
    .saving-input-group { display: flex; align-items: center; gap: 6px; width: 100%; }
    .currency-symbol { font-weight: 700; font-size: 1.1rem; }
    .totals-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 20px; }
    .total-box { padding: 14px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.9rem; }
    .bg-ingresos { background: #EAF6F0; color: #1E4E36; }
    .bg-gastos { background: #FDEEF4; color: #6A1B3B; }
    .bg-ahorros { background: #FFF9EB; color: #5B4810; }
    .modal-header { margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px dashed #F4A6C1; }
    .modal-header h3 { font-size: 1.3rem; color: #D4566A; margin: 0; }
    .challenge-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .challenge-icon-big { font-size: 3rem; }
    .progress-bar-wrapper { margin-bottom: 24px; }
    .progress-text { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; }
    .progress-track { height: 14px; background: #FFF0F4; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #F4A6C1, #D4566A); transition: width 0.4s ease; }
    .challenge-days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 10px; }
    .challenge-day-card {
      background: #FFFFFF; border: 2px solid #F4A6C1; border-radius: 10px; padding: 8px; text-align: center;
      cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: all 0.2s ease; font-size: 0.8rem;
    }
    .challenge-day-card.completed { background: #FFE5EC; border-color: #D4566A; transform: scale(1.03); }
    .form-group { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
    .form-input { padding: 8px 12px; border-radius: 10px; border: 1.5px solid #F4A6C1; outline: none; font-size: 0.9rem; width: 100%; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
    .btn-icon-danger { background: none; border: none; color: #D4566A; cursor: pointer; font-size: 1rem; }
    @media (max-width: 900px) { .incomes-layout { grid-template-columns: 1fr; } }
  `]
})
export class MonthLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

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

  paymentMethodsOverall: { method: string; total: number }[] = [];
  categoryPaymentBreakdown: {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    total: number;
    methods: { method: string; total: number }[];
    expanded?: boolean;
  }[] = [];

  showExpenseModal = false;
  showIncomeModal = false;
  selectedExpense: BudgetExpense | null = null;

  newExpense: Partial<BudgetExpense> = { budget_amount: 0, concept: '', payment_method: '' };
  newIncome: Partial<Income> = { amount: 0, concept: '' };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.monthId = +params['monthId'];
      this.loadMonthData();
    });

    this.route.queryParams.subscribe(qParams => {
      if (qParams['tab'] && ['calendar', 'incomes', 'summary', 'challenge'].includes(qParams['tab'])) {
        this.setTab(qParams['tab'] as any);
      }
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

    this.calculatePaymentMethodBreakdown();
  }

  calculatePaymentMethodBreakdown(): void {
    if (!this.monthDetails) return;

    const budgetExpenses: BudgetExpense[] = this.monthDetails.budgetExpenses || [];
    const extraExpenses: ExtraExpense[] = this.monthDetails.extraExpenses || [];

    const categoryMap = new Map<number, {
      categoryId: number;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      total: number;
      methodsMap: Map<string, number>;
    }>();

    const overallMethodsMap = new Map<string, number>();

    const processExpense = (exp: any, isExtra = false) => {
      const catId = exp.category_id;
      const catName = exp.category_name || 'Sin Categoría';
      const catIcon = exp.category_icon || '🏷️';
      const catColor = exp.category_color || '#E8A0BF';
      const rawMethod = exp.payment_method ? exp.payment_method.trim() : '';
      const method = rawMethod ? rawMethod : 'Sin especificar';
      const amount = isExtra 
        ? parseFloat(exp.amount || 0)
        : (exp.real_amount && parseFloat(exp.real_amount) > 0 ? parseFloat(exp.real_amount) : parseFloat(exp.budget_amount || 0));

      if (!amount || isNaN(amount)) return;

      overallMethodsMap.set(method, (overallMethodsMap.get(method) || 0) + amount);

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          categoryIcon: catIcon,
          categoryColor: catColor,
          total: 0,
          methodsMap: new Map<string, number>()
        });
      }

      const catData = categoryMap.get(catId)!;
      catData.total += amount;
      catData.methodsMap.set(method, (catData.methodsMap.get(method) || 0) + amount);
    };

    budgetExpenses.forEach(e => processExpense(e, false));
    extraExpenses.forEach(e => processExpense(e, true));

    this.paymentMethodsOverall = Array.from(overallMethodsMap.entries()).map(([method, total]) => ({ method, total }));

    const existingExpandedState = new Map(this.categoryPaymentBreakdown.map(c => [c.categoryId, c.expanded]));

    this.categoryPaymentBreakdown = Array.from(categoryMap.values()).map(cat => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      categoryIcon: cat.categoryIcon,
      categoryColor: cat.categoryColor,
      total: cat.total,
      methods: Array.from(cat.methodsMap.entries()).map(([method, total]) => ({ method, total })),
      expanded: existingExpandedState.get(cat.categoryId) ?? false
    }));
  }

  toggleCategoryBreakdown(cat: any): void {
    cat.expanded = !cat.expanded;
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
      budget_amount: 0,
      payment_method: ''
    };
    this.showExpenseModal = true;
  }

  closeExpenseModal(): void { this.showExpenseModal = false; }

  saveBudgetExpense(): void {
    if (!this.newExpense.concept || !this.newExpense.budget_amount) {
      this.toastService.warning('Por favor ingresa concepto y monto');
      return;
    }
    this.apiService.createBudgetExpense(this.newExpense as BudgetExpense).subscribe(() => {
      this.toastService.success('Gasto presupuestado agregado 🌸');
      this.closeExpenseModal();
      this.loadMonthData();
    });
  }

  openDetailPopup(exp: BudgetExpense): void { this.selectedExpense = exp; }

  async deleteBudgetExpense(id: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas eliminar este gasto presupuestado?');
    if (!confirmed) return;

    this.apiService.deleteBudgetExpense(id).subscribe(() => {
      this.toastService.success('Gasto eliminado');
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
    if (!this.newIncome.concept || !this.newIncome.amount) {
      this.toastService.warning('Por favor ingresa concepto y valor del ingreso');
      return;
    }
    this.apiService.createIncome(this.newIncome as Income).subscribe(() => {
      this.toastService.success('Ingreso registrado 💰');
      this.closeIncomeModal();
      this.loadMonthData();
    });
  }

  async deleteIncome(id: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas eliminar este ingreso?');
    if (!confirmed) return;

    this.apiService.deleteIncome(id).subscribe(() => {
      this.toastService.success('Ingreso eliminado');
      this.loadMonthData();
    });
  }

  saveMonthSaving(): void {
    this.apiService.setMonthSaving(this.monthId, this.monthSaving).subscribe(() => {
      this.toastService.success('Meta de ahorro guardada 🪙');
      this.calculateTotals();
    });
  }

  trackById(index: number, item: any): number { return item.id; }
  trackByWeekId(index: number, w: Week): number { return w.id; }
  trackByDateStr(index: number, item: any): string { return item.dateStr + '_' + index; }
  trackByCatRowId(index: number, catRow: any): number { return catRow.categoryId; }
  trackByDayNum(index: number, day: ChallengeDayProgress): number { return day.day; }
}
