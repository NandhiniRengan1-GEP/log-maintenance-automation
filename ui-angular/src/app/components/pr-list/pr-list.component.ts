import { Component, OnInit } from '@angular/core';
import { GithubService, PullRequest } from '../../services/github.service';

@Component({
  selector: 'app-pr-list',
  templateUrl: './pr-list.component.html',
  styleUrls: ['./pr-list.component.css']
})
export class PrListComponent implements OnInit {
  prs: PullRequest[] = [];
  loading: boolean = true;

  constructor(private githubService: GithubService) {}

  ngOnInit() {
    this.loadPRs();
  }

  loadPRs() {
    this.loading = true;
    this.githubService.getPRs().subscribe({
      next: (response: any) => {
        this.prs = response.prs;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load PRs', err);
        this.loading = false;
      }
    });
  }
}
