import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/pagamento`;

  constructor(private readonly http: HttpClient) {}

  criarPaymentIntent(pedidoId: string): Observable<{ clientSecret: string; valor: number }> {
    return this.http.post<{ clientSecret: string; valor: number }>(
      `${this.baseUrl}/criar-intent`,
      { pedidoId },
    );
  }
}
