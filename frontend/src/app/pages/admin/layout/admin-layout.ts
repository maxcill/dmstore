import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout container">
      <aside class="admin-sidebar">
        <h2>Painel admin</h2>
        <nav>
          <a routerLink="/admin" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: true }">
            Dashboard
          </a>
          <a routerLink="/admin/produtos" routerLinkActive="ativo">Produtos</a>
          <a routerLink="/admin/categorias" routerLinkActive="ativo">Categorias</a>
          <a routerLink="/admin/pedidos" routerLinkActive="ativo">Pedidos</a>
        </nav>
      </aside>

      <section class="admin-conteudo">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 32px;
      padding: 32px 24px 64px;
      align-items: start;
    }

    .admin-sidebar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      position: sticky;
      top: 96px;
    }

    .admin-sidebar h2 {
      font-size: 1rem;
      margin-bottom: 16px;
    }

    .admin-sidebar nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .admin-sidebar a {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .admin-sidebar a:hover {
      background: var(--surface-alt);
      color: var(--text);
    }

    .admin-sidebar a.ativo {
      background: var(--accent-soft);
      color: var(--accent);
    }

    .admin-conteudo {
      min-width: 0;
    }

    @media (max-width: 900px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }

      .admin-sidebar {
        position: static;
      }
    }
  `],
})
export class AdminLayoutComponent {}
