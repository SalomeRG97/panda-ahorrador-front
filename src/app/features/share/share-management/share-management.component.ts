import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { EmailService } from '../../../core/services/email.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedViewer, SharedOwner } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-share-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="share-container animate-fade-in-up">
      <div class="header-section">
        <h1 class="chinese-title">共享支出</h1>
        <h2>Compartir Información de Gastos</h2>
        <p class="subtitle">Permite que observadores (Viewers) tengan acceso en modo solo lectura a tus finanzas 🤝</p>
      </div>

      <!-- SI ES REGULAR O ADMIN: COMPARTIR CON OTROS -->
      @if (authService.hasRole('regular', 'admin')) {
        <div class="card-pastel share-card">
          <h3><i class="fa-solid fa-user-plus"></i> Invitar Observador (Viewer)</h3>
          <form (ngSubmit)="onShare()" class="share-form">
            <div class="form-group">
              <label for="viewerEmail">Correo del usuario Viewer</label>
              <div class="input-with-button">
                <input 
                  type="email" 
                  id="viewerEmail" 
                  [(ngModel)]="viewerEmail" 
                  name="viewerEmail" 
                  placeholder="observador@correo.com" 
                  required 
                  class="form-control"
                >
                <button type="submit" class="btn-pastel btn-primary-pastel" [disabled]="loading()">
                  <i class="fa-solid fa-share-nodes"></i> Compartir
                </button>
              </div>
              <span class="form-hint">El usuario debe tener una cuenta registrada con el rol <strong>Viewer</strong>.</span>
            </div>
          </form>
        </div>

        <div class="card-pastel viewers-card">
          <h3><i class="fa-solid fa-users"></i> Personas con acceso a tus datos ({{ myViewers().length }})</h3>
          @if (myViewers().length === 0) {
            <p class="empty-state">No has compartido tus datos con nadie aún.</p>
          } @else {
            <ul class="viewers-list">
              @for (v of myViewers(); track v.id) {
                <li class="viewer-item">
                  <div class="viewer-info">
                    <img [src]="getAvatarUrl(v.viewer_avatar)" alt="Avatar" class="avatar-small">
                    <div>
                      <span class="name">{{ v.viewer_name }}</span>
                      <span class="email">{{ v.viewer_email }}</span>
                    </div>
                  </div>
                  <button (click)="removeShare(v.viewer_id)" class="btn-pastel btn-secondary-pastel btn-sm">
                    <i class="fa-solid fa-user-minus"></i> Revocar Acceso
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      }

      <!-- SI ES VIEWER: MOSTRAR QUIÉNES LE COMPARTIERON -->
      @if (authService.hasRole('viewer')) {
        <div class="card-pastel shared-with-me-card">
          <h3><i class="fa-solid fa-eye"></i> Datos compartidos contigo ({{ sharedWithMe().length }})</h3>
          @if (sharedWithMe().length === 0) {
            <p class="empty-state">Nadie te ha compartido acceso aún. Pídele a un usuario Regular que te agregue por tu correo.</p>
          } @else {
            <ul class="viewers-list">
              @for (o of sharedWithMe(); track o.id) {
                <li class="viewer-item">
                  <div class="viewer-info">
                    <img [src]="getAvatarUrl(o.owner_avatar)" alt="Avatar" class="avatar-small">
                    <div>
                      <span class="name">{{ o.owner_name }}</span>
                      <span class="email">{{ o.owner_email }}</span>
                    </div>
                  </div>
                  <span class="badge-concept-ahorro badge-category">Acceso Solo Lectura</span>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .share-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .header-section {
      text-align: center;
      margin-bottom: 24px;
    }
    .chinese-title {
      font-size: 2rem;
      color: var(--accent-red);
      margin: 0;
    }
    h2 {
      font-size: 1.5rem;
      color: var(--text-dark);
    }
    .subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .share-card, .viewers-card, .shared-with-me-card {
      padding: 24px;
      margin-bottom: 20px;
    }
    .share-card h3, .viewers-card h3, .shared-with-me-card h3 {
      font-size: 1.2rem;
      margin-bottom: 16px;
      color: var(--text-dark);
      border-bottom: 2px solid #FFF0F4;
      margin: 0.25rem 0 0 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .share-card {
      background: var(--surface-card, #ffffff);
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .share-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: var(--text-color, #1e293b);
    }
    .input-group {
      display: flex;
      gap: 0.75rem;
    }
    .share-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 10px;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .share-input:focus {
      border-color: #6366f1;
    }
    .btn-share {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s, opacity 0.2s;
    }
    .btn-share:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }
    .btn-share:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .hint-text {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }
    .empty-state {
      text-align: center;
      padding: 1.5rem;
      color: #94a3b8;
      background: #f8fafc;
      border-radius: 10px;
      font-size: 0.9rem;
    }
    .viewers-list, .owners-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .viewer-item, .owner-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }
    .viewer-info, .owner-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .viewer-avatar, .owner-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.95rem;
    }
    .viewer-info div, .owner-info div {
      display: flex;
      flex-direction: column;
    }
    .viewer-email, .owner-email {
      font-size: 0.8rem;
      color: #64748b;
    }
    .btn-revoke {
      background: #fee2e2;
      color: #ef4444;
      border: none;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-revoke:hover {
      background: #fca5a5;
    }
    .btn-view {
      background: #e0e7ff;
      color: #4338ca;
      border: none;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-view:hover {
      background: #c7d2fe;
    }
  `]
})
export class ShareManagementComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  private emailService = inject(EmailService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/share`;

  viewerEmail = '';
  myViewers = signal<SharedViewer[]>([]);
  sharedWithMe = signal<SharedOwner[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    if (this.authService.hasRole('regular', 'admin')) {
      this.loadMyViewers();
    }
    if (this.authService.hasRole('viewer')) {
      this.loadSharedWithMe();
    }
  }

  loadMyViewers(): void {
    this.http.get<{ success: boolean; data: SharedViewer[] }>(`${this.apiUrl}/my-viewers`).subscribe({
      next: (res) => this.myViewers.set(res.data),
      error: (err) => this.toastService.error(err.error?.message || 'Error al cargar observadores')
    });
  }

  loadSharedWithMe(): void {
    this.http.get<{ success: boolean; data: SharedOwner[] }>(`${this.apiUrl}/shared-with-me`).subscribe({
      next: (res) => this.sharedWithMe.set(res.data),
      error: (err) => this.toastService.error(err.error?.message || 'Error al cargar accesos')
    });
  }

  getAvatarUrl(avatar?: string | null): string {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/logo.png';
  }

  onShare(): void {
    if (!this.viewerEmail) return;

    this.loading.set(true);

    this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}`, { viewerEmail: this.viewerEmail }).subscribe({
      next: async () => {
        this.loading.set(false);
        this.toastService.success('Acceso compartido exitosamente 🤝');
        
        // Enviar email de notificación al viewer
        const ownerName = this.authService.currentUser()?.name || 'Un usuario';
        await this.emailService.sendViewerInvitation(this.viewerEmail, ownerName);
        
        this.viewerEmail = '';
        this.loadMyViewers();
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Error al compartir acceso');
      }
    });
  }

  async removeShare(viewerId: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas revocar el acceso a este observador?');
    if (!confirmed) return;

    this.http.delete<{ success: boolean }>(`${this.apiUrl}/${viewerId}`).subscribe({
      next: () => {
        this.toastService.success('Acceso revocado');
        this.loadMyViewers();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Error al revocar acceso')
    });
  }
}
