import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly baseUrl = `${environment.apiUrl}/upload`;

  constructor(private readonly http: HttpClient) {}

  uploadImagens(arquivos: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    arquivos.forEach((arquivo) => formData.append('imagens', arquivo));
    return this.http.post<{ urls: string[] }>(`${this.baseUrl}/imagens`, formData);
  }
}
