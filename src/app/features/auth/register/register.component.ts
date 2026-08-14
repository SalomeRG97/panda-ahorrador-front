import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmailService } from '../../../core/services/email.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container animate-fade-in-up">
      <div class="auth-card card-pastel">
        <div class="auth-header">
          <img src="assets/images/logo.png" alt="Panda Logo" class="auth-logo">
          <h1 class="chinese-title">新用户注册</h1>
          <h2>Crear una Cuenta</h2>
          <p class="auth-subtitle">Comienza a organizar tus finanzas con el Panda 🐼</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="name"><i class="fa-solid fa-user"></i> Nombre Completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              [(ngModel)]="name" 
              placeholder="Ej. Salomé Pérez" 
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="username"><i class="fa-solid fa-at"></i> Nombre de Usuario</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="username" 
              placeholder="Ej. salome_p" 
              required
              class="form-control"
            >
          </div>

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
            <label for="password"><i class="fa-solid fa-lock"></i> Contraseña Segura</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              (input)="evaluatePassword()"
              placeholder="Mínimo 8 caracteres" 
              required
              class="form-control"
            >

            <!-- Barra de fuerza e indicador visual -->
            @if (password.length > 0) {
              <div class="strength-bar-wrapper">
                <div class="strength-bar" [style.width.%]="strengthPercent()" [class]="strengthClass()"></div>
              </div>
              <ul class="strength-checklist">
                <li [class.valid]="passCriteria.minLen"><i class="fa-solid" [ngClass]="passCriteria.minLen ? 'fa-check' : 'fa-xmark'"></i> Mínimo 8 caracteres</li>
                <li [class.valid]="passCriteria.upper"><i class="fa-solid" [ngClass]="passCriteria.upper ? 'fa-check' : 'fa-xmark'"></i> Una letra mayúscula</li>
                <li [class.valid]="passCriteria.lower"><i class="fa-solid" [ngClass]="passCriteria.lower ? 'fa-check' : 'fa-xmark'"></i> Una letra minúscula</li>
                <li [class.valid]="passCriteria.number"><i class="fa-solid" [ngClass]="passCriteria.number ? 'fa-check' : 'fa-xmark'"></i> Un número</li>
                <li [class.valid]="passCriteria.special"><i class="fa-solid" [ngClass]="passCriteria.special ? 'fa-check' : 'fa-xmark'"></i> Un carácter especial (&#64;$!%*?&.#_-)</li>
              </ul>
            }
          </div>

          <button type="submit" class="btn-pastel btn-primary-pastel w-100" [disabled]="loading() || !isPasswordValid()">
            @if (loading()) {
              <i class="fa-solid fa-spinner fa-spin"></i> Registrando...
            } @else {
              <i class="fa-solid fa-user-plus"></i> Registrarme
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/login" class="link-pastel">Inicia sesión</a></p>
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
      max-width: 440px;
      padding: 32px 28px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .auth-logo {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(212, 86, 106, 0.25);
      margin-bottom: 10px;
    }
    .chinese-title {
      font-size: 1.7rem;
      color: var(--accent-red);
      margin: 0;
    }
    h2 {
      font-size: 1.3rem;
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
      gap: 14px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-dark);
    }
    .form-control {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid #F4A6C1;
      background-color: #FFF0F4;
      font-family: var(--font-body);
      font-size: 0.9rem;
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
    .strength-bar-wrapper {
      height: 6px;
      background: #E0E0E0;
      border-radius: 3px;
      margin-top: 6px;
      overflow: hidden;
    }
    .strength-bar {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }
    .strength-weak { background-color: #E53935; }
    .strength-medium { background-color: #FB8C00; }
    .strength-strong { background-color: #43A047; }

    .strength-checklist {
      list-style: none;
      padding: 0;
      margin: 8px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 0.75rem;
      color: #9E9E9E;
    }
    .strength-checklist li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .strength-checklist li.valid {
      color: #2E7D32;
      font-weight: 600;
    }

    .auth-footer {
      text-align: center;
      margin-top: 18px;
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  name = '';
  username = '';
  email = '';
  password = '';
  loading = signal(false);

  passCriteria = {
    minLen: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  };

  evaluatePassword(): void {
    const p = this.password;
    this.passCriteria = {
      minLen: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[@$!%*?&.#_\-]/.test(p)
    };
  }

  isPasswordValid(): boolean {
    return Object.values(this.passCriteria).every(Boolean);
  }

  strengthPercent(): number {
    const count = Object.values(this.passCriteria).filter(Boolean).length;
    return (count / 5) * 100;
  }

  strengthClass(): string {
    const pct = this.strengthPercent();
    if (pct <= 40) return 'strength-weak';
    if (pct <= 80) return 'strength-medium';
    return 'strength-strong';
  }

  onSubmit(): void {
    if (!this.name || !this.username || !this.email || !this.password) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    if (!this.isPasswordValid()) {
      this.toastService.error('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    this.loading.set(true);

    this.authService.register({
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: async () => {
        this.loading.set(false);
        this.toastService.success('¡Registro exitoso! Te hemos enviado un correo de bienvenida 🌸');
        
        // Enviar email de verificación vía EmailJS
        await this.emailService.sendVerificationEmail(this.email, this.name);
        
        this.router.navigate(['/years']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Error al registrar usuario');
      }
    });
  }
}
