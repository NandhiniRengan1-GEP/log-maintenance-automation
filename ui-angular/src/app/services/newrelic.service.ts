import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ErrorLog {
  id: string;
  transactionId: string;
  timestamp: string;
  error: {
    message: string;
    type: string;
    stackTrace: string;
  };
  containerName: string;
  occurrenceCount: number;
}

export interface ErrorResponse {
  total: number;
  errors: ErrorLog[];
}

@Injectable({
  providedIn: 'root'
})
export class NewRelicService {
  private apiUrl = '/newrelic';

  constructor(private http: HttpClient) {}

  getErrors(): Observable<ErrorResponse> {
    return this.http.get<ErrorResponse>(`${this.apiUrl}/errors`);
  }

  getErrorByTransaction(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/errors/${transactionId}`);
  }
}
