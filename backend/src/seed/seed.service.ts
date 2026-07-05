import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { gerarSlug } from '../common/utils/slug.util';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    await this.seedAdmin();
    const categorias = await this.seedCategorias();
    await this.seedProdutos(categorias);
    this.logger.log('Seed concluído com sucesso!');
  }

  private async seedAdmin() {
    const existente = await this.userRepository.findOne({
      where: { email: 'admin@dmstore.com.br' },
    });

    if (existente) return;

    const senhaCriptografada = await bcrypt.hash('admin123', 10);

    await this.userRepository.save(
      this.userRepository.create({
        nome: 'Administrador DMStore',
        email: 'admin@dmstore.com.br',
        senha: senhaCriptografada,
        role: UserRole.ADMIN,
      }),
    );

    this.logger.log('Usuário admin criado: admin@dmstore.com.br / admin123');
  }

  private async seedCategorias(): Promise<Category[]> {
    const nomes = [
      { nome: 'Celulares', icone: 'phone-portrait-outline' },
      { nome: 'Computadores', icone: 'desktop-outline' },
      { nome: 'Notebooks', icone: 'laptop-outline' },
      { nome: 'Acessórios', icone: 'headset-outline' },
      { nome: 'Monitores', icone: 'tv-outline' },
    ];

    const categorias: Category[] = [];

    for (const item of nomes) {
      let categoria = await this.categoryRepository.findOne({
        where: { nome: item.nome },
      });

      if (!categoria) {
        categoria = await this.categoryRepository.save(
          this.categoryRepository.create({
            nome: item.nome,
            slug: gerarSlug(item.nome),
            icone: item.icone,
          }),
        );
      }

      categorias.push(categoria);
    }

    return categorias;
  }

  private async seedProdutos(categorias: Category[]) {
    const existentes = await this.productRepository.count();
    if (existentes > 0) return;

    const porNome = (nome: string) => categorias.find((c) => c.nome === nome);

    const produtos = [
      {
        nome: 'Smartphone Galaxy X200 128GB',
        marca: 'Samsung',
        preco: 2499.9,
        precoPromocional: 2199.9,
        estoque: 35,
        categoria: porNome('Celulares'),
        destaque: true,
        descricao:
          'Smartphone com tela AMOLED de 6.5", 128GB de armazenamento, câmera tripla de 50MP e bateria de longa duração.',
        especificacoes: {
          Tela: '6.5" AMOLED',
          Armazenamento: '128GB',
          RAM: '8GB',
          Câmera: '50MP + 12MP + 8MP',
          Bateria: '5000mAh',
        },
      },
      {
        nome: 'iPhone 15 Pro 256GB',
        marca: 'Apple',
        preco: 8999.0,
        precoPromocional: null,
        estoque: 18,
        categoria: porNome('Celulares'),
        destaque: true,
        descricao:
          'iPhone 15 Pro com chip A17 Pro, tela Super Retina XDR de 6.1" e sistema de câmeras profissional.',
        especificacoes: {
          Tela: '6.1" Super Retina XDR',
          Armazenamento: '256GB',
          Chip: 'A17 Pro',
          Câmera: '48MP + 12MP + 12MP',
        },
      },
      {
        nome: 'PC Gamer Ryzen 5 RTX 4060',
        marca: 'DMStore Build',
        preco: 5499.0,
        precoPromocional: 4999.0,
        estoque: 12,
        categoria: porNome('Computadores'),
        destaque: true,
        descricao:
          'Computador gamer completo com processador Ryzen 5, placa de vídeo RTX 4060, 16GB RAM e SSD de 512GB.',
        especificacoes: {
          Processador: 'AMD Ryzen 5 5600',
          'Placa de vídeo': 'RTX 4060 8GB',
          RAM: '16GB DDR4',
          Armazenamento: 'SSD 512GB NVMe',
        },
      },
      {
        nome: 'Notebook Ultrafino i5 16GB',
        marca: 'Dell',
        preco: 3899.0,
        precoPromocional: 3599.0,
        estoque: 22,
        categoria: porNome('Notebooks'),
        destaque: false,
        descricao:
          'Notebook leve e potente, ideal para trabalho e estudos, com processador Intel i5 e 16GB de RAM.',
        especificacoes: {
          Processador: 'Intel Core i5 12ª geração',
          RAM: '16GB',
          Armazenamento: 'SSD 512GB',
          Tela: '14" Full HD',
        },
      },
      {
        nome: 'Notebook Gamer i7 RTX 4050',
        marca: 'Acer',
        preco: 6299.0,
        precoPromocional: null,
        estoque: 9,
        categoria: porNome('Notebooks'),
        destaque: true,
        descricao:
          'Notebook gamer com processador Intel i7, placa de vídeo RTX 4050 e tela de 144Hz para alta performance.',
        especificacoes: {
          Processador: 'Intel Core i7 13ª geração',
          'Placa de vídeo': 'RTX 4050 6GB',
          RAM: '16GB',
          Tela: '15.6" Full HD 144Hz',
        },
      },
      {
        nome: 'Monitor Gamer 27" 165Hz',
        marca: 'LG',
        preco: 1399.0,
        precoPromocional: 1199.0,
        estoque: 40,
        categoria: porNome('Monitores'),
        destaque: false,
        descricao:
          'Monitor gamer de 27 polegadas, resolução Full HD, taxa de atualização de 165Hz e tempo de resposta de 1ms.',
        especificacoes: {
          Tamanho: '27"',
          Resolução: 'Full HD 1920x1080',
          'Taxa de atualização': '165Hz',
        },
      },
      {
        nome: 'Fone de Ouvido Bluetooth ANC',
        marca: 'JBL',
        preco: 499.9,
        precoPromocional: 399.9,
        estoque: 60,
        categoria: porNome('Acessórios'),
        destaque: false,
        descricao:
          'Fone de ouvido sem fio com cancelamento de ruído ativo e até 30 horas de bateria.',
        especificacoes: {
          Conectividade: 'Bluetooth 5.3',
          Bateria: 'até 30 horas',
          'Cancelamento de ruído': 'Ativo',
        },
      },
      {
        nome: 'Teclado Mecânico RGB',
        marca: 'Logitech',
        preco: 349.9,
        precoPromocional: null,
        estoque: 50,
        categoria: porNome('Acessórios'),
        destaque: false,
        descricao:
          'Teclado mecânico com iluminação RGB customizável e switches táteis de alta durabilidade.',
        especificacoes: {
          Switches: 'Mecânicos táteis',
          Iluminação: 'RGB',
          Conexão: 'USB-C',
        },
      },
      {
        nome: 'Mouse Gamer 16000 DPI',
        marca: 'Razer',
        preco: 279.9,
        precoPromocional: 229.9,
        estoque: 70,
        categoria: porNome('Acessórios'),
        destaque: false,
        descricao:
          'Mouse gamer de alta precisão com sensor óptico de 16000 DPI e design ergonômico.',
        especificacoes: {
          DPI: '16000',
          Botões: '7 programáveis',
          Conexão: 'USB com fio',
        },
      },
      {
        nome: 'Celular Intermediário 256GB',
        marca: 'Xiaomi',
        preco: 1799.0,
        precoPromocional: 1599.0,
        estoque: 45,
        categoria: porNome('Celulares'),
        destaque: false,
        descricao:
          'Smartphone com ótimo custo-benefício, 256GB de armazenamento e câmera de 108MP.',
        especificacoes: {
          Tela: '6.67" AMOLED',
          Armazenamento: '256GB',
          Câmera: '108MP',
          Bateria: '5000mAh',
        },
      },
    ];

    for (const dados of produtos) {
      if (!dados.categoria) continue;

      await this.productRepository.save(
        this.productRepository.create({
          nome: dados.nome,
          slug: gerarSlug(dados.nome),
          marca: dados.marca,
          preco: dados.preco,
          precoPromocional: dados.precoPromocional ?? null,
          estoque: dados.estoque,
          categoria: dados.categoria,
          destaque: dados.destaque,
          descricao: dados.descricao,
          especificacoes: dados.especificacoes,
          imagens: [],
          ativo: true,
        }),
      );
    }
  }
}
