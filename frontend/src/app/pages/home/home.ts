import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Produto, Categoria } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  readonly categorias = signal<Categoria[]>([]);
  readonly produtosDestaque = signal<Produto[]>([]);
  readonly produtosRecentes = signal<Produto[]>([]);
  readonly carregandoDestaques = signal(true);

  readonly specsDestaque = [
    { label: 'Entrega expressa', valor: '24-72H' },
    { label: 'Garantia de fábrica', valor: '12 MESES' },
    { label: 'Parcelamento', valor: 'até 12X' },
  ];

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.categoriesService.listar().subscribe((categorias) => this.categorias.set(categorias));

    this.productsService.listar({ destaque: true, limite: 8 }).subscribe({
      next: (resposta) => {
        this.produtosDestaque.set(resposta.produtos);
        this.carregandoDestaques.set(false);
      },
      error: () => this.carregandoDestaques.set(false),
    });

    this.productsService.listar({ ordenarPor: 'recentes', limite: 8 }).subscribe((resposta) => {
      this.produtosRecentes.set(resposta.produtos);
    });
  }
}
