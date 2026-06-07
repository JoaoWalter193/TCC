import { HttpInterceptorFn } from '@angular/common/http';

const rotasPublicas = [
  '/api/v1/user/login',
  '/api/v1/user/recover',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isRotaPublica = rotasPublicas.some(r => req.url.includes(r));

  if (!isRotaPublica) {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next(cloned);
    }
  }

  return next(req);
};
