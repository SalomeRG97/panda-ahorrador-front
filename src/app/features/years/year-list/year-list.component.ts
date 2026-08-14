import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Year } from '../../../core/interfaces/year.interface';

@Component({
  selector: 'app-year-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="years-container animate-fade-in-up">
      <div class="header-actions">
        <div>
          <h1 class="chinese-title">Mis Años — 年份</h1>
          <p class="subtitle">Gestiona tus planes de seguimiento financiero por cada año.</p>
        </div>
        <button (click)="openModal()" class="btn-pastel btn-primary-pastel">
          <i class="fa-solid fa-plus"></i> Crear Nuevo Año
        </button>
      </div>

      <!-- GRID DE AÑOS -->
      <div class="years-grid" *ngIf="years.length > 0; else emptyState">
        <div *ngFor="let y of years; trackBy: trackById" class="year-card card-pastel">
          <div class="year-header">
            <span class="year-number">{{ y.year }}</span>
            <span class="year-badge">🌸 {{ getMonthName(y.start_month) }} - {{ getMonthName(y.end_month) }}</span>
          </div>
          <p class="year-info">
            <i class="fa-solid fa-calendar-check"></i> Meses creados: {{ (y.end_month - y.start_month + 1) }}
          </p>
          <div class="year-actions">
            <a [routerLink]="['/years', y.id]" class="btn-pastel btn-primary-pastel btn-sm">
              <i class="fa-solid fa-chart-line"></i> Abrir Dashboard
            </a>
            <button (click)="deleteYear(y.id, y.year)" class="btn-pastel btn-delete-sm" title="Eliminar año">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ESTADO VACÍO -->
      <ng-template #emptyState>
        <div class="empty-card card-pastel">
          <div class="empty-icon">🏮</div>
          <h3>Aún no has creado ningún año</h3>
          <p>Haz clic en "Crear Nuevo Año" para comenzar a planificar tus finanzas desde el mes que prefieras.</p>
          <button (click)="openModal()" class="btn-pastel btn-primary-pastel">
            <i class="fa-solid fa-plus"></i> Crear Año Ahora
          </button>
        </div>
      </ng-template>

      <!-- MODAL CREAR AÑO -->
      <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>🌸 Crear Nuevo Año — 新增年份</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Año (ej: 2026):</label>
              <input type="number" [(ngModel)]="newYear" class="form-input" min="2020" max="2100">
            </div>
            <div class="form-group">
              <label>Mes de inicio:</label>
              <select [(ngModel)]="newStartMonth" class="form-input">
                <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
              </select>
              <small class="help-text">Se crearán automáticamente los meses desde este mes hasta Diciembre.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
            <button (click)="saveYear()" class="btn-pastel btn-primary-pastel" [disabled]="loading">
              <i class="fa-solid fa-check"></i> {{ loading ? 'Creando...' : 'Crear Año' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .years-container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 16px; }
    .years-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .year-card { display: flex; flex-direction: column; gap: 16px; }
    .year-header { display: flex; justify-content: space-between; align-items: center; }
    .year-number { font-family: 'Caveat', cursive; font-size: 3rem; font-weight: 700; color: #D4566A; }
    .year-badge { background: #FFF0F4; border: 1px solid #F4A6C1; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #4A3F55; }
    .year-info { color: #665275; font-size: 0.95rem; }
    .year-actions { display: flex; gap: 10px; }
    .btn-sm { padding: 8px 16px; font-size: 0.9rem; flex: 1; justify-content: center; }
    .btn-delete-sm { background: #FFE5EC; color: #D4566A; border: 1px solid #F4A6C1; padding: 8px 12px; border-radius: 12px; cursor: pointer; }
    .empty-card { text-align: center; padding: 50px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-icon { font-size: 3.5rem; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-card { width: 100%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    .form-input { padding: 10px; border-radius: 10px; border: 1.5px solid #F4A6C1; font-family: 'Comfortaa', cursive; outline: none; }
    .help-text { font-size: 0.8rem; color: #888; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
  `]
})
export class YearListComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  years: Year[] = [];
  showModal = false;
  newYear: number = new Date().getFullYear();
  newStartMonth: number = new Date().getMonth() + 1;
  loading = false;

  monthOptions = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  ngOnInit(): void {
    this.loadYears();
  }

  loadYears(): void {
    this.apiService.getYears().subscribe({
      next: (data: Year[]) => this.years = data,
      error: (err: any) => this.toastService.error(err.error?.message || 'Error al cargar lista de años')
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveYear(): void {
    if (!this.newYear || !this.newStartMonth) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    this.apiService.createYear(this.newYear, this.newStartMonth).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Año presupuestal creado exitosamente 🌸');
        this.closeModal();
        this.loadYears();
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Error al crear el año');
      }
    });
  }

  async deleteYear(id: number, yearNum: number): Promise<void> {
    const confirmed = await this.toastService.confirm(`¿Estás segura de eliminar el año ${yearNum}? Se borrarán todos sus gastos e ingresos.`);
    if (!confirmed) return;

    this.apiService.deleteYear(id).subscribe({
      next: () => {
        this.toastService.success(`Año ${yearNum} eliminado`);
        this.loadYears();
      },
      error: (err: any) => this.toastService.error(err.error?.message || 'Error al eliminar el año')
    });
  }

  getMonthName(monthNum: number): string {
    const opt = this.monthOptions.find(o => o.value === monthNum);
    return opt ? opt.label : '';
  }

  trackById(index: number, y: Year): number { return y.id; }
}
