import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { OrdersService } from '../../../core/services/orders.service';
import { OrderStatus, Pedido, Produto } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>

    <div class="cards-grid">
      <div class="stat-card">
        <span class="stat-card__label">Produtos cadastrados</span>
        <span class="stat-card__valor">{{ produtos().length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Total de pedidos</span>
        <span class="stat-card__valor">{{ pedidos().length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Pedidos pagos</span>
        <span class="stat-card__valor">{{ pedidosPagos() }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Faturamento (pago)</span>
        <span class="stat-card__valor price-tag">{{ faturamento() | currency: 'BRL' }}</span>
      </div>
    </div>

    <h2 class="secao-titulo">Últimos pedidos</h2>
    <div class="tabela">
      <div class="tabela__linha tabela__linha--header">
        <span>Número</span>
        <span>Cliente</span>
        <span>Status</span>
        <span>Total</span>
      </div>
      @for (pedido of ultimosPedidos(); track pedido.id) {
        <div class="tabela__linha">
          <span>{{ pedido.numeroPedido }}</span>
          <span>—</span>
          <span class="pedido-card__status" [attr.data-status]="pedido.status">{{ pedido.status }}</span>
          <span class="price-tag">{{ pedido.total | currency: 'BRL' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { font-size: 1.6rem; margin-bottom: 24px; }
    .secao-titulo { font-size: 1.1rem; margin: 32px 0 16px; }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-card__label {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .stat-card__valor {
      font-size: 1.6rem;
      font-weight: 700;
      font-family: var(--font-display);
    }

    .tabela {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .tabela__linha {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      padding: 12px 16px;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      align-items: center;
    }

    .tabela__linha:last-child { border-bottom: none; }

    .tabela__linha--header {
      background: var(--surface-alt);
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.76rem;
      text-transform: uppercase;
    }

    .pedido-card__status {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 999px;
      background: var(--surface-alt);
      color: var(--text-muted);
      width: fit-content;
    }

    @media (max-width: 900px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  readonly produtos = signal<Produto[]>([]);
  readonly pedidos = signal<Pedido[]>([]);

  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  ngOnInit(): void {
    this.productsService.listarTodosAdmin().subscribe((produtos) => this.produtos.set(produtos));
    this.ordersService.listarTodosAdmin().subscribe((pedidos) => this.pedidos.set(pedidos));
  }

  pedidosPagos(): number {
    return this.pedidos().filter((p) => p.status !== OrderStatus.PENDENTE).length;
  }

  faturamento(): number {
    return this.pedidos()
      .filter((p) => p.status === OrderStatus.PAGO || p.status === OrderStatus.ENTREGUE)
      .reduce((acc, p) => acc + Number(p.total), 0);
  }

  ultimosPedidos(): Pedido[] {
    return this.pedidos().slice(0, 8);
  }
}
