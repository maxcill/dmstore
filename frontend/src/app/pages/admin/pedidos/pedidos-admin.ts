import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { OrderStatus, Pedido } from '../../../core/models/models';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-admin.html',
  styleUrls: ['../admin-shared.scss', './pedidos-admin.scss'],
})
export class AdminPedidosComponent implements OnInit {
  readonly pedidos = signal<Pedido[]>([]);
  readonly carregando = signal(true);

  readonly statusOpcoes = [
    { value: OrderStatus.PENDENTE, label: 'Pendente' },
    { value: OrderStatus.PAGO,     label: 'Pago' },
    { value: OrderStatus.ENVIADO,  label: 'Enviado' },
    { value: OrderStatus.ENTREGUE, label: 'Entregue' },
    { value: OrderStatus.CANCELADO,label: 'Cancelado' },
  ];

  constructor(private readonly ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.listarTodosAdmin().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  atualizarStatus(id: string, status: OrderStatus): void {
    this.ordersService.atualizarStatus(id, status).subscribe((pedidoAtualizado) => {
      this.pedidos.update((lista) =>
        lista.map((p) => (p.id === id ? pedidoAtualizado : p)),
      );
    });
  }
}
