import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container animate-fade-in-up">
      <div class="auth-card card-pastel">
        <div class="auth-header">
          <img src="assets/images/logo.png" alt="Panda Logo" class="auth-logo">
          <h1 class="chinese-title">欢迎登录</h1>
          <h2>Iniciar Sesión</h2>
          <p class="auth-subtitle">El panda ahorrador te da la bienvenida 🌸</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email"><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              placeholder="tu@correo.com" 
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="password"><i class="fa-solid fa-lock"></i> Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              placeholder="••••••••" 
              required
              class="form-control"
            >
          </div>

          <button type="submit" class="btn-pastel btn-primary-pastel w-100" [disabled]="loading()">
            @if (loading()) {
              <i class="fa-solid fa-spinner fa-spin"></i> Entrando...
            } @else {
              <i class="fa-solid fa-right-to-bracket"></i> Ingresar
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes una cuenta? <a routerLink="/register" class="link-pastel">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 32px 28px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .auth-logo {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(212, 86, 106, 0.25);
      margin-bottom: 12px;
    }
    .chinese-title {
      font-size: 1.8rem;
      color: var(--accent-red);
      margin: 0;
    }
    h2 {
      font-size: 1.4rem;
      color: var(--text-dark);
      margin-top: 4px;
    }
    .auth-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-dark);
    }
    .form-control {
      padding: 12px 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid #F4A6C1;
      background-color: #FFF0F4;
      font-family: var(--font-body);
      font-size: 0.95rem;
      transition: all 0.3s ease;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--accent-red);
      background-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(212, 86, 106, 0.15);
    }
    .w-100 {
      width: 100%;
      margin-top: 8px;
      padding: 12px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .link-pastel {
      color: var(--accent-red);
      font-weight: 600;
      text-decoration: none;
    }
    .link-pastel:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.toastService.warning('Por favor ingresa tu correo y contraseña');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('¡Bienvenido de nuevo! 🌸');
        this.router.navigate(['/years']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      }
    });
  }
}

