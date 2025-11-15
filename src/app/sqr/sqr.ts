import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, switchMap, takeWhile, catchError, of, finalize } from 'rxjs';

interface UploadResponse {
  success: boolean;
  filename: string;
  rows: number;
  message: string;
  error?: string;
}

interface AnalysisResponse {
  success: boolean;
  session_id: string;
  message: string;
  error?: string;
}

interface ProgressResponse {
  status: 'processing' | 'completed' | 'failed' | 'not_found';
  progress?: {
    processed: number;
    total: number;
    successful: number;
    failed: number;
    messages?: Array<{ type: string; message: string }>;
    filtered_rows?: number;
    original_rows?: number;
  };
  message?: string;
}

interface ResultsResponse {
  status: 'completed' | 'processing' | 'failed';
  total_rows?: number;
  negative_suggestions?: number;
  completion_time?: string;
  error?: string;
  message?: string;
}

@Component({
  selector: 'app-sqr',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './sqr.html',
  styleUrl: './sqr.css'
})
export class Sqr implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:5000';

  // Component state
  currentStep: 'upload' | 'analyze' | 'progress' | 'results' | 'error' = 'upload';

  // File upload
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragOver = false;

  // Analysis
  isAnalyzing = false;
  analysisSessionId: string | null = null;
  progressData: ProgressResponse['progress'] | null = null;
  progressPercentage = 0;

  // Results
  analysisResults: ResultsResponse | null = null;
  isDownloading = false;
  showInstructions = false;

  // Upload success data
  uploadedFileName = '';
  uploadedRows = 0;

  // Status messages
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';
  errorMessage = '';

  showDemo = false;
  @ViewChild('demoPlayer') demoPlayer?: ElementRef<HTMLVideoElement>;

  // Subscriptions
  private progressSubscription?: Subscription;


  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    this.progressSubscription?.unsubscribe();
  }

  // File handling methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      this.showStatus('Only Excel files (.xlsx, .xls) are allowed', 'error');
      return;
    }

    // Validate file size (32MB limit)
    if (file.size > 32 * 1024 * 1024) {
      this.showStatus('File size must be less than 32MB', 'error');
      return;
    }

    this.selectedFile = file;
    this.clearStatus();
  }

  removeFile() {
    this.selectedFile = null;
    this.clearStatus();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // API methods
  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.clearStatus();

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${this.API_BASE}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.isUploading = false)
    ).subscribe(event => {
      if (!event) return;

      if (event.type === HttpEventType.UploadProgress) {
        if ('loaded' in event && 'total' in event) {
          this.uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
        }
      } else if (event.type === HttpEventType.Response) {
        const response = (event as any).body as UploadResponse | null;
        if (response?.success) {
          this.uploadedFileName = response.filename;
          this.uploadedRows = response.rows;
          this.currentStep = 'analyze';
          this.showStatus(response.message, 'success');
        } else {
          this.showStatus(response?.error || 'Upload failed', 'error');
        }
      }
    });
  }


  startAnalysis() {
    this.isAnalyzing = true;
    this.clearStatus();

    this.http.post<AnalysisResponse>(`${this.API_BASE}/analyze`, {}).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.isAnalyzing = false)
    ).subscribe((response: AnalysisResponse | null) => {
  if (!response) {
    this.showStatus('Failed to start analysis (no response)', 'error');
    return;
  }

  if (response.success) {
    this.analysisSessionId = response.session_id;
    this.currentStep = 'progress';
    this.startProgressPolling();
    this.showStatus('Analysis started successfully', 'success');
  } else {
    this.showStatus(response.error || 'Failed to start analysis', 'error');
  }
});

  }

  startProgressPolling() {
    if (!this.analysisSessionId) return;

    this.progressSubscription = interval(2000).pipe(
      switchMap(() =>
        this.http.get<ProgressResponse>(`${this.API_BASE}/progress/${this.analysisSessionId}`).pipe(
          catchError(err => {
            console.error('Progress polling error:', err);
            return of({ status: 'not_found' as const });
          })
        )
      ),
      takeWhile(response =>
        response.status === 'processing' || response.status === 'not_found',
        true
      )
    ).subscribe(response => {
      if (response.status === 'processing' && response.progress) {
        this.progressData = response.progress;
        this.progressPercentage = Math.round((response.progress.processed / response.progress.total) * 100);
      } else if (response.status === 'completed' || response.status === 'failed') {
        this.checkResults();
      }
    });
  }

  checkResults() {
    if (!this.analysisSessionId) return;

    this.http.get<ResultsResponse>(`${this.API_BASE}/results/${this.analysisSessionId}`).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe((response: ResultsResponse | null) => {
  if (!response) {
    this.showStatus('No response received while checking results', 'error');
    return;
  }

  if (response.status === 'completed') {
    this.analysisResults = response;
    this.currentStep = 'results';
    this.showStatus('Analysis completed successfully!', 'success');
  } else if (response.status === 'failed') {
    this.errorMessage = response.error || 'Analysis failed';
    this.currentStep = 'error';
    this.showStatus('Analysis failed', 'error');
  }
});

  }

  downloadResults() {
    if (!this.analysisSessionId) return;

    this.isDownloading = true;
    this.clearStatus();

    this.http.get(`${this.API_BASE}/download/${this.analysisSessionId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.isDownloading = false)
    ).subscribe(blob => {
      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sqr_analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showStatus('File downloaded successfully!', 'success');
    });
  }

  downloadTemplate() {
    this.http.get(`${this.API_BASE}/template`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe(blob => {
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sqr_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showStatus('Template downloaded successfully!', 'success');
    });

  }

  // Navigation methods
  goBackToUpload() {
    this.currentStep = 'upload';
    this.selectedFile = null;
    this.clearStatus();
  }

  startNewAnalysis() {
    this.currentStep = 'upload';
    this.selectedFile = null;
    this.analysisSessionId = null;
    this.analysisResults = null;
    this.progressData = null;
    this.progressPercentage = 0;
    this.uploadedFileName = '';
    this.uploadedRows = 0;
    this.errorMessage = '';
    this.progressSubscription?.unsubscribe();
    this.clearStatus();
  }

  // Utility methods
  getCompletionTime(): string {
    if (!this.analysisResults?.completion_time) return 'Unknown';

    try {
      const date = new Date(this.analysisResults.completion_time);
      return date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  }

  trackByMessage(index: number, item: any): any {
    return item.message || index;
  }

  showStatus(message: string, type: 'success' | 'error' | 'info') {
    this.statusMessage = message;
    this.statusType = type;
  }

  clearStatus() {
    this.statusMessage = '';
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status === 413) {
        errorMessage = 'File too large. Maximum size is 32MB.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Server returned error code ${error.status}`;
      }
    }

    this.showStatus(errorMessage, 'error');
    return of(null);
  }

  demoVideo() {
    this.showDemo = !this.showDemo;

    // Optional: pause & reset when hiding
    if (!this.showDemo && this.demoPlayer?.nativeElement) {
      const vid = this.demoPlayer.nativeElement;
      vid.pause();
      vid.currentTime = 0;
    }
  }
}

