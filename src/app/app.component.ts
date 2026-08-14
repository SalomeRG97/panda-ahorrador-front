import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ChineseDecorationComponent } from './shared/components/chinese-decoration/chinese-decoration.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ChineseDecorationComponent, ToastComponent],
  template: `
    <div class="app-layout">
      <app-chinese-decoration></app-chinese-decoration>
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
      <footer class="app-footer">
        <div class="footer-container">
          <span>🌸 熊猫理财 El panda ahorrador &copy; {{ currentYear }}</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      padding-bottom: 40px;
    }
    .app-footer {
      background: #FFF0F4;
      border-top: 1.5px solid #F4A6C1;
      padding: 16px 24px;
      font-size: 0.85rem;
      color: #665275;
      margin-top: auto;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class AppComponent {
  currentYear = new Date().getFullYear();
}
