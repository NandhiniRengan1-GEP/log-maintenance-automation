import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Diagnostic {
  error: {
    category: string;
    severity: string;
    message: string;
  };
  source: {
    file: string;
    line: number;
    function: string;
    codeSnippet: string;
  };
  repository: {
    repository: string;
    branch: string;
    path: string;
  };
}

export interface DiagnosticResponse {
  transactionId: string;
  diagnostic: Diagnostic;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {
  private apiUrl = '/llm1';

  constructor(private http: HttpClient) {}

  getDiagnostics(transactionId: string, timeRange: string = '24h'): Observable<DiagnosticResponse> {
    return this.http.post<DiagnosticResponse>(`${this.apiUrl}/diagnose`, {
      transactionId,
      timeRange
    });
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
