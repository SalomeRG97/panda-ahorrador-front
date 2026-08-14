import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api';

  // Reactive state
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());
  userRole = computed(() => this._currentUser()?.role || null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('panda_user');
    const token = localStorage.getItem('panda_access_token');
    if (userData && token) {
      try {
        this._currentUser.set(JSON.parse(userData));
      } catch {
        this.clearStorage();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(res => res.data),
        tap(data => this.handleAuthSuccess(data)),
        catchError(err => throwError(() => err))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        map(res => res.data),
        tap(data => this.handleAuthSuccess(data)),
        catchError(err => throwError(() => err))
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('panda_refresh_token');
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        map(res => res.data),
        tap(data => this.handleAuthSuccess(data))
      );
  }

  logout(): void {
    this.clearStorage();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('panda_access_token');
  }

  getProfile(): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/profile`)
      .pipe(
        map(res => res.data),
        tap(user => {
          this._currentUser.set(user);
          localStorage.setItem('panda_user', JSON.stringify(user));
        })
      );
  }

  updateProfile(data: { name?: string; email?: string; username?: string }): Observable<User> {
    return this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/profile`, data)
      .pipe(
        map(res => res.data),
        tap(user => {
          this._currentUser.set(user);
          localStorage.setItem('panda_user', JSON.stringify(user));
        })
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/profile/password`, { oldPassword, newPassword })
      .pipe(map(res => res));
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ success: boolean; data: User }>(`${this.apiUrl}/profile/avatar`, formData)
      .pipe(
        map(res => res.data),
        tap(user => {
          this._currentUser.set(user);
          localStorage.setItem('panda_user', JSON.stringify(user));
        })
      );
  }

  hasRole(...roles: string[]): boolean {
    const currentRole = this._currentUser()?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  private handleAuthSuccess(data: AuthResponse): void {
    localStorage.setItem('panda_access_token', data.accessToken);
    localStorage.setItem('panda_refresh_token', data.refreshToken);
    localStorage.setItem('panda_user', JSON.stringify(data.user));
    this._currentUser.set(data.user);
  }

  private clearStorage(): void {
    localStorage.removeItem('panda_access_token');
    localStorage.removeItem('panda_refresh_token');
    localStorage.removeItem('panda_user');
  }
}
