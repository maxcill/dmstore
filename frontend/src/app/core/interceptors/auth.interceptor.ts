import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // ou a chave que você usa

  // VEJA AQUI: Verifica se a requisição NÃO é para o Mercado Livre e se vai para sua API
  const isMercadoLivre = req.url.includes('://mercadolibre.com');
  
  if (token && !isMercadoLivre) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Se for Mercado Livre, envia a requisição limpa sem cabeçalhos customizados
  return next(req);
};
