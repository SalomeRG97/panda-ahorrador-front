import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-header">
      <div class="navbar-container">
        <a routerLink="/" class="brand-link">
          <img src="assets/images/logo.png" alt="Panda Logo" class="brand-logo">
          <div class="brand-title">
            <span class="chinese-name">熊猫理财</span>
            <span class="spanish-name">El panda ahorrador</span>
          </div>
        </a>
        <nav class="nav-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="fa-solid fa-house"></i> <span class="nav-text">Inicio</span>
          </a>
          <a routerLink="/years" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-calendar-days"></i> <span class="nav-text">Mis Años</span>
          </a>
        </nav>
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
      width: 46px;
      height: 46px;
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
      font-size: 0.8rem;
      color: #4A3F55;
      font-weight: 600;
    }
    .nav-menu {
      display: flex;
      gap: 8px;
    }
    .nav-item {
      text-decoration: none;
      font-family: 'Comfortaa', cursive;
      font-weight: 600;
      color: #4A3F55;
      padding: 8px 14px;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
    }
    .nav-item:hover, .nav-item.active {
      background-color: #FFF0F4;
      color: #D4566A;
    }
    @media (max-width: 480px) {
      .navbar-container {
        padding: 8px 12px;
      }
      .brand-logo {
        width: 38px;
        height: 38px;
      }
      .chinese-name {
        font-size: 1.3rem;
      }
      .spanish-name {
        font-size: 0.7rem;
      }
      .nav-item {
        padding: 6px 10px;
        font-size: 0.85rem;
      }
    }
  `]
})
export class NavbarComponent {}
