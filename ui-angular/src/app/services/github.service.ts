import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PullRequest {
  prNumber: number;
  prUrl: string;
  branch: string;
  title: string;
  body: string;
  filesChanged: number;
  status: string;
  createdAt: string;
}

export interface CreatePRRequest {
  repository: string;
  branch: string;
  fix: any;
  error: any;
}

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = '/github';

  constructor(private http: HttpClient) {}

  createPR(data: CreatePRRequest): Observable<PullRequest> {
    return this.http.post<PullRequest>(`${this.apiUrl}/create-pr`, data);
  }

  getPRs(): Observable<{ prs: PullRequest[] }> {
    return this.http.get<{ prs: PullRequest[] }>(`${this.apiUrl}/prs`);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
