import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class CarrinhoComponent implements OnInit {
  readonly carregando = signal(true);

  constructor(readonly cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.carregar().subscribe({
      next: () => this.carregando.set(false),
      error: () => this.carregando.set(false),
    });
  }

  alterarQuantidade(itemId: string, novaQuantidade: number): void {
    if (novaQuantidade < 1) {
      this.removerItem(itemId);
      return;
    }
    this.cartService.atualizarItem(itemId, novaQuantidade).subscribe();
  }

  removerItem(itemId: string): void {
    this.cartService.removerItem(itemId).subscribe();
  }
}
