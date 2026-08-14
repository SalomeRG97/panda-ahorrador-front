import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as Array<string>;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentUser = authService.currentUser();
  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // Redirigir si no tiene el rol
  router.navigate(['/']);
  return false;
};
