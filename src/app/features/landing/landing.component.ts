import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/interfaces/category.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container animate-fade-in-up">
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

      <!-- CÓMO FUNCIONA -->
      <section class="features-section">
        <div class="chinese-title-wrapper">
          <h2>¿Cómo funciona?</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card card-pastel">
            <div class="feature-icon">📅</div>
            <h3>1. Crea tu Año</h3>
            <p>Selecciona tu año de inicio y el mes de arranque (ej: Agosto). La app generará automáticamente tus meses hasta diciembre.</p>
          </div>
          <div class="feature-card card-pastel">
            <div class="feature-icon">📆</div>
            <h3>2. Calendario & Presupuesto</h3>
            <p>Planifica tus gastos en el calendario mensual con etiquetas coloreadas por categoría. Cada gasto cuenta con un popup interactivo.</p>
          </div>
          <div class="feature-card card-pastel">
            <div class="feature-icon">📊</div>
            <h3>3. Seguimiento Semanal & Gráficos</h3>
            <p>Monitorea el valor real gastado en cada semana, analiza gráficos por categoría y lleva el control exacto de tus ingresos y ahorros.</p>
          </div>
          <div class="feature-card card-pastel">
            <div class="feature-icon">🎯</div>
            <h3>4. Retos Interactivos</h3>
            <p>Supera cada mes un reto interactivo aleatorio (ej: "No gastos hormiga", "Cocina en casa") coloreando tus días de cumplimiento.</p>
          </div>
        </div>
      </section>

      <!-- CATEGORÍAS & COLORES -->
      <section class="categories-section">
        <div class="chinese-title-wrapper">
          <h2>Categorías & Colores Pasteles</h2>
        </div>
        <p class="categories-subtitle">Cada categoría tiene un color único que te acompañará en calendarios, listas y gráficos:</p>
        <div class="categories-grid">
          <div *ngFor="let cat of categories; trackBy: trackById" class="category-card" [style.backgroundColor]="cat.color">
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.name }}</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-container {
      max-width: 1100px;
      margin: 30px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .hero-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
      background: linear-gradient(135deg, #FFFFFF 0%, #FFF0F4 100%);
      border: 2px solid #F4A6C1;
      padding: 40px;
    }
    .hero-content {
      flex: 1;
    }
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
    .hero-title {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }
    .chinese-title {
      font-size: 3.5rem;
      color: #D4566A;
      line-height: 1;
    }
    .subtitle {
      font-size: 1.8rem;
      color: #4A3F55;
    }
    .hero-description {
      font-size: 1.05rem;
      color: #665275;
      margin-bottom: 24px;
    }
    .hero-panda-img {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      box-shadow: 0 10px 25px rgba(212, 86, 106, 0.2);
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
    }
    .feature-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .feature-icon {
      font-size: 2.5rem;
    }
    .categories-subtitle {
      text-align: center;
      color: #665275;
      margin-bottom: 20px;
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 16px;
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
    .category-card:hover {
      transform: scale(1.05);
    }
    .category-icon {
      font-size: 1.8rem;
    }
    @media (max-width: 768px) {
      .hero-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private apiService = inject(ApiService);
  categories: Category[] = [];

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: (err: any) => console.error(err)
    });
  }

  trackById(index: number, cat: Category): number { return cat.id; }
}

