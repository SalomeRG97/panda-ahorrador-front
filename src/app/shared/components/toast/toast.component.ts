import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- TOASTS -->
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" [class.toast-exit]="false">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <i class="fa-solid fa-circle-check"></i> }
              @case ('error') { <i class="fa-solid fa-circle-xmark"></i> }
              @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
              @case ('info') { <i class="fa-solid fa-circle-info"></i> }
            }
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.removeToast(toast.id)">&times;</button>
        </div>
      }
    </div>

    <!-- CONFIRM DIALOG -->
    @if (toastService.confirmVisible()) {
      <div class="confirm-overlay" (click)="toastService.resolveConfirm(false)">
        <div class="confirm-card card-pastel" (click)="$event.stopPropagation()">
          <div class="confirm-icon">🐼</div>
          <p class="confirm-message">{{ toastService.confirmMessage() }}</p>
          <div class="confirm-actions">
            <button class="btn-pastel btn-secondary-pastel" (click)="toastService.resolveConfirm(false)">
              {{ toastService.confirmTexts().cancel }}
            </button>
            <button class="btn-pastel btn-primary-pastel" (click)="toastService.resolveConfirm(true)">
              {{ toastService.confirmTexts().confirm }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== TOAST CONTAINER ===== */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      max-width: 420px;
      width: calc(100% - 48px);
      pointer-events: none;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 0.9rem;
      font-family: 'Comfortaa', cursive;
      color: #333;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      pointer-events: all;
      animation: toastSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      border: 1.5px solid transparent;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(60px) scale(0.92);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(232, 245, 233, 0.95), rgba(200, 230, 201, 0.95));
      border-color: #A5D6A7;
    }
    .toast-success .toast-icon { color: #2E7D32; }

    .toast-error {
      background: linear-gradient(135deg, rgba(255, 229, 229, 0.95), rgba(255, 205, 210, 0.95));
      border-color: #EF9A9A;
    }
    .toast-error .toast-icon { color: #C62828; }

    .toast-warning {
      background: linear-gradient(135deg, rgba(255, 249, 235, 0.95), rgba(255, 236, 179, 0.95));
      border-color: #FFD54F;
    }
    .toast-warning .toast-icon { color: #E65100; }

    .toast-info {
      background: linear-gradient(135deg, rgba(255, 240, 244, 0.95), rgba(244, 166, 193, 0.35));
      border-color: #F4A6C1;
    }
    .toast-info .toast-icon { color: #D4566A; }

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      line-height: 1.35;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      color: #999;
      padding: 0 4px;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .toast-close:hover {
      color: #333;
    }

    /* ===== CONFIRM DIALOG ===== */
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: confirmFadeIn 0.25s ease;
    }

    @keyframes confirmFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirm-card {
      width: 100%;
      max-width: 380px;
      padding: 28px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      animation: confirmScaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes confirmScaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .confirm-icon {
      font-size: 2.5rem;
    }

    .confirm-message {
      font-size: 1rem;
      color: #4A3F55;
      line-height: 1.5;
      font-weight: 500;
    }

    .confirm-actions {
      display: flex;
      gap: 12px;
      width: 100%;
      justify-content: center;
      margin-top: 4px;
    }

    .confirm-actions button {
      min-width: 110px;
    }

    @media (max-width: 480px) {
      .toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
        max-width: none;
        width: auto;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
