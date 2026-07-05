import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__col">
          <img src="/assets/logo.png" alt="DMStore" class="footer__logo-img" />
          <p class="footer__desc">
            Assistência técnica especializada em celulares, computadores e notebooks.
            Qualidade e confiança para você.
          </p>
        </div>

        <div class="footer__col">
          <h4>Produtos</h4>
          <a routerLink="/categoria/celulares">Celulares</a>
          <a routerLink="/categoria/computadores">Computadores</a>
          <a routerLink="/categoria/notebooks">Notebooks</a>
          <a routerLink="/categoria/acessorios">Acessórios</a>
        </div>

        <div class="footer__col">
          <h4>Minha conta</h4>
          <a routerLink="/login">Entrar</a>
          <a routerLink="/registro">Criar conta</a>
          <a routerLink="/minha-conta/pedidos">Meus pedidos</a>
        </div>

        <div class="footer__col">
          <h4>Pagamento seguro</h4>
          <p class="footer__desc">Cartão de crédito, Pix e boleto via Stripe.</p>
          <div class="footer__selos">
            <span class="footer__selo">🔒 SSL</span>
            <span class="footer__selo">✓ Stripe</span>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <span>© {{ ano }} DMStore — Todos os direitos reservados.</span>
          <span class="footer__bottom-right">Assistência Técnica Especializada</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--surface);
      border-top: 2px solid var(--accent);
      margin-top: 72px;
    }

    .footer__inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      padding: 52px 24px;
    }

    .footer__logo-img {
      height: 72px;
      width: auto;
      object-fit: contain;
      margin-bottom: 14px;
      filter: drop-shadow(0 0 6px rgba(168, 208, 0, 0.3));
    }

    .footer__desc {
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.65;
      max-width: 300px;
    }

    .footer__col h4 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 16px;
      font-weight: 700;
    }

    .footer__col a {
      display: block;
      font-size: 0.87rem;
      color: var(--text-muted);
      margin-bottom: 10px;
      transition: color 0.15s;
    }

    .footer__col a:hover {
      color: var(--accent);
    }

    .footer__selos {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .footer__selo {
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid rgba(168, 208, 0, 0.3);
      padding: 4px 10px;
      border-radius: 4px;
    }

    .footer__bottom {
      border-top: 1px solid var(--border);
      padding: 16px 24px;
    }

    .footer__bottom-inner {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .footer__bottom-right {
      color: var(--accent);
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .footer__inner { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 560px) {
      .footer__inner { grid-template-columns: 1fr; }
    }
  `],
})
export class FooterComponent {
  readonly ano = new Date().getFullYear();
}
