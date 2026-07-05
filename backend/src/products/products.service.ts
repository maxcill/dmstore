import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { gerarSlug } from '../common/utils/slug.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const categoria = await this.categoriesService.findOne(dto.categoriaId);

    let slug = gerarSlug(dto.nome);
    const existente = await this.productsRepository.findOne({ where: { slug } });
    if (existente) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    const { categoriaId, ...resto } = dto;
    const produto = this.productsRepository.create({
      ...resto,
      slug,
      categoria,
    });

    return this.productsRepository.save(produto);
  }

  async findAll(query: QueryProductDto) {
    const pagina = query.pagina && query.pagina > 0 ? query.pagina : 1;
    const limite = query.limite && query.limite > 0 ? query.limite : 12;

    const qb = this.productsRepository
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.categoria', 'categoria')
      .where('produto.ativo = :ativo', { ativo: true });

    if (query.busca) {
      qb.andWhere(
        '(LOWER(produto.nome) LIKE :busca OR LOWER(produto.marca) LIKE :busca OR LOWER(produto.descricao) LIKE :busca)',
        { busca: `%${query.busca.toLowerCase()}%` },
      );
    }

    if (query.categoriaId) {
      qb.andWhere('categoria.id = :categoriaId', { categoriaId: query.categoriaId });
    }

    if (query.marca) {
      qb.andWhere('LOWER(produto.marca) = :marca', { marca: query.marca.toLowerCase() });
    }

    if (query.precoMin !== undefined) {
      qb.andWhere('produto.preco >= :precoMin', { precoMin: query.precoMin });
    }

    if (query.precoMax !== undefined) {
      qb.andWhere('produto.preco <= :precoMax', { precoMax: query.precoMax });
    }

    if (query.destaque !== undefined) {
      qb.andWhere('produto.destaque = :destaque', { destaque: query.destaque });
    }

    switch (query.ordenarPor) {
      case 'preco_asc':
        qb.orderBy('produto.preco', 'ASC');
        break;
      case 'preco_desc':
        qb.orderBy('produto.preco', 'DESC');
        break;
      case 'avaliacao':
        qb.orderBy('produto.avaliacaoMedia', 'DESC');
        break;
      default:
        qb.orderBy('produto.criadoEm', 'DESC');
    }

    qb.skip((pagina - 1) * limite).take(limite);

    const [produtos, total] = await qb.getManyAndCount();

    return {
      produtos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async findOne(id: string): Promise<Product> {
    const produto = await this.productsRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return produto;
  }

  async findBySlug(slug: string): Promise<Product> {
    const produto = await this.productsRepository.findOne({ where: { slug } });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return produto;
  }

  async findAllAdmin(): Promise<Product[]> {
    return this.productsRepository.find({ order: { criadoEm: 'DESC' } });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const produto = await this.findOne(id);

    if (dto.categoriaId) {
      produto.categoria = await this.categoriesService.findOne(dto.categoriaId);
    }

    if (dto.nome && dto.nome !== produto.nome) {
      produto.slug = gerarSlug(dto.nome);
    }

    const { categoriaId, ...resto } = dto;
    Object.assign(produto, resto);

    return this.productsRepository.save(produto);
  }

  async remove(id: string): Promise<void> {
    const produto = await this.findOne(id);
    await this.productsRepository.remove(produto);
  }

  async baixarEstoque(id: string, quantidade: number): Promise<void> {
    await this.productsRepository.decrement({ id }, 'estoque', quantidade);
  }
}
