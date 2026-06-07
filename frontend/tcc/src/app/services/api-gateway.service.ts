import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

type HttpParamsRecord = Record<string, string | number | boolean | readonly (string | number | boolean)[]>;

@Injectable({ providedIn: 'root' })
export class ApiGatewayService {
  private readonly gateway = environment.gatewayUrl;

  constructor(private http: HttpClient) {}

  bi = this.createClient('/api/bi');
  v1 = this.createClient('/api/v1');

  private createClient(prefix: string) {
    const baseUrl = `${this.gateway}${prefix}`;
    return {
      get: <T>(path: string, params?: HttpParams | HttpParamsRecord) =>
        this.http.get<T>(`${baseUrl}${path}`, { params }),

      post: <T>(path: string, body: unknown) =>
        this.http.post<T>(`${baseUrl}${path}`, body),

      put: <T>(path: string, body: unknown) =>
        this.http.put<T>(`${baseUrl}${path}`, body),

      delete: <T>(path: string) =>
        this.http.delete<T>(`${baseUrl}${path}`),

      patch: <T>(path: string, body: unknown) =>
        this.http.patch<T>(`${baseUrl}${path}`, body),
    };
  }
}
