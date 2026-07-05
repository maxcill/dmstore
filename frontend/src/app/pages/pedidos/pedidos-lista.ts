import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pedidos-lista.html',
  styleUrl: './pedidos.scss',
})
export class PedidosListaComponent implements OnInit {
  readonly pedidos = signal<Pedido[]>([]);
  readonly carregando = signal(true);

  constructor(private readonly ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.meusPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
