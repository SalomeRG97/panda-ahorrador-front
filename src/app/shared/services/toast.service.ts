import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  // Confirm dialog state
  confirmVisible = signal(false);
  confirmMessage = signal('');
  confirmTexts = signal<{ confirm: string; cancel: string }>({ confirm: 'Confirmar', cancel: 'Cancelar' });
  private confirmResolve: ((value: boolean) => void) | null = null;

  success(message: string, duration = 4000): void {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration = 6000): void {
    this.addToast(message, 'error', duration);
  }

  warning(message: string, duration = 5000): void {
    this.addToast(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.addToast(message, 'info', duration);
  }

  confirm(options: string | ConfirmOptions): Promise<boolean> {
    const opts = typeof options === 'string' ? { message: options } : options;
    this.confirmMessage.set(opts.message);
    this.confirmTexts.set({
      confirm: opts.confirmText || 'Confirmar',
      cancel: opts.cancelText || 'Cancelar'
    });
    this.confirmVisible.set(true);

    return new Promise<boolean>((resolve) => {
      this.confirmResolve = resolve;
    });
  }

  resolveConfirm(result: boolean): void {
    this.confirmVisible.set(false);
    if (this.confirmResolve) {
      this.confirmResolve(result);
      this.confirmResolve = null;
    }
  }

  removeToast(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private addToast(message: string, type: ToastType, duration: number): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, duration };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => this.removeToast(id), duration);
  }
}
