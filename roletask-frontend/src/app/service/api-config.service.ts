import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly localBackendBaseUrl = 'http://localhost:8094';

  getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
      return '/api';
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isAngularDevServer = isLocalhost && window.location.port === '4200';

    return isAngularDevServer ? `${this.localBackendBaseUrl}/api` : '/api';
  }
}