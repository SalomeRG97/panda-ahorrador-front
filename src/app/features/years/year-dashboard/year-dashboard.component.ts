import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Year } from '../../../core/interfaces/year.interface';
import { AnnualSummary, CategoryChartData } from '../../../core/interfaces/summary.interface';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-year-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
            <span class="metric-value">$ {{ summary.totals.income | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-gastos">
          <span class="metric-icon">💸</span>
          <div class="metric-info">
            <span class="metric-label">Total Gastos</span>
            <span class="metric-value">$ {{ summary.totals.expenses | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-ahorros">
          <span class="metric-icon">🪙</span>
          <div class="metric-info">
            <span class="metric-label">Total Ahorros</span>
            <span class="metric-value">$ {{ summary.totals.savings | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="metric-card card-pastel bg-fijos">
          <span class="metric-icon">📌</span>
          <div class="metric-info">
            <span class="metric-label">Total Fijos</span>
            <span class="metric-value">$ {{ summary.totals.fixed | number:'1.2-2' }}</span>
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
                <th *ngFor="let m of summary?.months">{{ m.monthName }}</th>
                <th class="total-col">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody>
              <!-- INGRESOS -->
              <tr class="row-ingresos">
                <td class="concept-cell">
                  <span class="badge-concept-ingreso badge-category">💰 Ingresos</span>
                </td>
                <td *ngFor="let m of summary?.months">$ {{ m.income | number:'1.0-0' }}</td>
                <td class="total-col">$ {{ summary?.totals?.income | number:'1.2-2' }}</td>
              </tr>
              <!-- GASTOS -->
              <tr class="row-gastos">
                <td class="concept-cell">
                  <span class="badge-concept-gasto badge-category">💸 Gastos</span>
                </td>
                <td *ngFor="let m of summary?.months">$ {{ m.expenses | number:'1.0-0' }}</td>
                <td class="total-col">$ {{ summary?.totals?.expenses | number:'1.2-2' }}</td>
              </tr>
              <!-- AHORROS -->
              <tr class="row-ahorros">
                <td class="concept-cell">
                  <span class="badge-concept-ahorro badge-category">🪙 Ahorros</span>
                </td>
                <td *ngFor="let m of summary?.months">$ {{ m.savings | number:'1.0-0' }}</td>
                <td class="total-col">$ {{ summary?.totals?.savings | number:'1.2-2' }}</td>
              </tr>
              <!-- FIJOS -->
              <tr class="row-fijos">
                <td class="concept-cell">
                  <span class="badge-concept-fijo badge-category">📌 Gastos Fijos</span>
                </td>
                <td *ngFor="let m of summary?.months">$ {{ m.fixed | number:'1.0-0' }}</td>
                <td class="total-col">$ {{ summary?.totals?.fixed | number:'1.2-2' }}</td>
              </tr>
              <!-- RESTANTE -->
              <tr class="row-restante">
                <td class="concept-cell">
                  <span class="badge-category" style="background:#A8D8EA; color:#1E4B5E">⚖️ Restante</span>
                </td>
                <td *ngFor="let m of summary?.months" [class.negative]="m.remaining < 0">
                  $ {{ m.remaining | number:'1.0-0' }}
                </td>
                <td class="total-col" [class.negative]="summary?.totals?.remaining! < 0">
                  $ {{ summary?.totals?.remaining | number:'1.2-2' }}
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
          <a *ngFor="let m of yearData.months" [routerLink]="['/years', yearData.id, 'months', m.id]" class="month-card card-pastel">
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
    .dashboard-container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .bg-ingresos { background: #EAF6F0; border-color: #A8D5BA; }
    .bg-gastos { background: #FDEEF4; border-color: #E8A0BF; }
    .bg-ahorros { background: #FFF9EB; border-color: #F0D9A0; }
    .bg-fijos { background: #F4F0F9; border-color: #C4B7D5; }
    
    .metric-icon { font-size: 2.2rem; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-label { font-size: 0.85rem; color: #665275; font-weight: 600; }
    .metric-value { font-size: 1.4rem; font-weight: 700; color: #4A3F55; }

    .summary-table-section {
      padding: 24px;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    .summary-table th, .summary-table td {
      padding: 12px 14px;
      text-align: center;
      border-bottom: 1px solid #FFF0F4;
    }
    .summary-table th {
      background-color: #FFF0F4;
      color: #4A3F55;
      font-weight: 700;
    }
    .concept-cell {
      text-align: left !important;
    }
    .total-col {
      font-weight: 700;
      background-color: #FAF5FF;
    }
    .negative {
      color: #D4566A;
      font-weight: 700;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
    }
    .chart-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .chart-wrapper {
      position: relative;
      height: 300px;
    }
    .months-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .month-card {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.3s ease;
      border: 2px solid #F4A6C1;
    }
    .month-card:hover {
      transform: translateY(-4px);
      background: #FFF0F4;
      border-color: #D4566A;
    }
    .month-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .month-number-badge {
      background: #D4566A;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .month-title {
      font-family: 'Caveat', cursive;
      font-size: 1.8rem;
      color: #4A3F55;
    }
    .click-text {
      font-size: 0.85rem;
      color: #D4566A;
      font-weight: 600;
    }
  `]
})
export class YearDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  yearId!: number;
  yearData?: Year;
  summary?: AnnualSummary;
  categoryChartData: CategoryChartData[] = [];

  mainChart?: Chart;
  categoryChart?: Chart;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.yearId = +params['yearId'];
      this.loadDashboard();
    });
  }

  loadDashboard(): void {
    this.apiService.getYearById(this.yearId).subscribe(data => {
      this.yearData = data;
    });

    this.apiService.getAnnualSummary(this.yearId).subscribe(summaryData => {
      this.summary = summaryData;
      setTimeout(() => this.renderMainChart(), 100);
    });

    this.apiService.getAnnualCategoryCharts(this.yearId).subscribe(catData => {
      this.categoryChartData = catData;
      setTimeout(() => this.renderCategoryChart(), 100);
    });
  }

  renderMainChart(): void {
    const canvas = document.getElementById('annualMainChart') as HTMLCanvasElement;
    if (!canvas || !this.summary) return;

    if (this.mainChart) this.mainChart.destroy();

    const labels = this.summary.months.map(m => m.monthName);

    this.mainChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos',
            data: this.summary.months.map(m => m.income),
            backgroundColor: '#A8D5BA'
          },
          {
            label: 'Gastos',
            data: this.summary.months.map(m => m.expenses),
            backgroundColor: '#E8A0BF'
          },
          {
            label: 'Ahorros',
            data: this.summary.months.map(m => m.savings),
            backgroundColor: '#F0D9A0'
          },
          {
            label: 'Gastos Fijos',
            data: this.summary.months.map(m => m.fixed),
            backgroundColor: '#C4B7D5'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  renderCategoryChart(): void {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas || this.categoryChartData.length === 0) return;

    if (this.categoryChart) this.categoryChart.destroy();

    const datasets = this.categoryChartData.map(c => ({
      label: c.categoryName,
      data: c.monthlyData,
      backgroundColor: c.categoryColor
    }));

    const labels = this.summary ? this.summary.months.map(m => m.monthName) : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.categoryChart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });
  }
}
