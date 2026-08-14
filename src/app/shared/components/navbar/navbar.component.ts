import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-header">
      <div class="navbar-container">
        <!-- Logo y Marca -->
        <a routerLink="/" class="brand-link">
          <img src="assets/images/logo.png" alt="Panda Logo" class="brand-logo">
          <div class="brand-title">
            <span class="chinese-name">熊猫理财</span>
            <span class="spanish-name">El panda ahorrador</span>
          </div>
        </a>

        <!-- Menú de Navegación -->
        @if (authService.isAuthenticated()) {
          <nav class="nav-menu">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <i class="fa-solid fa-house"></i> <span class="nav-text">Inicio</span>
            </a>
            <a routerLink="/years" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-calendar-days"></i> <span class="nav-text">Mis Años</span>
            </a>

            @if (authService.hasRole('regular', 'admin')) {
              <a routerLink="/share" routerLinkActive="active" class="nav-item">
                <i class="fa-solid fa-share-nodes"></i> <span class="nav-text">Compartir</span>
              </a>
            }

            @if (authService.hasRole('admin')) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-item">
                <i class="fa-solid fa-user-gear"></i> <span class="nav-text">Usuarios</span>
              </a>
            }
          </nav>

          <!-- Perfil del usuario autenticado (Avatar + Nombre + Menú de cuenta) -->
          <div class="user-profile-menu">
            <a routerLink="/settings" class="user-info-link" title="Ir a Configuración">
              <img [src]="getAvatarUrl()" alt="User Avatar" class="user-avatar-img">
              <div class="user-details">
                <span class="user-display-name">{{ currentUser()?.name }}</span>
                <span class="user-role-badge" [ngClass]="'badge-' + currentUser()?.role">
                  {{ currentUser()?.role | uppercase }}
                </span>
              </div>
            </a>
            
            <a routerLink="/settings" routerLinkActive="active" class="nav-item icon-only" title="Configuración">
              <i class="fa-solid fa-gear"></i>
            </a>

            <button (click)="logout()" class="btn-logout" title="Cerrar Sesión">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        } @else {
          <div class="auth-buttons">
            <a routerLink="/login" class="nav-item">
              <i class="fa-solid fa-right-to-bracket"></i> <span class="nav-text">Ingresar</span>
            </a>
            <a routerLink="/register" class="btn-pastel btn-primary-pastel btn-sm">
              <i class="fa-solid fa-user-plus"></i> <span class="nav-text">Registrarse</span>
            </a>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid #F4A6C1;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(212, 86, 106, 0.08);
    }
    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(212, 86, 106, 0.2);
      object-fit: cover;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }
    .brand-link:hover .brand-logo {
      transform: rotate(10deg) scale(1.08);
    }
    .brand-title {
      display: flex;
      flex-direction: column;
    }
    .chinese-name {
      font-family: 'Caveat', cursive;
      font-size: 1.6rem;
      font-weight: 700;
      color: #D4566A;
      line-height: 1;
    }
    .spanish-name {
      font-family: 'Comfortaa', cursive;
      font-size: 0.78rem;
      color: #4A3F55;
      font-weight: 600;
    }
    .nav-menu {
      display: flex;
      gap: 6px;
    }
    .nav-item {
      text-decoration: none;
      font-family: 'Comfortaa', cursive;
      font-weight: 600;
      color: #4A3F55;
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
    }
    .nav-item:hover, .nav-item.active {
      background-color: #FFF0F4;
      color: #D4566A;
    }
    .icon-only {
      padding: 8px 10px;
    }
    .user-profile-menu {
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: #FFF0F4;
      padding: 4px 8px 4px 4px;
      border-radius: 24px;
      border: 1px solid rgba(244, 166, 193, 0.5);
    }
    .user-info-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
    }
    .user-avatar-img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #D4566A;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-display-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-dark);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 8px;
      width: fit-content;
    }
    .badge-admin { background-color: #FFE5A0; color: #7A5200; }
    .badge-regular { background-color: #F4A6C1; color: white; }
    .badge-viewer { background-color: #A8D8EA; color: #1E4E63; }
    .btn-logout {
      background: none;
      border: none;
      color: #D4566A;
      font-size: 1rem;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      transition: background 0.2s ease;
    }
    .btn-logout:hover {
      background-color: rgba(212, 86, 106, 0.15);
    }
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-sm {
      padding: 6px 14px;
      font-size: 0.85rem;
    }
    @media (max-width: 650px) {
      .user-details { display: none; }
      .nav-text { display: none; }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  getAvatarUrl(): string {
    const avatar = this.currentUser()?.avatarUrl;
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/logo.png';
  }

  logout(): void {
    this.authService.logout();
  }
}
