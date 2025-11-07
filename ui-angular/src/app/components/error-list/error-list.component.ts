import { Component, OnInit } from '@angular/core';
import { NewRelicService, ErrorLog } from '../../services/newrelic.service';

@Component({
  selector: 'app-error-list',
  templateUrl: './error-list.component.html',
  styleUrls: ['./error-list.component.css']
})
export class ErrorListComponent implements OnInit {
  errors: ErrorLog[] = [];
  filteredErrors: ErrorLog[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  selectedCategory: string = 'all';

  constructor(private newRelicService: NewRelicService) {}

  ngOnInit() {
    this.loadErrors();
  }

  loadErrors() {
    this.loading = true;
    this.newRelicService.getErrors().subscribe({
      next: (response: any) => {
        this.errors = response.errors;
        this.filteredErrors = response.errors;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load errors', err);
        this.loading = false;
      }
    });
  }

  filterErrors() {
    this.filteredErrors = this.errors.filter(error => {
      const matchesSearch = error.error.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           error.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || error.error.type === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getErrorCategories(): string[] {
    return ['all', ...new Set(this.errors.map(e => e.error.type))];
  }
}
