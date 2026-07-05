import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container conta-pagina">
      <h1>Minha conta</h1>

      @if (authService.usuario(); as usuario) {
        <div class="conta-card">
          <p><strong>Nome:</strong> {{ usuario.nome }}</p>
          <p><strong>E-mail:</strong> {{ usuario.email }}</p>
          @if (usuario.telefone) {
            <p><strong>Telefone:</strong> {{ usuario.telefone }}</p>
          }
        </div>

        <div class="conta-links">
          <a routerLink="/minha-conta/pedidos" class="btn btn-secondary">Ver meus pedidos</a>
          @if (authService.ehAdmin()) {
            <a routerLink="/admin" class="btn btn-secondary">Painel administrativo</a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .conta-pagina {
      padding: 32px 24px 64px;
      max-width: 560px;
      margin: 0 auto;
    }

    .conta-pagina h1 {
      font-size: 1.8rem;
      margin-bottom: 24px;
    }

    .conta-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 0.92rem;
      margin-bottom: 24px;
    }

    .conta-links {
      display: flex;
      gap: 12px;
    }
  `],
})
export class MinhaContaComponent {
  constructor(readonly authService: AuthService) {}
}
