import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Produto } from '../../../core/models/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/produto', produto.slug]" class="card">
      <div class="card__imagem">
        @if (produto.imagens && produto.imagens.length) {
          <img [src]="urlImagem(produto.imagens[0])" [alt]="produto.nome" />
        } @else {
          <div class="card__placeholder">
            <span>{{ produto.marca.charAt(0) }}</span>
          </div>
        }
        @if (produto.precoPromocional) {
          <span class="card__badge">OFERTA</span>
        }
        @if (produto.destaque) {
          <span class="card__badge-destaque">⭐ DESTAQUE</span>
        }
      </div>

      <div class="card__info">
        <span class="card__marca">{{ produto.marca }}</span>
        <h3 class="card__nome">{{ produto.nome }}</h3>

        <div class="card__specs">
          @for (spec of specsResumo(); track spec) {
            <span class="card__spec-tag">{{ spec }}</span>
          }
        </div>

        <div class="card__preco-bloco">
          @if (produto.precoPromocional) {
            <span class="card__preco-antigo price-tag">{{ produto.preco | currency: 'BRL' }}</span>
            <span class="card__preco price-tag">{{ produto.precoPromocional | currency: 'BRL' }}</span>
          } @else {
            <span class="card__preco price-tag">{{ produto.preco | currency: 'BRL' }}</span>
          }
        </div>

        @if (produto.estoque <= 5 && produto.estoque > 0) {
          <span class="card__estoque-baixo">⚠ Últimas {{ produto.estoque }} unidades</span>
        } @else if (produto.estoque === 0) {
          <span class="card__sem-estoque">✕ Sem estoque</span>
        }

        <div class="card__cta">Ver detalhes →</div>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all 0.2s ease;
      height: 100%;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
      box-shadow: 0 8px 32px rgba(168, 208, 0, 0.15);
    }

    .card__imagem {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--surface-alt);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card__imagem img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card:hover .card__imagem img {
      transform: scale(1.04);
    }

    .card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--surface-alt), #0f1a00);
    }

    .card__placeholder span {
      font-family: var(--font-display);
      font-size: 3rem;
      font-weight: 800;
      color: var(--accent);
      opacity: 0.4;
    }

    .card__badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--accent);
      color: #000;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .card__badge-destaque {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: var(--accent);
      font-size: 0.6rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .card__info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .card__marca {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      font-weight: 700;
    }

    .card__nome {
      font-size: 0.93rem;
      font-weight: 600;
      font-family: var(--font-body);
      line-height: 1.35;
      min-height: 2.5em;
      color: var(--text);
    }

    .card__specs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 2px 0 4px;
    }

    .card__spec-tag {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      background: #0f1a00;
      border: 1px solid rgba(168, 208, 0, 0.2);
      color: var(--accent);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .card__preco-bloco {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .card__preco-antigo {
      font-size: 0.76rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .card__preco {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--accent);
    }

    .card__estoque-baixo {
      font-size: 0.7rem;
      color: var(--warning);
      font-weight: 600;
    }

    .card__sem-estoque {
      font-size: 0.7rem;
      color: var(--danger);
      font-weight: 600;
    }

    .card__cta {
      margin-top: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .card:hover .card__cta {
      opacity: 1;
    }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) produto!: Produto;

  specsResumo(): string[] {
    if (!this.produto.especificacoes) return [];
    return Object.values(this.produto.especificacoes).slice(0, 2);
  }

  urlImagem(url: string): string {
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  }
}
