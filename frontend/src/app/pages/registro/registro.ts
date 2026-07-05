import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {
  nome = '';
  email = '';
  telefone = '';
  senha = '';
  readonly erro = signal('');
  readonly carregando = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  registrar(): void {
    if (!this.nome || !this.email || !this.senha) {
      this.erro.set('Preencha todos os campos obrigatórios.');
      return;
    }

    if (this.senha.length < 6) {
      this.erro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.erro.set('');
    this.carregando.set(true);

    this.authService
      .registrar({
        nome: this.nome,
        email: this.email,
        senha: this.senha,
        telefone: this.telefone || undefined,
      })
      .subscribe({
        next: () => {
          this.carregando.set(false);
          this.router.navigate(['/']);
        },
        error: (erro) => {
          this.carregando.set(false);
          this.erro.set(erro.error?.message ?? 'Não foi possível criar a conta.');
        },
      });
  }
}
