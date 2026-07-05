import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  senha = '';
  readonly erro = signal('');
  readonly carregando = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  entrar(): void {
    if (!this.email || !this.senha) {
      this.erro.set('Preencha e-mail e senha.');
      return;
    }

    this.erro.set('');
    this.carregando.set(true);

    this.authService.login(this.email, this.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.cartService.carregar().subscribe();
        const redirecionarPara = this.route.snapshot.queryParams['redirecionarPara'] ?? '/';
        this.router.navigateByUrl(redirecionarPara);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(erro.error?.message ?? 'Não foi possível entrar. Verifique seus dados.');
      },
    });
  }
}
