import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Category } from '../../core/interfaces/category.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container animate-fade-in-up">
      <div class="header-section">
        <h1 class="chinese-title">个人设置</h1>
        <h2>Configuración de Cuenta & Categorías</h2>
        <p class="subtitle">Gestiona tu perfil, seguridad y personaliza tus categorías del Panda Ahorrador 🌸</p>
      </div>

      <!-- PESTAÑAS DE CONFIGURACIÓN -->
      <div class="settings-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
          <i class="fa-solid fa-user-gear"></i> Perfil & Seguridad
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'">
          <i class="fa-solid fa-tags"></i> Categorías Personalizadas
        </button>
      </div>

      <!-- TAB 1: PERFIL & SEGURIDAD -->
      <div *ngIf="activeTab === 'profile'" class="settings-grid">
        <!-- 1. FOTO DE PERFIL / AVATAR -->
        <div class="card-pastel avatar-card">
          <h3><i class="fa-solid fa-camera"></i> Foto de Perfil</h3>
          <div class="avatar-wrapper">
            <img 
              [src]="getAvatarUrl()" 
              alt="Avatar" 
              class="profile-avatar"
            >
            <div class="avatar-badge">
              <i class="fa-solid" [ngClass]="getRoleIcon(user()?.role)"></i> {{ user()?.role | uppercase }}
            </div>
          </div>

          <div class="avatar-upload-actions">
            <label for="avatarInput" class="btn-pastel btn-secondary-pastel btn-sm">
              <i class="fa-solid fa-upload"></i> Cambiar Foto
            </label>
            <input 
              type="file" 
              id="avatarInput" 
              (change)="onFileSelected($event)" 
              accept="image/*"
              style="display: none;"
            >
            @if (uploadingAvatar()) {
              <span class="upload-status"><i class="fa-solid fa-spinner fa-spin"></i> Subiendo...</span>
            }
          </div>
        </div>

        <!-- 2. DATOS DE PERFIL -->
        <div class="card-pastel profile-card">
          <h3><i class="fa-solid fa-user-pen"></i> Datos Personales</h3>
          <form (ngSubmit)="onUpdateProfile()" class="settings-form">
            <div class="form-group">
              <label for="name">Nombre Completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                [(ngModel)]="name" 
                required 
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="username">Nombre de Usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                [(ngModel)]="username" 
                required 
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="email" 
                required 
                class="form-control"
              >
            </div>

            <button type="submit" class="btn-pastel btn-primary-pastel" [disabled]="loadingProfile()">
              @if (loadingProfile()) {
                <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
              } @else {
                <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
              }
            </button>
          </form>
        </div>

        <!-- 3. CAMBIO DE CONTRASEÑA -->
        <div class="card-pastel password-card">
          <h3><i class="fa-solid fa-key"></i> Seguridad</h3>
          <form (ngSubmit)="onChangePassword()" class="settings-form">
            <div class="form-group">
              <label for="oldPassword">Contraseña Actual</label>
              <input 
                type="password" 
                id="oldPassword" 
                name="oldPassword" 
                [(ngModel)]="oldPassword" 
                placeholder="••••••••"
                required 
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="newPassword">Nueva Contraseña Segura</label>
              <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                [(ngModel)]="newPassword" 
                (input)="evaluatePassword()"
                placeholder="Mínimo 8 caracteres"
                required 
                class="form-control"
              >

              @if (newPassword.length > 0) {
                <ul class="strength-checklist">
                  <li [class.valid]="passCriteria.minLen"><i class="fa-solid" [ngClass]="passCriteria.minLen ? 'fa-check' : 'fa-xmark'"></i> Mínimo 8 caracteres</li>
                  <li [class.valid]="passCriteria.upper"><i class="fa-solid" [ngClass]="passCriteria.upper ? 'fa-check' : 'fa-xmark'"></i> Una mayúscula</li>
                  <li [class.valid]="passCriteria.lower"><i class="fa-solid" [ngClass]="passCriteria.lower ? 'fa-check' : 'fa-xmark'"></i> Una minúscula</li>
                  <li [class.valid]="passCriteria.number"><i class="fa-solid" [ngClass]="passCriteria.number ? 'fa-check' : 'fa-xmark'"></i> Un número</li>
                  <li [class.valid]="passCriteria.special"><i class="fa-solid" [ngClass]="passCriteria.special ? 'fa-check' : 'fa-xmark'"></i> Un carácter especial</li>
                </ul>
              }
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                [(ngModel)]="confirmPassword" 
                placeholder="••••••••"
                required 
                class="form-control"
              >
            </div>

            <button type="submit" class="btn-pastel btn-secondary-pastel" [disabled]="loadingPassword() || (newPassword.length > 0 && !isPasswordValid())">
              @if (loadingPassword()) {
                <i class="fa-solid fa-spinner fa-spin"></i> Actualizando...
              } @else {
                <i class="fa-solid fa-lock"></i> Actualizar Contraseña
              }
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 2: GESTIÓN DE CATEGORÍAS PERSONALIZADAS -->
      <div *ngIf="activeTab === 'categories'" class="card-pastel category-section">
        <div class="category-header">
          <div>
            <h3>Mis Categorías</h3>
            <p class="subtitle">Personaliza colores, nombres e iconos de tus categorías o crea tus propias categorías adicionales.</p>
          </div>
          <button (click)="openCatModal()" class="btn-pastel btn-primary-pastel">
            <i class="fa-solid fa-plus"></i> Nueva Categoría
          </button>
        </div>

        <div class="categories-grid">
          <div *ngFor="let cat of categories; trackBy: trackByCatId" class="category-card card-pastel" [style.borderLeft]="'6px solid ' + cat.color">
            <div class="cat-card-top">
              <span class="cat-icon-badge">{{ cat.icon }}</span>
              <div class="cat-info">
                <h4>{{ cat.name }}</h4>
                <span class="cat-badge" [class.global]="cat.isGlobal">
                  {{ cat.isGlobal ? 'Predeterminada' : 'Personal' }}
                </span>
              </div>
            </div>
            <div class="cat-card-actions">
              <button (click)="editCategory(cat)" class="btn-pastel btn-secondary-pastel btn-xs">
                <i class="fa-solid fa-pen"></i> Editar
              </button>
              <button *ngIf="!cat.isGlobal" (click)="deleteCategory(cat.id)" class="btn-icon-danger btn-xs" title="Eliminar categoría personal">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL CREAR/EDITAR CATEGORÍA -->
      <div class="modal-overlay" *ngIf="showCatModal">
        <div class="modal-card card-pastel">
          <div class="modal-header">
            <h3>{{ editingCatId ? '🌸 Editar Categoría' : '🌸 Crear Categoría Personal' }}</h3>
            <button (click)="closeCatModal()" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la Categoría:</label>
              <input type="text" [(ngModel)]="catForm.name" placeholder="Ej: Suscripciones, Educación" class="form-control">
            </div>
            <div class="form-group">
              <label>Icono / Emoji:</label>
              <div class="emoji-picker-row">
                <input type="text" [(ngModel)]="catForm.icon" maxlength="4" placeholder="Ej: 📺" class="form-control emoji-input">
                <div class="emoji-shortcuts">
                  <span (click)="catForm.icon = '📺'">📺</span>
                  <span (click)="catForm.icon = '📚'">📚</span>
                  <span (click)="catForm.icon = '🎮'">🎮</span>
                  <span (click)="catForm.icon = '✈️'">✈️</span>
                  <span (click)="catForm.icon = '💊'">💊</span>
                  <span (click)="catForm.icon = '🛍️'">🛍️</span>
                  <span (click)="catForm.icon = '☕'">☕</span>
                  <span (click)="catForm.icon = '🏋️'">🏋️</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Color representativo:</label>
              <div class="color-picker-row">
                <input type="color" [(ngModel)]="catForm.color" class="color-picker-input">
                <input type="text" [(ngModel)]="catForm.color" class="form-control hex-input" placeholder="#F4A6C1">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeCatModal()" class="btn-pastel btn-secondary-pastel">Cancelar</button>
            <button (click)="saveCategory()" class="btn-pastel btn-primary-pastel">
              <i class="fa-solid fa-check"></i> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .header-section {
      text-align: center;
      margin-bottom: 20px;
    }
    .chinese-title {
      font-size: 2rem;
      color: var(--accent-red);
      margin: 0;
    }
    h2 {
      font-size: 1.5rem;
      color: var(--text-dark);
      margin-top: 2px;
    }
    .subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    /* PESTAÑAS */
    .settings-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      justify-content: center;
    }
    .tab-btn {
      padding: 10px 20px;
      border-radius: 12px;
      border: 1.5px solid #F4A6C1;
      background: #FFF0F4;
      color: #665275;
      font-family: var(--font-body);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.25s ease;
    }
    .tab-btn.active, .tab-btn:hover {
      background: var(--accent-red);
      color: white;
      border-color: var(--accent-red);
      box-shadow: 0 4px 14px rgba(212, 86, 106, 0.25);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 20px;
    }
    .avatar-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: fit-content;
    }
    .avatar-card h3 {
      font-size: 1.1rem;
      margin-bottom: 16px;
    }
    .avatar-wrapper {
      position: relative;
      margin-bottom: 16px;
    }
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #F4A6C1;
      box-shadow: 0 6px 20px rgba(212, 86, 106, 0.2);
    }
    .avatar-badge {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-red);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .avatar-upload-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .btn-sm { padding: 8px 16px; font-size: 0.85rem; }
    .upload-status { font-size: 0.8rem; color: var(--accent-red); }
    
    .profile-card, .password-card { padding: 24px; }
    .profile-card h3, .password-card h3 {
      font-size: 1.2rem;
      margin-bottom: 18px;
      color: var(--text-dark);
      border-bottom: 2px solid #FFF0F4;
      padding-bottom: 10px;
    }
    .settings-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }
    .form-control {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid #F4A6C1;
      background-color: #FFF0F4;
      font-family: var(--font-body);
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s ease;
    }
    .form-control:focus {
      border-color: var(--accent-red);
      background-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(212, 86, 106, 0.15);
    }

    .strength-checklist {
      list-style: none;
      padding: 0;
      margin: 6px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.75rem;
      color: #9E9E9E;
    }
    .strength-checklist li { display: flex; align-items: center; gap: 6px; }
    .strength-checklist li.valid { color: #2E7D32; font-weight: 600; }

    /* CATEGORÍAS */
    .category-section { padding: 24px; }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .category-card {
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      background: #FFFFFF;
    }
    .cat-card-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cat-icon-badge {
      font-size: 1.8rem;
      line-height: 1;
    }
    .cat-info h4 { margin: 0; font-size: 1rem; color: #4A3F55; }
    .cat-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 10px;
      background: #FFE5EC;
      color: #D4566A;
      font-weight: 600;
    }
    .cat-badge.global {
      background: #E8F5E9;
      color: #2E7D32;
    }
    .cat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      align-items: center;
    }
    .btn-xs { padding: 4px 10px; font-size: 0.75rem; }
    .btn-icon-danger { background: none; border: none; color: #D4566A; cursor: pointer; }

    .emoji-picker-row { display: flex; flex-direction: column; gap: 8px; }
    .emoji-shortcuts { display: flex; gap: 8px; font-size: 1.3rem; cursor: pointer; }
    .emoji-shortcuts span:hover { transform: scale(1.2); transition: transform 0.2s; }
    .color-picker-row { display: flex; align-items: center; gap: 10px; }
    .color-picker-input { width: 44px; height: 44px; border: none; border-radius: 8px; cursor: pointer; }
    .hex-input { width: 120px; }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
    }
    .modal-card { width: 100%; max-width: 440px; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-btn { background: none; border: none; font-size: 1.6rem; cursor: pointer; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }

    @media (max-width: 768px) {
      .settings-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  user = this.authService.currentUser;
  activeTab: 'profile' | 'categories' = 'profile';

  name = '';
  username = '';
  email = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  loadingProfile = signal(false);
  loadingPassword = signal(false);
  uploadingAvatar = signal(false);

  passCriteria = { minLen: false, upper: false, lower: false, number: false, special: false };

  // Categorías
  categories: Category[] = [];
  showCatModal = false;
  editingCatId: number | null = null;
  catForm = { name: '', color: '#F4A6C1', icon: '📦' };

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.name = u.name;
      this.username = u.username;
      this.email = u.email;
    }
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe(cats => this.categories = cats);
  }

  getAvatarUrl(): string {
    const avatar = this.user()?.avatarUrl;
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/logo.png';
  }

  getRoleIcon(role?: string): string {
    switch (role) {
      case 'admin': return 'fa-shield-halved';
      case 'regular': return 'fa-user-pen';
      case 'viewer': return 'fa-eye';
      default: return 'fa-user';
    }
  }

  evaluatePassword(): void {
    const p = this.newPassword;
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

  onUpdateProfile(): void {
    this.loadingProfile.set(true);

    this.authService.updateProfile({
      name: this.name,
      username: this.username,
      email: this.email
    }).subscribe({
      next: () => {
        this.loadingProfile.set(false);
        this.toastService.success('Perfil actualizado correctamente ✨');
      },
      error: (err) => {
        this.loadingProfile.set(false);
        this.toastService.error(err.error?.message || 'Error al actualizar el perfil');
      }
    });
  }

  onChangePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.warning('Las contraseñas nuevas no coinciden');
      return;
    }

    if (!this.isPasswordValid()) {
      this.toastService.error('La nueva contraseña no cumple con los requisitos de seguridad');
      return;
    }

    this.loadingPassword.set(true);

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.loadingPassword.set(false);
        this.toastService.success('Contraseña actualizada con éxito 🔐');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.loadingPassword.set(false);
        this.toastService.error(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);

    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.uploadingAvatar.set(false);
        this.toastService.success('Foto de perfil actualizada 🖼️');
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.toastService.error(err.error?.message || 'Error al subir la imagen');
      }
    });
  }

  // --- CATEGORÍAS CRUD ---
  openCatModal(): void {
    this.editingCatId = null;
    this.catForm = { name: '', color: '#F4A6C1', icon: '📦' };
    this.showCatModal = true;
  }

  editCategory(cat: Category): void {
    this.editingCatId = cat.id;
    this.catForm = { name: cat.name, color: cat.color, icon: cat.icon };
    this.showCatModal = true;
  }

  closeCatModal(): void { this.showCatModal = false; }

  saveCategory(): void {
    if (!this.catForm.name || !this.catForm.color || !this.catForm.icon) {
      this.toastService.warning('Por favor completa todos los campos de la categoría');
      return;
    }

    if (this.editingCatId) {
      this.apiService.updateCategory(this.editingCatId, this.catForm).subscribe({
        next: () => {
          this.toastService.success('Categoría actualizada 🌸');
          this.closeCatModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Error al actualizar categoría')
      });
    } else {
      this.apiService.createCategory(this.catForm).subscribe({
        next: () => {
          this.toastService.success('Categoría personal creada ✨');
          this.closeCatModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Error al crear categoría')
      });
    }
  }

  async deleteCategory(id: number): Promise<void> {
    const confirmed = await this.toastService.confirm('¿Deseas eliminar esta categoría personal?');
    if (!confirmed) return;

    this.apiService.deleteCategory(id).subscribe({
      next: () => {
        this.toastService.success('Categoría eliminada');
        this.loadCategories();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Error al eliminar categoría')
    });
  }

  trackByCatId(index: number, cat: Category): number { return cat.id; }
}
