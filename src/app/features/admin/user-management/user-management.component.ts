import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../core/interfaces/auth.interface';
import { ToastService } from '../../../shared/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container animate-fade-in-up">
      <div class="header-section">
        <h1 class="chinese-title">用户管理</h1>
        <h2>Gestión de Usuarios (Admin)</h2>
        <p class="subtitle">Administra los usuarios del sistema, asigna roles y gestiona el estado de activación 🛡️</p>
      </div>

      <div class="actions-bar">
        <button (click)="openCreateModal()" class="btn-pastel btn-primary-pastel">
          <i class="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
        </button>
      </div>

      <!-- TABLA DE USUARIOS -->
      <div class="card-pastel table-card">
        <div class="table-responsive">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users(); track u.id) {
                <tr>
                  <td class="user-cell">
                    <img [src]="getAvatarUrl(u.avatarUrl)" alt="Avatar" class="table-avatar">
                    <div class="user-info">
                      <span class="user-name">{{ u.name }}</span>
                      <span class="user-username">&#64;{{ u.username }}</span>
                    </div>
                  </td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="role-badge" [ngClass]="'role-' + u.role">
                      {{ u.role | uppercase }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" [class.active]="u.isActive" [class.inactive]="!u.isActive">
                      {{ u.isActive ? '🟢 Activo' : '🔴 Inactivo' }}
                    </span>
                  </td>
                  <td>{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="actions-cell">
                    <button (click)="openEditModal(u)" class="btn-icon btn-edit" title="Editar datos y rol">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    @if (u.isActive) {
                      <button (click)="toggleStatus(u.id, false)" class="btn-icon btn-delete" title="Desactivar usuario">
                        <i class="fa-solid fa-user-slash"></i>
                      </button>
                    } @else {
                      <button (click)="toggleStatus(u.id, true)" class="btn-icon btn-activate" title="Reactivar usuario">
                        <i class="fa-solid fa-user-check"></i>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DE CREAR / EDITAR USUARIO -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-card card-pastel" (click)="$event.stopPropagation()">
            <h3>
              <i class="fa-solid" [ngClass]="isEditing() ? 'fa-user-pen' : 'fa-user-plus'"></i> 
              {{ isEditing() ? 'Editar Usuario' : 'Crear Usuario' }}
            </h3>

            <form (ngSubmit)="saveUser()" class="modal-form">
              <div class="form-group">
                <label for="modalName">Nombre Completo</label>
                <input type="text" id="modalName" [(ngModel)]="formData.name" name="name" required class="form-control">
              </div>

              <div class="form-group">
                <label for="modalUsername">Nombre de Usuario</label>
                <input type="text" id="modalUsername" [(ngModel)]="formData.username" name="username" required class="form-control">
              </div>

              <div class="form-group">
                <label for="modalEmail">Correo Electrónico</label>
                <input type="email" id="modalEmail" [(ngModel)]="formData.email" name="email" required class="form-control">
              </div>

              <div class="form-group">
                <label for="modalRole">Rol del Usuario</label>
                <select id="modalRole" [(ngModel)]="formData.role" name="role" required class="form-control">
                  <option value="regular">REGULAR (Gestión de sus propios gastos)</option>
                  <option value="viewer">VIEWER (Solo lectura de gastos compartidos)</option>
                  <option value="admin">ADMIN (Administrador del sistema)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="modalStatus">Estado de la cuenta</label>
                <select id="modalStatus" [(ngModel)]="formData.isActive" name="isActive" required class="form-control">
                  <option [ngValue]="true">Activo</option>
                  <option [ngValue]="false">Inactivo</option>
                </select>
              </div>

              @if (!isEditing()) {
                <div class="form-group">
                  <label for="modalPassword">Contraseña Inicial</label>
                  <input type="password" id="modalPassword" [(ngModel)]="formData.password" name="password" placeholder="Temporal123!" class="form-control">
                </div>
              }

              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
                <button type="submit" class="btn-pastel btn-primary-pastel">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    .header-section { text-align: center; margin-bottom: 24px; }
    .chinese-title { font-size: 2rem; color: var(--accent-red); margin: 0; }
    h2 { font-size: 1.5rem; color: var(--text-dark); }
    .subtitle { font-size: 0.9rem; color: var(--text-muted); }
    .actions-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
    .table-card { padding: 16px; }
    .users-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .users-table th, .users-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #FFF0F4; }
    .users-table th { color: var(--accent-red); font-weight: 700; background-color: #FFF0F4; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .table-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #F4A6C1; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; color: var(--text-dark); }
    .user-username { font-size: 0.78rem; color: var(--text-muted); }
    .role-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
    .role-admin { background-color: #FFE5A0; color: #7A5200; }
    .role-regular { background-color: #F4A6C1; color: white; }
    .role-viewer { background-color: #A8D8EA; color: #1E4E63; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background-color: #E8F5E9; color: #2E7D32; }
    .status-badge.inactive { background-color: #FFEBEE; color: #C62828; }
    .actions-cell { display: flex; gap: 8px; }
    .btn-icon { border: none; background: none; font-size: 1rem; cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: all 0.2s ease; }
    .btn-edit { color: #2196F3; }
    .btn-edit:hover { background-color: #E3F2FD; }
    .btn-delete { color: #E53935; }
    .btn-delete:hover { background-color: #FFEBEE; }
    .btn-activate { color: #43A047; }
    .btn-activate:hover { background-color: #E8F5E9; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-card { width: 100%; max-width: 440px; padding: 24px; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; }
    .form-control { padding: 10px 12px; border-radius: var(--radius-md); border: 1.5px solid #F4A6C1; background-color: #FFF0F4; font-family: var(--font-body); font-size: 0.9rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/admin`;

  users = signal<User[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  editingUserId = signal<number | null>(null);

  formData = {
    name: '',
    username: '',
    email: '',
    role: 'regular',
    isActive: true,
    password: ''
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<{ success: boolean; data: User[] }>(`${this.apiUrl}/users`).subscribe({
      next: (res) => this.users.set(res.data),
      error: (err) => this.toastService.error(err.error?.message || 'Error al cargar usuarios')
    });
  }

  getAvatarUrl(avatar?: string | null): string {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/logo.png';
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingUserId.set(null);
    this.formData = { name: '', username: '', email: '', role: 'regular', isActive: true, password: '' };
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user.id);
    this.formData = {
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveUser(): void {
    if (this.isEditing()) {
      const id = this.editingUserId();
      this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/users/${id}`, this.formData).subscribe({
        next: () => {
          this.toastService.success('Usuario actualizado correctamente ✨');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Error al actualizar usuario')
      });
    } else {
      this.http.post<{ success: boolean; data: User }>(`${this.apiUrl}/users`, this.formData).subscribe({
        next: () => {
          this.toastService.success('Usuario creado exitosamente 🌸');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Error al crear usuario')
      });
    }
  }

  async toggleStatus(id: number, targetStatus: boolean): Promise<void> {
    const actionText = targetStatus ? 'reactivar' : 'desactivar';
    const confirmed = await this.toastService.confirm(`¿Estás seguro de ${actionText} este usuario?`);
    if (!confirmed) return;

    this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/users/${id}/status`, { isActive: targetStatus }).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${targetStatus ? 'activado' : 'desactivado'}`);
        this.loadUsers();
      },
      error: (err) => this.toastService.error(err.error?.message || `Error al ${actionText}`)
    });
  }
}
