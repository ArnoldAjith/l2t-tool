import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-missing-essential-extensions',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './missing-essential-extensions.html',
  styleUrls: ['./missing-essential-extensions.css']
})
export class MissingEssentialExtensions implements OnInit {
  // API Base URL - update this to match your backend URL
  private readonly API_BASE_URL = 'https://deetaanalyticsllc.com:8053/api';

  isSidebarOpen = false;
  dataSource: string = 'google';
  uploadedFilesCount = 0;
  completeAuditFilesCount = 0;
  availableChecksCount = 0;

  selectedTech: string = '';
  sessionID: string = '';
  accountId: string = '';

  startDate: string = '';
  endDate: string = '';

  selectedPeriod = 'last_90_days';

  // File upload properties
  fileTypes: any[] = [];
  selectedFileType: string = '';
  selectedFile: File | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.sessionID = sessionStorage.getItem('sessionID') || '';
    this.getMakeList(this.sessionID);
    this.updateDateRange(this.selectedPeriod);
    this.loadFileTypes();
  }

  loadFileTypes(): void {
    // Load file types specific to the 'asset_type' check
    const checkKey = 'asset_type';
    const apiUrl = `${this.API_BASE_URL}/file-types/${checkKey}`;
    this.http.get<any>(apiUrl, { withCredentials: true }).subscribe({
      next: (response) => {
        this.fileTypes = response.file_types || [];
        console.log('File types loaded for asset_type check:', this.fileTypes);
      },
      error: (error) => {
        console.error('Error loading file types:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onTimePeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPeriod = value;
    this.updateDateRange(value);
  }


  updateDateRange(period: string): void {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1);

    const start = new Date(today);

    switch (period) {
      case 'last_7_days':
        start.setDate(today.getDate() - 7);
        break;
      case 'last_30_days':
        start.setDate(today.getDate() - 30);
        break;
      case 'last_90_days':
        start.setDate(today.getDate() - 90);
        break;
      case 'last_6_months':
        start.setMonth(today.getMonth() - 6);
        break;
      case 'last_year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start.setDate(today.getDate() - 90);
    }

    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  onDataSourceChange(value: string) {
    // Reset results when switching data sources
    this.resetAudit();
    this.dataSource = value;
    
    // Clear file selection when switching away from upload
    if (value !== 'upload') {
      this.selectedFile = null;
      this.selectedFileType = '';
    }
    
    // Clear account selection when switching to upload
    if (value === 'upload') {
      this.accountId = '';
    }
  }

  // Loading state
  isProcessing: boolean = false;
  processingProgress: number = 0;
  processingMessage: string = '';

  // Results state
  auditResults: any = null;
  showResults: boolean = false;
  currentDataSource: string = ''; // Track which data source the current results are from
  currentAuditRunId: string = ''; // Track the current audit run to prevent showing stale results

  runAudit() {
    // Clear previous results before starting a new audit
    this.resetAudit();
    
    // Generate a unique run ID for this audit
    this.currentAuditRunId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle different flows based on data source
    if (this.dataSource === 'upload') {
      // File upload flow - no account required
      this.currentDataSource = 'upload';
      this.runFileUploadAudit();
    } else {
      // Auto extraction flow - account required
      if (!this.accountId) {
        alert('Please select an account first');
        return;
      }

      this.currentDataSource = 'google';
      const check = 'asset_type';
      const requestBody = {
        account_id: this.accountId,
        check_key: check,
        start_date: this.startDate,
        end_date: this.endDate,
      };

      // Set loading state
      this.isProcessing = true;
      this.processingProgress = 0;
      this.processingMessage = 'Starting audit...';

      const apiUrl = `${this.API_BASE_URL}/fetch-single-check/${this.sessionID}`;

      this.http.post<any>(apiUrl, requestBody, { withCredentials: true }).subscribe({
        next: (data) => {
          console.log('Audit started:', data);
          this.processingMessage = 'Fetching data from Google Ads...';
          // Start polling for status
          this.pollForCheckCompletion(check);
        },
        error: (error) => {
          console.error('Error starting audit:', error);
          this.isProcessing = false;
          alert('Failed to start audit. Please try again.');
        },
      });
    }
  }

  runFileUploadAudit() {
    // Validate file and file type selection
    if (!this.selectedFileType) {
      alert('Please select a file type first');
      return;
    }

    if (!this.selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    const check = 'asset_type';

    // Set loading state
    this.isProcessing = true;
    this.processingProgress = 0;
    this.processingMessage = 'Uploading file...';

    // Step 1: Upload the file
    const formData = new FormData();
    formData.append('file_type', this.selectedFileType);
    formData.append('file', this.selectedFile);

    const uploadUrl = `${this.API_BASE_URL}/upload-file/${this.sessionID}`;

    this.http.post<any>(uploadUrl, formData, { withCredentials: true }).subscribe({
      next: (uploadResponse) => {
        console.log('File uploaded:', uploadResponse);
        this.processingMessage = 'Processing audit...';
        this.processingProgress = 50;

        // Step 2: Run the audit with uploaded file
        const requestBody = {
          check_keys: [check]
        };

        const runUrl = `${this.API_BASE_URL}/run-selected-file-upload/${this.sessionID}`;

        this.http.post<any>(runUrl, requestBody, { withCredentials: true }).subscribe({
          next: (runResponse) => {
            console.log('Audit started:', runResponse);
            this.processingMessage = 'Processing check...';
            this.processingProgress = 75;

            if (runResponse.success && runResponse.audit_id) {
              // Audit completed immediately (file uploads are fast)
              // Fetch the results
              this.fetchCheckDetailsFromSession(check);
            } else {
              // Poll for completion
              this.pollForCheckCompletion(check);
            }
          },
          error: (error) => {
            console.error('Error running audit:', error);
            this.isProcessing = false;
            alert('Failed to run audit. Please try again.');
          },
        });
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.isProcessing = false;
        alert('Failed to upload file. Please try again.');
      },
    });
  }

  fetchCheckDetailsFromSession(checkKey: string) {
    this.processingMessage = 'Loading audit details...';
    const detailsUrl = `${this.API_BASE_URL}/get-check-details/${this.sessionID}/${checkKey}`;
    const runId = this.currentAuditRunId; // Capture current run ID

    this.http.get<any>(detailsUrl, { withCredentials: true }).subscribe({
      next: (checkData) => {
        console.log('Check details:', checkData);
        
        // Only show results if they match the current data source AND current run ID
        if (this.currentDataSource === 'upload' && this.currentAuditRunId === runId) {
          // Store results and show them
          this.auditResults = checkData;
          this.showResults = true;
          this.isProcessing = false;
          this.processingProgress = 100;
          this.processingMessage = 'Audit completed successfully!';
        } else {
          console.log('Ignoring results - data source mismatch or stale run');
        }
      },
      error: (error) => {
        console.error('Error fetching check details:', error);
        this.isProcessing = false;
        alert('Failed to retrieve audit results. Please try again.');
      },
    });
  }

  /**
   * Poll the processing status endpoint to check when the check is complete
   */
  pollForCheckCompletion(checkKey: string) {
    const maxAttempts = 180; // 3 minutes max (180 seconds)
    let attempts = 0;
    const pollInterval = 1000; // Poll every 1 second

    const pollStatus = () => {
      if (attempts >= maxAttempts) {
        this.isProcessing = false;
        alert('Audit is taking longer than expected. Please check back in a few minutes.');
        return;
      }

      const statusUrl = `${this.API_BASE_URL}/processing-status/${this.sessionID}`;

      this.http.get<any>(statusUrl, { withCredentials: true }).subscribe({
        next: (statusData) => {
          console.log('Processing status:', statusData);

          // Extract status information
          const fileStatus = statusData.file_processing || {};
          const processingStatus = statusData.processing_status || {};
          
          // Calculate progress
          const fileProgress = fileStatus.completion_percentage || 0;
          const processingProgress = processingStatus.percentage || 0;
          this.processingProgress = Math.round((fileProgress + processingProgress) / 2);

          // Update message
          if (fileProgress < 100) {
            this.processingMessage = `Fetching files: ${Math.round(fileProgress)}%`;
          } else {
            this.processingMessage = `Processing check: ${Math.round(processingProgress)}%`;
          }

          // Check if processing is complete
          const isProcessingComplete = processingStatus.is_complete || false;
          const resultsReady = statusData.results_ready || false;
          const availableResults = statusData.available_results || [];

          // Check if our specific check is ready
          const resultsAvailable = availableResults.includes(checkKey);

          // If processing is complete and results are ready, try to get results
          // Also check if the check is in available_results OR if results_ready is true
          if (isProcessingComplete && (resultsAvailable || resultsReady)) {
            console.log('Check completed, getting results...');
            this.getCheckResults(checkKey);
            return;
          }

          // Check for timeout - if timeout and we have any results, try to get them
          if (processingStatus.is_timeout && (resultsAvailable || resultsReady)) {
            console.log('Timeout reached, getting available results...');
            this.getCheckResults(checkKey);
            return;
          }

          // If processing is complete but results aren't in available_results yet,
          // try to get results anyway (they might be ready but not yet in the list)
          if (isProcessingComplete && processingStatus.completed >= 1) {
            console.log('Processing complete, attempting to get results...');
            this.getCheckResults(checkKey);
            return;
          }

          // Continue polling
          attempts++;
          setTimeout(pollStatus, pollInterval);
        },
        error: (error) => {
          console.error('Error polling status:', error);
          attempts++;
          setTimeout(pollStatus, pollInterval);
        },
      });
    };

    // Start polling
    pollStatus();
  }

  /**
   * Get the results for the completed check
   */
  getCheckResults(checkKey: string) {
    this.processingMessage = 'Retrieving results...';
    const resultsUrl = `${this.API_BASE_URL}/get-single-check-results/${this.sessionID}/${checkKey}`;

    this.http.get<any>(resultsUrl, { withCredentials: true }).subscribe({
      next: (resultsData) => {
        console.log('Check results:', resultsData);

        if (resultsData.success && resultsData.audit_id) {
          // Fetch the actual check details using the audit_id
          this.fetchCheckDetails(resultsData.audit_id, checkKey);
        } else {
          // Results not ready yet, continue polling
          console.log('Results not ready yet, continuing to poll...');
          setTimeout(() => this.pollForCheckCompletion(checkKey), 1000);
        }
      },
      error: (error) => {
        console.error('Error getting results:', error);
        
        // If 202 status (Accepted - still processing), continue polling
        if (error.status === 202) {
          setTimeout(() => this.pollForCheckCompletion(checkKey), 1000);
        } else {
          this.isProcessing = false;
          alert('Failed to retrieve results. Please try again.');
        }
      },
    });
  }

  /**
   * Fetch the detailed check data directly from session (bypasses authentication)
   */
  fetchCheckDetails(auditId: string, checkKey: string) {
    this.processingMessage = 'Loading audit details...';
    // For auto extraction, use audit_id to fetch from AUDIT_STORE (not session)
    const detailsUrl = `${this.API_BASE_URL}/get-check-details-by-audit/${auditId}/${checkKey}`;
    const runId = this.currentAuditRunId; // Capture current run ID

    this.http.get<any>(detailsUrl, { withCredentials: true }).subscribe({
      next: (checkData) => {
        console.log('Check details:', checkData);
        
        // Only show results if they match the current data source AND current run ID
        if (this.currentDataSource === 'google' && this.currentAuditRunId === runId) {
          // Store results and show them
          this.auditResults = checkData;
          this.showResults = true;
          this.isProcessing = false;
          this.processingProgress = 100;
          this.processingMessage = 'Audit completed successfully!';
          
          // Scroll to results section
          setTimeout(() => {
            const resultsElement = document.getElementById('audit-results-section');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else {
          console.log('Ignoring results - data source mismatch or stale run');
        }
      },
      error: (error) => {
        console.error('Error fetching check details:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        this.isProcessing = false;
        alert('Failed to load audit details. Please try again.');
      },
    });
  }

  /**
   * Reset the form to run a new audit
   */
  resetAudit() {
    this.showResults = false;
    this.auditResults = null;
    this.isProcessing = false;
    this.processingProgress = 0;
    this.processingMessage = '';
    this.currentDataSource = ''; // Clear data source tracking
    this.currentAuditRunId = ''; // Clear run ID tracking
  }


  getStatusBadgeClass(status: string): string {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('pass') || statusLower.includes('healthy')) {
      return 'badge bg-success';
    } else if (statusLower.includes('fail') || statusLower.includes('issue')) {
      return 'badge bg-danger';
    } else if (statusLower.includes('warning')) {
      return 'badge bg-warning';
    }
    return 'badge bg-secondary';
  }

  getStatusCircleClass(status: string): string {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'critical') {
      return 'status-circle critical';
    } else if (statusLower === 'needs review' || statusLower.includes('needs review')) {
      return 'status-circle needs-review';
    } else if (statusLower === 'healthy') {
      return 'status-circle healthy';
    } else if (statusLower === 'error' || statusLower === 'processing error') {
      return 'status-circle error';
    }
    return 'status-circle default';
  }

  getImpactBadgeClass(impact: string): string {
    const impactLower = (impact || '').toLowerCase();
    if (impactLower === 'high') {
      return 'badge bg-danger';
    } else if (impactLower === 'medium') {
      return 'badge bg-warning';
    } else if (impactLower === 'low') {
      return 'badge bg-info';
    }
    return 'badge bg-secondary';
  }

  getRecordKeys(record: any): string[] {
    if (!record || typeof record !== 'object') {
      return [];
    }
    return Object.keys(record);
  }

  formatColumnName(columnName: string): string {
    if (!columnName) return '';
    return columnName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Format value for display
   */
  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      // Format large numbers with commas
      if (value >= 1000) {
        return value.toLocaleString();
      }
      // Format decimals to 2 places if needed
      if (value % 1 !== 0) {
        return value.toFixed(2);
      }
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  logout() {
    console.log('Logout clicked');
  }

  technologies: any[] = [];

  onTechChange(event: any) {
    this.accountId = event.target.value;
  }

  getMakeList(sessionID: string) {
    const apiUrl = `${this.API_BASE_URL}/accounts/${sessionID}`;

    this.http.get<any>(apiUrl, { withCredentials: true }).subscribe({
      next: (response) => {
        this.technologies = response.accounts || [];
      },
      error: (error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }
}
