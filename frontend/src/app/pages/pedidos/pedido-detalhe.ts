import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { OrderStatus, Pedido } from '../../core/models/models';

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDENTE]: 'Pendente',
  [OrderStatus.PAGO]: 'Pago',
  [OrderStatus.ENVIADO]: 'Enviado',
  [OrderStatus.ENTREGUE]: 'Entregue',
  [OrderStatus.CANCELADO]: 'Cancelado',
};

@Component({
  selector: 'app-pedido-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-detalhe.html',
  styleUrl: './pedidos.scss',
})
export class PedidoDetalheComponent implements OnInit {
  readonly pedido = signal<Pedido | null>(null);
  readonly carregando = signal(true);
  mostrarSucesso = false;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.mostrarSucesso = this.route.snapshot.queryParams['sucesso'] === '1';

    const id = this.route.snapshot.params['id'];
    this.ordersService.buscarPorId(id).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
