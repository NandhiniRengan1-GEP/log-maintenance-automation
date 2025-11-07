import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnosticService } from '../../services/diagnostic.service';
import { SolutionService } from '../../services/solution.service';

@Component({
  selector: 'app-diagnostic-viewer',
  templateUrl: './diagnostic-viewer.component.html',
  styleUrls: ['./diagnostic-viewer.component.css']
})
export class DiagnosticViewerComponent implements OnInit {
  transactionId: string = '';
  diagnostic: any = null;
  solution: any = null;
  loading: boolean = true;
  loadingSolution: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagnosticService: DiagnosticService,
    private solutionService: SolutionService
  ) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('transactionId') || '';
    this.loadDiagnostic();
  }

  loadDiagnostic() {
    this.loading = true;
    this.diagnosticService.getDiagnostics(this.transactionId).subscribe({
      next: (response: any) => {
        this.diagnostic = response.diagnostic;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load diagnostic', err);
        this.error = 'Failed to load diagnostic analysis';
        this.loading = false;
      }
    });
  }

  generateSolution() {
    this.loadingSolution = true;
    this.solutionService.generateSolution(this.diagnostic).subscribe({
      next: (response: any) => {
        this.solution = response;
        this.loadingSolution = false;
      },
      error: (err: any) => {
        console.error('Failed to generate solution', err);
        this.loadingSolution = false;
      }
    });
  }

  viewFix() {
    this.router.navigate(['/fix', this.transactionId]);
  }
}
