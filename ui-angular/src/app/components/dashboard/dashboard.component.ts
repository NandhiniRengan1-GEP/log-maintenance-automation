import { Component, OnInit } from '@angular/core';
import { NewRelicService } from '../../services/newrelic.service';
import { DiagnosticService } from '../../services/diagnostic.service';
import { SolutionService } from '../../services/solution.service';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  errorCount: number = 0;
  prCount: number = 0;
  recentErrors: any[] = [];
  recentPRs: any[] = [];
  loading: boolean = true;
  
  serviceStatus = {
    newrelic: { status: 'checking', name: 'New Relic Mock' },
    llm1: { status: 'checking', name: 'LLM1 Diagnostics' },
    llm2: { status: 'checking', name: 'LLM2 Solution' },
    github: { status: 'checking', name: 'GitHub Service' }
  };

  constructor(
    private newRelicService: NewRelicService,
    private diagnosticService: DiagnosticService,
    private solutionService: SolutionService,
    private githubService: GithubService
  ) {}

  ngOnInit() {
    this.loadData();
    this.checkServiceHealth();
  }

  loadData() {
    this.loading = true;
    
    // Load errors
    this.newRelicService.getErrors().subscribe({
      next: (response) => {
        this.errorCount = response.total;
        this.recentErrors = response.errors.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load errors', err);
        this.loading = false;
      }
    });

    // Load PRs
    this.githubService.getPRs().subscribe({
      next: (response) => {
        this.prCount = response.prs.length;
        this.recentPRs = response.prs.slice(0, 5);
      },
      error: (err) => {
        console.error('Failed to load PRs', err);
      }
    });
  }

  checkServiceHealth() {
    // Check New Relic
    this.newRelicService.getErrors().subscribe({
      next: () => this.serviceStatus.newrelic.status = 'online',
      error: () => this.serviceStatus.newrelic.status = 'offline'
    });

    // Check LLM1
    this.diagnosticService.getHealth().subscribe({
      next: () => this.serviceStatus.llm1.status = 'online',
      error: () => this.serviceStatus.llm1.status = 'offline'
    });

    // Check LLM2
    this.solutionService.getHealth().subscribe({
      next: () => this.serviceStatus.llm2.status = 'online',
      error: () => this.serviceStatus.llm2.status = 'offline'
    });

    // Check GitHub
    this.githubService.getHealth().subscribe({
      next: () => this.serviceStatus.github.status = 'online',
      error: () => this.serviceStatus.github.status = 'offline'
    });
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }
}
