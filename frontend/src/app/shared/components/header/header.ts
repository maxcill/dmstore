import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit {
  termoBusca = '';
  menuAberto = false;
  readonly categorias = signal<Categoria[]>([]);

  constructor(
    readonly authService: AuthService,
    readonly cartService: CartService,
    private readonly categoriesService: CategoriesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.categoriesService.listar().subscribe((categorias) => this.categorias.set(categorias));

    if (this.authService.estaLogado()) {
      this.cartService.carregar().subscribe();
    }
  }

  buscar(): void {
    if (this.termoBusca.trim()) {
      this.router.navigate(['/catalogo'], { queryParams: { busca: this.termoBusca.trim() } });
    }
  }

  sair(): void {
    this.menuAberto = false;
    this.authService.logout();
  }
}
