import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PandaCurrencyPipe } from '../../../shared/pipes/currency-format.pipe';
import { Year } from '../../../core/interfaces/year.interface';
import { AnnualSummary, CategoryChartData } from '../../../core/interfaces/summary.interface';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-year-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PandaCurrencyPipe],
  template: `
    <div class="dashboard-container animate-fade-in-up" *ngIf="yearData">
      <!-- ENCABEZADO -->
      <div class="dashboard-header card-pastel">
        <div>
          <span class="chinese-title">年度仪表板</span>
          <h1>Dashboard Anual {{ yearData.year }}</h1>
          <p class="subtitle">Resumen consolidado, gráficos de evolución y accesos directos a cada mes.</p>
        </div>
        <a routerLink="/years" class="btn-pastel btn-secondary-pastel">
          <i class="fa-solid fa-arrow-left"></i> Volver a Años
        </a>
      </div>

      <!-- CARDS METRICAS GENERALES -->
      <div class="metrics-grid" *ngIf="summary">
        <div class="metric-card card-pastel bg-ingresos">
          <span class="metric-icon">💰</span>
          <div class="metric-info">
            <span class="metric-label">Total Ingresos</span>
            <span class="metric-value">{{ summary.totals.income | pandaCurrency }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-gastos">
          <span class="metric-icon">💸</span>
          <div class="metric-info">
            <span class="metric-label">Total Gastos</span>
            <span class="metric-value">{{ summary.totals.expenses | pandaCurrency }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-ahorros">
          <span class="metric-icon">🪙</span>
          <div class="metric-info">
            <span class="metric-label">Total Ahorros</span>
            <span class="metric-value">{{ summary.totals.savings | pandaCurrency }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-fijos">
          <span class="metric-icon">📌</span>
          <div class="metric-info">
            <span class="metric-label">Total Fijos</span>
            <span class="metric-value">{{ summary.totals.fixed | pandaCurrency }}</span>
          </div>
        </div>
      </div>

      <!-- TABLA RESUMEN ANUAL -->
      <section class="summary-table-section card-pastel">
        <div class="chinese-title-wrapper">
          <h2>Tabla Resumen Anual</h2>
        </div>
        <div class="table-responsive">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th *ngFor="let m of summary?.months; trackBy: trackByMonthNumber">{{ m.monthName }}</th>
                <th class="total-col">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody>
              <!-- INGRESOS -->
              <tr class="row-ingresos">
                <td class="concept-cell">
                  <span class="badge-concept-ingreso badge-category">💰 Ingresos</span>
                </td>
                <td *ngFor="let m of summary?.months; trackBy: trackByMonthNumber">{{ m.income | pandaCurrency }}</td>
                <td class="total-col">{{ summary?.totals?.income | pandaCurrency }}</td>
              </tr>
              <!-- GASTOS -->
              <tr class="row-gastos">
                <td class="concept-cell">
                  <span class="badge-concept-gasto badge-category">💸 Gastos</span>
                </td>
                <td *ngFor="let m of summary?.months; trackBy: trackByMonthNumber">{{ m.expenses | pandaCurrency }}</td>
                <td class="total-col">{{ summary?.totals?.expenses | pandaCurrency }}</td>
              </tr>
              <!-- AHORROS -->
              <tr class="row-ahorros">
                <td class="concept-cell">
                  <span class="badge-concept-ahorro badge-category">🪙 Ahorros</span>
                </td>
                <td *ngFor="let m of summary?.months; trackBy: trackByMonthNumber">{{ m.savings | pandaCurrency }}</td>
                <td class="total-col">{{ summary?.totals?.savings | pandaCurrency }}</td>
              </tr>
              <!-- FIJOS -->
              <tr class="row-fijos">
                <td class="concept-cell">
                  <span class="badge-concept-fijo badge-category">📌 Gastos Fijos</span>
                </td>
                <td *ngFor="let m of summary?.months; trackBy: trackByMonthNumber">{{ m.fixed | pandaCurrency }}</td>
                <td class="total-col">{{ summary?.totals?.fixed | pandaCurrency }}</td>
              </tr>
              <!-- RESTANTE -->
              <tr class="row-restante">
                <td class="concept-cell">
                  <span class="badge-category" style="background:#A8D8EA; color:#1E4B5E">⚖️ Restante</span>
                </td>
                <td *ngFor="let m of summary?.months; trackBy: trackByMonthNumber" [class.negative]="m.remaining < 0">
                  {{ m.remaining | pandaCurrency }}
                </td>
                <td class="total-col" [class.negative]="summary?.totals?.remaining! < 0">
                  {{ summary?.totals?.remaining | pandaCurrency }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- GRÁFICOS FINANCIEROS -->
      <section class="charts-grid">
        <div class="chart-card card-pastel">
          <h3>Evolución Anual (Ingresos vs Gastos vs Ahorros vs Fijos)</h3>
          <div class="chart-wrapper">
            <canvas id="annualMainChart"></canvas>
          </div>
        </div>

        <div class="chart-card card-pastel">
          <h3>Distribución de Gastos por Categoría</h3>
          <div class="chart-wrapper">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </section>

      <!-- ACCESOS A CADA MES -->
      <section class="months-access-section">
        <div class="chinese-title-wrapper">
          <h2>Meses de {{ yearData.year }}</h2>
        </div>
        <div class="months-grid">
          <a *ngFor="let m of yearData.months; trackBy: trackById" [routerLink]="['/years', yearData.id, 'months', m.id]" class="month-card card-pastel">
            <div class="month-card-header">
              <span class="month-number-badge">{{ m.month_number }}</span>
              <h3 class="month-title">{{ m.month_name }}</h3>
            </div>
            <p class="click-text"><i class="fa-solid fa-folder-open"></i> Ver Agenda del Mes</p>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 30px auto; padding: 0 20px; display: flex; flex-direction: column; gap: 30px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .metric-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .metric-icon { font-size: 2.2rem; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-label { font-size: 0.85rem; color: #665275; font-weight: 600; }
    .metric-value { font-size: 1.4rem; font-weight: 700; color: #333; }
    .bg-ingresos { background: #EAF6F0; border-left: 6px solid #4E9F76; }
    .bg-gastos { background: #FDEEF4; border-left: 6px solid #D4566A; }
    .bg-ahorros { background: #FFF9EB; border-left: 6px solid #F4C430; }
    .bg-fijos { background: #F0F4FF; border-left: 6px solid #5A82E6; }
    .summary-table-section { display: flex; flex-direction: column; gap: 16px; }
    .summary-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .summary-table th, .summary-table td { padding: 12px; text-align: right; border-bottom: 1px solid #FFF0F4; font-size: 0.9rem; }
    .summary-table th { background: #FFF0F4; color: #4A3F55; text-align: right; }
    .summary-table th:first-child, .summary-table td:first-child { text-align: left; }
    .concept-cell { font-weight: 600; }
    .total-col { font-weight: 700; background: #FFF0F4; }
    .negative { color: #D4566A; font-weight: 700; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px; }
    .chart-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .chart-wrapper { position: relative; height: 320px; width: 100%; }
    .months-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .month-card { text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .month-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(212, 86, 106, 0.15); }
    .month-card-header { display: flex; align-items: center; gap: 12px; }
    .month-number-badge { background: #D4566A; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .month-title { margin: 0; font-size: 1.2rem; }
    .click-text { font-size: 0.85rem; color: #D4566A; font-weight: 600; margin: 0; }
  `]
})
export class YearDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  yearId!: number;
  yearData?: Year;
  summary?: AnnualSummary;
  categoryChartData: CategoryChartData[] = [];

  mainChart?: Chart;
  catChart?: Chart;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    this.apiService.getYearById(this.yearId).subscribe({
      next: (y) => this.yearData = y,
      error: (err) => this.toastService.error(err.error?.message || 'Error al cargar datos del año')
    });

    this.apiService.getAnnualSummary(this.yearId).subscribe({
      next: (sum) => {
        this.summary = sum;
        setTimeout(() => this.renderMainChart(), 100);
      },
      error: (err) => this.toastService.error(err.error?.message || 'Error al cargar resumen anual')
    });

    this.apiService.getAnnualCategoryCharts(this.yearId).subscribe({
      next: (catData) => {
        this.categoryChartData = catData;
        setTimeout(() => this.renderCategoryChart(), 100);
      },
      error: (err) => console.error(err)
    });
  }

  renderMainChart(): void {
    if (!this.summary) return;
    const ctx = document.getElementById('annualMainChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.mainChart) this.mainChart.destroy();

    const labels = this.summary.months.map(m => m.monthName);
    const incomeData = this.summary.months.map(m => m.income);
    const expenseData = this.summary.months.map(m => m.expenses);
    const savingsData = this.summary.months.map(m => m.savings);
    const fixedData = this.summary.months.map(m => m.fixed);

    this.mainChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Ingresos', data: incomeData, backgroundColor: '#4E9F76' },
          { label: 'Gastos Total', data: expenseData, backgroundColor: '#D4566A' },
          { label: 'Ahorros', data: savingsData, backgroundColor: '#F4C430' },
          { label: 'Gastos Fijos', data: fixedData, backgroundColor: '#5A82E6' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  renderCategoryChart(): void {
    if (!this.categoryChartData || this.categoryChartData.length === 0) return;
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.catChart) this.catChart.destroy();

    const labels = this.categoryChartData.map(c => c.categoryName);
    const data = this.categoryChartData.map(c => (c.monthlyData || []).reduce((sum, val) => sum + val, 0));
    const bgColors = this.categoryChartData.map(c => c.categoryColor);

    this.catChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: bgColors }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  trackById(index: number, item: any): number { return item.id; }
  trackByMonthNumber(index: number, m: any): number { return m.monthNumber || index; }
}
