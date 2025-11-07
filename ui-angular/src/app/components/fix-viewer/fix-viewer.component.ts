import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnosticService } from '../../services/diagnostic.service';
import { SolutionService } from '../../services/solution.service';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-fix-viewer',
  templateUrl: './fix-viewer.component.html',
  styleUrls: ['./fix-viewer.component.css']
})
export class FixViewerComponent implements OnInit {
  transactionId: string = '';
  diagnostic: any = null;
  solution: any = null;
  loading: boolean = true;
  creatingPR: boolean = false;
  prCreated: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagnosticService: DiagnosticService,
    private solutionService: SolutionService,
    private githubService: GithubService
  ) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('transactionId') || '';
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.diagnosticService.getDiagnostics(this.transactionId).subscribe({
      next: (response: any) => {
        this.diagnostic = response.diagnostic;
        
        this.solutionService.generateSolution(this.diagnostic).subscribe({
          next: (solutionResponse: any) => {
            this.solution = solutionResponse;
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Failed to generate solution', err);
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load diagnostic', err);
        this.loading = false;
      }
    });
  }

  createPR() {
    if (!this.solution || !this.diagnostic) return;

    this.creatingPR = true;
    
    const prData = {
      repository: this.diagnostic.repository.repository,
      branch: this.diagnostic.repository.branch,
      fix: this.solution.fix,
      error: this.diagnostic.error
    };

    this.githubService.createPR(prData).subscribe({
      next: (response: any) => {
        this.prCreated = response;
        this.creatingPR = false;
      },
      error: (err: any) => {
        console.error('Failed to create PR', err);
        this.creatingPR = false;
      }
    });
  }

  viewPRs() {
    this.router.navigate(['/prs']);
  }
}
