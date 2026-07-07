import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportacaoService, MLProdutoResumo } from '../../../core/services/importacao.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-admin-importacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './importacao.html',
  styleUrls: ['../admin-shared.scss', './importacao.scss'],
})
export class AdminImportacaoComponent implements OnInit {
  aba: 'manual' | 'categoria' | 'automatico' = 'manual';

  // Busca manual
  termoBusca = '';
  offset = 0;
  readonly limite = 20;
  readonly resultados = signal<MLProdutoResumo[]>([]);
  readonly totalResultados = signal(0);
  readonly buscando = signal(false);
  private _selecionados: Set<string> = new Set();
  readonly selecionados = signal<string[]>([]);

  // Importação por categoria
  categoriaMLSelecionada = '';
  categoriaIdSelecionada = '';
  limiteImportacao = 10;

  // Estado geral
  readonly categorias = signal<Categoria[]>([]);
  readonly importando = signal(false);
  readonly mensagemResultado = signal('');
  readonly sucessoImportacao = signal(true);

  constructor(
    private readonly importacaoService: ImportacaoService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.categoriesService.listar().subscribe((cats) => this.categorias.set(cats));
  }

  paginaAtual(): number {
    return Math.floor(this.offset / this.limite) + 1;
  }

  buscar(): void {
    if (!this.termoBusca.trim()) return;
    this.buscando.set(true);
    this._selecionados.clear();
    this.selecionados.set([]);

    this.importacaoService.buscar(this.termoBusca, this.limite, this.offset).subscribe({
      next: (resultado) => {
        this.resultados.set(resultado.results);
        this.totalResultados.set(resultado.paging.total);
        this.buscando.set(false);
      },
      error: () => this.buscando.set(false),
    });
  }

  proximaPagina(): void {
    this.offset += this.limite;
    this.buscar();
  }

  paginaAnterior(): void {
    this.offset = Math.max(0, this.offset - this.limite);
    this.buscar();
  }

  estaSelecionado(id: string): boolean {
    return this._selecionados.has(id);
  }

  toggleSelecionado(id: string): void {
    if (this._selecionados.has(id)) {
      this._selecionados.delete(id);
    } else {
      this._selecionados.add(id);
    }
    this.selecionados.set(Array.from(this._selecionados));
  }

  importarSelecionados(): void {
    if (!this.categoriaIdSelecionada || this._selecionados.size === 0) return;

    this.importando.set(true);
    this.mensagemResultado.set('');

    this.importacaoService
      .importarSelecionados(Array.from(this._selecionados), this.categoriaIdSelecionada)
      .subscribe({
        next: (resultado) => {
          this.importando.set(false);
          this.sucessoImportacao.set(resultado.importados > 0);
          this.mensagemResultado.set(
            `✅ ${resultado.importados} produto(s) importado(s) com sucesso!` +
            (resultado.erros.length ? ` ⚠ ${resultado.erros.length} erro(s).` : ''),
          );
          this._selecionados.clear();
          this.selecionados.set([]);
        },
        error: (err) => {
          this.importando.set(false);
          this.sucessoImportacao.set(false);
          this.mensagemResultado.set('❌ Erro ao importar: ' + (err.error?.message ?? err.message));
        },
      });
  }

  importarCategoria(): void {
    if (!this.categoriaMLSelecionada || !this.categoriaIdSelecionada) return;

    this.importando.set(true);
    this.mensagemResultado.set('');

    this.importacaoService
      .importarCategoria(this.categoriaMLSelecionada, this.categoriaIdSelecionada, this.limiteImportacao)
      .subscribe({
        next: (resultado) => {
          this.importando.set(false);
          this.sucessoImportacao.set(resultado.importados > 0);
          this.mensagemResultado.set(
            `✅ ${resultado.importados} produto(s) importado(s) com sucesso!` +
            (resultado.erros.length ? ` ⚠ ${resultado.erros.length} erro(s).` : ''),
          );
        },
        error: (err) => {
          this.importando.set(false);
          this.sucessoImportacao.set(false);
          this.mensagemResultado.set('❌ Erro: ' + (err.error?.message ?? err.message));
        },
      });
  }

  importarTudo(): void {
    this.importando.set(true);
    this.mensagemResultado.set('');

    this.importacaoService.importarTudo(this.limiteImportacao).subscribe({
      next: (resultado) => {
        this.importando.set(false);
        this.sucessoImportacao.set(true);
        const total = Object.values(resultado).reduce((a, b) => a + b, 0);
        const detalhes = Object.entries(resultado)
          .map(([cat, qtd]) => `${cat}: ${qtd}`)
          .join(', ');
        this.mensagemResultado.set(`✅ ${total} produto(s) importado(s)! (${detalhes})`);
      },
      error: (err) => {
        this.importando.set(false);
        this.sucessoImportacao.set(false);
        this.mensagemResultado.set('❌ Erro: ' + (err.error?.message ?? err.message));
      },
    });
  }
}
