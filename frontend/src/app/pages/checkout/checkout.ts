import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { EnderecoEntrega } from '../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent implements OnInit {
  readonly erro = signal('');
  readonly processando = signal(false);

  endereco: EnderecoEntrega = {
    destinatario: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  };

  constructor(
    readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.cartService.carregar().subscribe((carrinho) => {
      if (!carrinho.itens || carrinho.itens.length === 0) {
        this.router.navigate(['/carrinho']);
      }
    });
  }

  finalizarPedido(): void {
    this.erro.set('');
    this.processando.set(true);

    this.ordersService.criar(this.endereco).subscribe({
      next: (pedido) => {
        this.processando.set(false);
        this.router.navigate(['/minha-conta/pedidos', pedido.id], {
          queryParams: { sucesso: 1 },
        });
      },
      error: (erro) => {
        this.processando.set(false);
        this.erro.set(erro.error?.message ?? 'Não foi possível finalizar o pedido.');
      },
    });
  }
}
