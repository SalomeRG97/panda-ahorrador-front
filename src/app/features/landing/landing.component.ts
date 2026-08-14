import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, TodayShortcuts } from '../../core/services/api.service';
import { Category } from '../../core/interfaces/category.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container animate-fade-in-up">

      <!-- WIDGETS DE ACCESO DIRECTO (SEGÚN LA FECHA DE HOY) -->
      <section class="shortcuts-section">
        <div class="shortcuts-header">
          <span class="shortcuts-title">⚡ Accesos Directos de Hoy</span>
          <span class="shortcuts-date">🌸 {{ shortcuts?.todayStr || 'Hoy' }}</span>
        </div>

        <div class="shortcuts-grid">
          <!-- WIDGET 1: AÑO ACTUAL -->
          <div class="shortcut-card card-pastel">
            <div class="shortcut-icon-wrapper bg-icon-year">📅</div>
            <div class="shortcut-info">
              <span class="shortcut-tag">Año {{ shortcuts?.currentYearNum }}</span>
              <h3 class="shortcut-name">
                {{ shortcuts?.year ? 'Año ' + shortcuts?.year?.year : 'Año ' + shortcuts?.currentYearNum }}
              </h3>
              <p class="shortcut-desc">Dashboard Anual</p>
            </div>
            <a *ngIf="shortcuts?.year" [routerLink]="['/years', shortcuts?.year?.id]" class="btn-pastel btn-primary-pastel btn-shortcut">
              Ir al Año <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a *ngIf="!shortcuts?.year" routerLink="/years" class="btn-pastel btn-secondary-pastel btn-shortcut">
              Crear Año <i class="fa-solid fa-plus"></i>
            </a>
          </div>

          <!-- WIDGET 2: MES ACTUAL -->
          <div class="shortcut-card card-pastel">
            <div class="shortcut-icon-wrapper bg-icon-month">📆</div>
            <div class="shortcut-info">
              <span class="shortcut-tag">Mes Actual</span>
              <h3 class="shortcut-name">
                {{ shortcuts?.month ? shortcuts?.month?.month_name : 'Ver Mes' }}
              </h3>
              <p class="shortcut-desc">Agenda Mensual</p>
            </div>
            <a *ngIf="shortcuts?.year && shortcuts?.month" [routerLink]="['/years', shortcuts?.year?.id, 'months', shortcuts?.month?.id]" class="btn-pastel btn-primary-pastel btn-shortcut">
              Ir al Mes <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a *ngIf="!shortcuts?.month" routerLink="/years" class="btn-pastel btn-secondary-pastel btn-shortcut">
              Ver Meses <i class="fa-solid fa-calendar"></i>
            </a>
          </div>

          <!-- WIDGET 3: SEMANA ACTUAL -->
          <div class="shortcut-card card-pastel">
            <div class="shortcut-icon-wrapper bg-icon-week">⏱️</div>
            <div class="shortcut-info">
              <span class="shortcut-tag">Semana Actual</span>
              <h3 class="shortcut-name">
                {{ shortcuts?.week ? 'Semana ' + shortcuts?.week?.week_number : 'Semana Actual' }}
              </h3>
              <p class="shortcut-desc">
                {{ shortcuts?.week ? (shortcuts?.week?.start_date | date:'dd/MM') + ' - ' + (shortcuts?.week?.end_date | date:'dd/MM') : 'Seguimiento Semanal' }}
              </p>
            </div>
            <a *ngIf="shortcuts?.year && shortcuts?.month && shortcuts?.week" 
               [routerLink]="['/years', shortcuts?.year?.id, 'months', shortcuts?.month?.id, 'weeks', shortcuts?.week?.id]" 
               class="btn-pastel btn-primary-pastel btn-shortcut">
              Ir a Semana <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a *ngIf="!shortcuts?.week" routerLink="/years" class="btn-pastel btn-secondary-pastel btn-shortcut">
              Ver Semana <i class="fa-solid fa-list-check"></i>
            </a>
          </div>

          <!-- WIDGET 4: RETO ACTUAL -->
          <div class="shortcut-card card-pastel">
            <div class="shortcut-icon-wrapper bg-icon-reto">🎯</div>
            <div class="shortcut-info">
              <span class="shortcut-tag">Reto Actual</span>
              <h3 class="shortcut-name">
                {{ shortcuts?.challenge ? shortcuts?.challenge?.icon + ' ' + shortcuts?.challenge?.title : 'Reto del Mes' }}
              </h3>
              <p class="shortcut-desc">Desafío de Ahorro</p>
            </div>
            <a *ngIf="shortcuts?.year && shortcuts?.month" 
               [routerLink]="['/years', shortcuts?.year?.id, 'months', shortcuts?.month?.id]" 
               [queryParams]="{ tab: 'challenge' }"
               class="btn-pastel btn-primary-pastel btn-shortcut">
              Ir al Reto <i class="fa-solid fa-bullseye"></i>
            </a>
            <a *ngIf="!shortcuts?.month" routerLink="/years" class="btn-pastel btn-secondary-pastel btn-shortcut">
              Ver Retos <i class="fa-solid fa-trophy"></i>
            </a>
          </div>
        </div>
      </section>

      <!-- HERO SECTION -->
      <section class="hero-card card-pastel">
        <div class="hero-content">
          <div class="hero-badge">
            <span>🌸 欢迎 - Bienvenido 🌸</span>
          </div>
          <h1 class="hero-title">
            <span class="chinese-title">熊猫理财</span>
            <span class="subtitle">El panda ahorrador</span>
          </h1>
          <p class="hero-description">
            Un espacio cálido, intuitivo y con armonía oriental para el seguimiento de tus finanzas anuales, 
            mes a mes, con retos interactivos y visuales diseñados en tonalidades pasteles.
          </p>
          <div class="hero-actions">
            <a routerLink="/years" class="btn-pastel btn-primary-pastel">
              <i class="fa-solid fa-calendar-plus"></i> Comenzar seguimiento
            </a>
          </div>
        </div>
        <div class="hero-image-wrapper">
          <img src="assets/images/logo.png" alt="Panda Ahorrador Logo" class="hero-panda-img">
        </div>
      </section>

      <!-- CÓMO FUNCIONA (DESPLEGABLE TIPO MANUAL) -->
      <section class="manual-section">
        <button (click)="toggleManual()" class="manual-toggle-btn card-pastel">
          <div class="manual-toggle-title">
            <span class="manual-icon">📖</span>
            <div>
              <h2>Manual de Uso — ¿Cómo funciona?</h2>
              <p class="manual-subtitle">Haz clic para desplegar o colapsar el manual interactivo de la app</p>
            </div>
          </div>
          <span class="manual-badge">
            {{ isManualOpen ? 'Ocultar Manual ▲' : 'Desplegar Manual ▼' }}
          </span>
        </button>

        <div class="manual-content card-pastel" *ngIf="isManualOpen">
          <!-- PASOS DE CÓMO FUNCIONA -->
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3>1. Crea tu Año</h3>
              <p>Selecciona tu año de inicio y el mes de arranque (ej: Agosto). La app generará automáticamente tus meses hasta diciembre.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📆</div>
              <h3>2. Calendario & Presupuesto</h3>
              <p>Planifica tus gastos en el calendario mensual con etiquetas coloreadas por categoría. Cada gasto cuenta con un popup interactivo.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>3. Seguimiento Semanal & Gráficos</h3>
              <p>Monitorea el valor real gastado en cada semana, analiza gráficos por categoría y lleva el control exacto de tus ingresos y ahorros.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h3>4. Retos Interactivos</h3>
              <p>Supera cada mes un reto interactivo aleatorio (ej: "No gastos hormiga", "Cocina en casa") coloreando tus días de cumplimiento.</p>
            </div>
          </div>

          <!-- CATEGORÍAS & COLORES PASTEL DENTRO DEL MANUAL -->
          <div class="categories-section" style="margin-top: 32px; padding-top: 24px; border-top: 2px dashed #F4A6C1;">
            <div class="chinese-title-wrapper" style="text-align: center; margin-bottom: 12px;">
              <h2>Categorías & Colores Pasteles</h2>
            </div>
            <p class="categories-subtitle">Cada categoría tiene un color único que te acompañará en calendarios, listas y gráficos:</p>

            <div class="categories-grid">
              <div *ngFor="let cat of categories; trackBy: trackById" class="category-card" [style.backgroundColor]="cat.color">
                <span class="category-icon">{{ cat.icon }}</span>
                <span class="category-name">{{ cat.name }}</span>
              </div>
            </div>

            <!-- NOTA EDITAR CATEGORÍAS EN CONFIGURACIÓN -->
            <div class="settings-notice-card card-pastel">
              <div class="notice-icon">⚙️</div>
              <div class="notice-text">
                <strong>¿Quieres modificar o crear más categorías?</strong>
                <p>Puedes editar los nombres, colores e iconos de tus categorías en cualquier momento desde la sección de <strong>Configuración</strong>.</p>
              </div>
              <a routerLink="/settings" class="btn-pastel btn-secondary-pastel btn-settings">
                <i class="fa-solid fa-gear"></i> Ir a Configuración
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .landing-container {
      max-width: 1100px;
      margin: 20px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    /* WIDGETS ACCESO DIRECTO */
    .shortcuts-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .shortcuts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .shortcuts-title {
      font-family: 'Comfortaa', cursive;
      font-size: 1.15rem;
      font-weight: 700;
      color: #D4566A;
    }
    .shortcuts-date {
      font-size: 0.85rem;
      font-weight: 600;
      color: #665275;
      background: #FFF0F4;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid #F4A6C1;
    }
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
    }
    .shortcut-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 18px;
      border: 2px solid #F4A6C1;
      transition: transform 0.25 ease, box-shadow 0.25s ease;
      background: #FFFFFF;
    }
    .shortcut-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(212, 86, 106, 0.15);
    }
    .shortcut-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .bg-icon-year { background: #FFE5EC; }
    .bg-icon-month { background: #EAF6F0; }
    .bg-icon-week { background: #FFF9EB; }
    .bg-icon-reto { background: #F0F4FF; }

    .shortcut-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .shortcut-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #D4566A;
    }
    .shortcut-name {
      margin: 0;
      font-size: 1.1rem;
      color: #4A3F55;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .shortcut-desc {
      margin: 0;
      font-size: 0.8rem;
      color: #8C7B99;
    }
    .btn-shortcut {
      margin-top: 4px;
      width: 100%;
      text-align: center;
      justify-content: center;
      font-size: 0.82rem;
      padding: 8px 12px;
    }

    /* HERO CARD */
    .hero-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
      background: linear-gradient(135deg, #FFFFFF 0%, #FFF0F4 100%);
      border: 2px solid #F4A6C1;
      padding: 36px;
    }
    .hero-content { flex: 1; }
    .hero-badge {
      display: inline-block;
      background: #FFE5EC;
      color: #D4566A;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .hero-title { display: flex; flex-direction: column; margin-bottom: 16px; }
    .chinese-title { font-size: 3.2rem; color: #D4566A; line-height: 1; }
    .subtitle { font-size: 1.6rem; color: #4A3F55; }
    .hero-description { font-size: 1rem; color: #665275; margin-bottom: 24px; }
    .hero-panda-img {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      box-shadow: 0 10px 25px rgba(212, 86, 106, 0.2);
    }

    /* MANUAL SECCIÓN */
    .manual-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .manual-toggle-btn {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      background: #FFF0F4;
      border: 2px solid #F4A6C1;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .manual-toggle-btn:hover {
      background: #FFE5EC;
      transform: translateY(-2px);
    }
    .manual-toggle-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .manual-icon { font-size: 2.2rem; }
    .manual-toggle-title h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #D4566A;
      font-family: 'Comfortaa', cursive;
    }
    .manual-subtitle {
      margin: 2px 0 0 0;
      font-size: 0.85rem;
      color: #665275;
    }
    .manual-badge {
      background: #D4566A;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .manual-content {
      padding: 24px;
      background: #FFFFFF;
      border: 2px solid #F4A6C1;
      animation: fadeIn 0.3s ease;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .feature-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #FFF9FA;
      border-radius: 16px;
      border: 1px dashed #F4A6C1;
    }
    .feature-icon { font-size: 2.2rem; }

    /* CATEGORÍAS */
    .categories-subtitle { text-align: center; color: #665275; margin-bottom: 20px; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .category-card {
      padding: 16px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: #333;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      transition: transform 0.2s ease;
    }
    .category-card:hover { transform: scale(1.05); }
    .category-icon { font-size: 1.8rem; }

    /* NOTA CONFIGURACIÓN */
    .settings-notice-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #FFF0F4;
      border: 1.5px solid #F4A6C1;
      margin-top: 10px;
    }
    .notice-icon { font-size: 2rem; }
    .notice-text { flex: 1; color: #4A3F55; font-size: 0.9rem; }
    .notice-text strong { color: #D4566A; }
    .notice-text p { margin: 4px 0 0 0; color: #665275; }
    .btn-settings { white-space: nowrap; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .hero-card { flex-direction: column; text-align: center; }
      .manual-toggle-btn { flex-direction: column; gap: 12px; text-align: center; }
      .manual-toggle-title { flex-direction: column; text-align: center; }
      .settings-notice-card { flex-direction: column; text-align: center; }
    }
  `]
})
export class LandingComponent implements OnInit {
  private apiService = inject(ApiService);

  categories: Category[] = [];
  shortcuts?: TodayShortcuts;
  isManualOpen = false;

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: (err: any) => console.error(err)
    });

    this.apiService.getTodayShortcuts().subscribe({
      next: (data: TodayShortcuts) => this.shortcuts = data,
      error: (err: any) => console.error('Error al cargar accesos directos de hoy', err)
    });
  }

  toggleManual(): void {
    this.isManualOpen = !this.isManualOpen;
  }

  trackById(index: number, cat: Category): number { return cat.id; }
}
