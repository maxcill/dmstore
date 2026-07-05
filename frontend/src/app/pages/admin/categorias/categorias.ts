import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../core/services/categories.service';
import { Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['../admin-shared.scss', './categorias.scss'],
})
export class AdminCategoriasComponent implements OnInit {
  readonly categorias = signal<Categoria[]>([]);
  readonly erro = signal('');
  readonly salvando = signal(false);

  editandoId = '';
  form = { nome: '', icone: '', descricao: '' };

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.categoriesService.listar().subscribe((cats) => this.categorias.set(cats));
  }

  editar(categoria: Categoria): void {
    this.editandoId = categoria.id;
    this.form = {
      nome: categoria.nome,
      icone: categoria.icone ?? '',
      descricao: categoria.descricao ?? '',
    };
  }

  cancelarEdicao(): void {
    this.editandoId = '';
    this.form = { nome: '', icone: '', descricao: '' };
    this.erro.set('');
  }

  salvar(): void {
    if (!this.form.nome.trim()) {
      this.erro.set('O nome é obrigatório.');
      return;
    }
    this.erro.set('');
    this.salvando.set(true);

    const requisicao = this.editandoId
      ? this.categoriesService.atualizar(this.editandoId, this.form)
      : this.categoriesService.criar(this.form);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.cancelarEdicao();
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err.error?.message ?? 'Erro ao salvar categoria.');
      },
    });
  }

  remover(id: string): void {
    if (!confirm('Excluir esta categoria?')) return;
    this.categoriesService.remover(id).subscribe(() => {
      this.categorias.update((lista) => lista.filter((c) => c.id !== id));
    });
  }
}
