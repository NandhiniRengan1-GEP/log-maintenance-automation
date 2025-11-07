import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CodeFix {
  file: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  lineStart: number;
  lineEnd: number;
}

export interface Alert {
  category: string;
  severity: string;
  message: string;
  suggestedAction: string;
}

export interface SolutionResponse {
  solutionType: 'CODE_FIX' | 'ALERT';
  confidence: string;
  fix?: CodeFix;
  alert?: Alert;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  private apiUrl = '/llm2';

  constructor(private http: HttpClient) {}

  generateSolution(diagnostic: any): Observable<SolutionResponse> {
    return this.http.post<SolutionResponse>(`${this.apiUrl}/generate-solution`, {
      diagnostic
    });
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
