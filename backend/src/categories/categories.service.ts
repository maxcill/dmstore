import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { gerarSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = gerarSlug(dto.nome);

    const existente = await this.categoriesRepository.findOne({
      where: [{ nome: dto.nome }, { slug }],
    });

    if (existente) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    const categoria = this.categoriesRepository.create({ ...dto, slug });
    return this.categoriesRepository.save(categoria);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const categoria = await this.categoriesRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return categoria;
  }

  async findBySlug(slug: string): Promise<Category> {
    const categoria = await this.categoriesRepository.findOne({ where: { slug } });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return categoria;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const categoria = await this.findOne(id);

    if (dto.nome) {
      categoria.slug = gerarSlug(dto.nome);
    }

    Object.assign(categoria, dto);
    return this.categoriesRepository.save(categoria);
  }

  async remove(id: string): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriesRepository.remove(categoria);
  }
}
