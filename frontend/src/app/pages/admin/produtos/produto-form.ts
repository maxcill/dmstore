import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { UploadService } from '../../../core/services/upload.service';
import { Categoria } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

interface SpecLinha {
  chave: string;
  valor: string;
}

@Component({
  selector: 'app-admin-produto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produto-form.html',
  styleUrls: ['../admin-shared.scss', './produto-form.scss'],
})
export class AdminProdutoFormComponent implements OnInit {
  readonly categorias = signal<Categoria[]>([]);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly uploading = signal(false);
  readonly imagensPreview = signal<string[]>([]);

  ehEdicao = false;
  produtoId = '';

  form = {
    nome: '',
    marca: '',
    categoriaId: '',
    preco: 0,
    precoPromocional: undefined as number | undefined,
    estoque: 0,
    destaque: false,
    descricao: '',
  };

  specs: SpecLinha[] = [{ chave: '', valor: '' }];

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.categoriesService.listar().subscribe((categorias) => this.categorias.set(categorias));

    const id = this.route.snapshot.params['id'];
    if (id && id !== 'novo') {
      this.ehEdicao = true;
      this.produtoId = id;
      this.productsService.buscarPorId(id).subscribe((produto) => {
        this.form = {
          nome: produto.nome,
          marca: produto.marca,
          categoriaId: produto.categoria.id,
          preco: Number(produto.preco),
          precoPromocional: produto.precoPromocional ? Number(produto.precoPromocional) : undefined,
          estoque: produto.estoque,
          destaque: produto.destaque,
          descricao: produto.descricao,
        };

        if (produto.imagens?.length) {
          this.imagensPreview.set([...produto.imagens]);
        }

        if (produto.especificacoes && Object.keys(produto.especificacoes).length > 0) {
          this.specs = Object.entries(produto.especificacoes).map(([chave, valor]) => ({ chave, valor }));
        }
      });
    }
  }

  onArquivosSelecionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.enviarArquivos(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const arquivos = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (arquivos.length > 0) {
      this.enviarArquivos(arquivos);
    }
  }

  private enviarArquivos(arquivos: File[]): void {
    const totalAtual = this.imagensPreview().length;
    if (totalAtual + arquivos.length > 5) {
      this.erro.set('Máximo de 5 imagens por produto.');
      return;
    }

    this.uploading.set(true);
    this.erro.set('');

    this.uploadService.uploadImagens(arquivos).subscribe({
      next: (resposta) => {
        this.imagensPreview.update((atual) => [...atual, ...resposta.urls]);
        this.uploading.set(false);
      },
      error: (err) => {
        this.uploading.set(false);
        this.erro.set(err.error?.message ?? 'Erro ao enviar imagens.');
      },
    });
  }

  removerImagem(index: number): void {
    this.imagensPreview.update((lista) => lista.filter((_, i) => i !== index));
  }

  urlCompleta(url: string): string {
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  adicionarSpec(): void {
    this.specs.push({ chave: '', valor: '' });
  }

  removerSpec(index: number): void {
    this.specs.splice(index, 1);
  }

  salvar(): void {
    this.erro.set('');
    this.sucesso.set('');

    if (!this.form.nome || !this.form.marca || !this.form.categoriaId || !this.form.descricao) {
      this.erro.set('Preencha todos os campos obrigatórios.');
      return;
    }

    const especificacoes: Record<string, string> = {};
    for (const spec of this.specs) {
      if (spec.chave.trim() && spec.valor.trim()) {
        especificacoes[spec.chave.trim()] = spec.valor.trim();
      }
    }

    const payload = {
      ...this.form,
      imagens: this.imagensPreview(),
      especificacoes,
    };

    this.salvando.set(true);

    const requisicao = this.ehEdicao
      ? this.productsService.atualizar(this.produtoId, payload)
      : this.productsService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set('Produto salvo com sucesso!');
        setTimeout(() => this.router.navigate(['/admin/produtos']), 900);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err.error?.message ?? 'Erro ao salvar produto.');
      },
    });
  }
}
