import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario, UserRole } from '../models/models';

const TOKEN_KEY = 'dmstore_token';
const USER_KEY = 'dmstore_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioSignal = signal<Usuario | null>(this.recuperarUsuario());

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaLogado = computed(() => this.usuarioSignal() !== null);
  readonly ehAdmin = computed(() => this.usuarioSignal()?.role === UserRole.ADMIN);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  registrar(dados: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, dados)
      .pipe(tap((resposta) => this.salvarSessao(resposta)));
  }

  login(email: string, senha: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(tap((resposta) => this.salvarSessao(resposta)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.usuarioSignal.set(null);
    this.router.navigate(['/']);
  }

  obterToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private salvarSessao(resposta: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, resposta.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(resposta.usuario));
    this.usuarioSignal.set(resposta.usuario);
  }

  private recuperarUsuario(): Usuario | null {
    const dados = localStorage.getItem(USER_KEY);
    return dados ? JSON.parse(dados) : null;
  }
}
