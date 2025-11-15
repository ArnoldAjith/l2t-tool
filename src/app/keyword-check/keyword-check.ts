import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Api } from '../api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ErrorSummaryEntry {
  ErrorType: string;
  ErrorCount: number;
  Summary: string;
}

@Component({
  selector: 'app-keyword-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyword-check.html',
  styleUrls: ['./keyword-check.css']
})
export class KeywordCheck {
  selectedFiles: File[] = [];
  uploadProgress: number[] = [];   // drives <progress [value]="uploadProgress[i]">
  message = '';
  isUploading = false;
  isLoaded = false;
  showInstructions = false;
  showDemo = false;
  summaryData: any;
  summaryMessage = '';
  records_with_errors: any;
  records_without_errors: any;
  total_records: any;
  overall_status: any;
  unique_error_type_analysis: any = {};
  showSummary = false;
  errorSummary: any;


  @ViewChild('demoPlayer') demoPlayer?: ElementRef<HTMLVideoElement>;

  // internal trackers for selection-time progress
  private selectionReaders: FileReader[] = [];
  private selectionTimers: number[] = [];

  // Read files directly with FileReader up to this size (above this, simulate)
  private readonly MAX_REAL_READ_BYTES = 50 * 1024 * 1024; // 50 MB

  constructor(private api: Api, private http: HttpClient, private sanitizer: DomSanitizer,) { }

  ngOnDestroy(): void {
    this.clearSelectionProgress();
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  onMultiSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input?.files ?? []);

    // stop any prior progress work
    this.clearSelectionProgress();

    // take exactly two: [Adcopy, Master]
    this.selectedFiles = list.slice(0, 2);
    this.uploadProgress = this.selectedFiles.map(() => 0);
    this.isLoaded = false;

    if (this.selectedFiles.length !== 2) {
      this.message = 'Please select exactly two files: Adcopy first, then Master.';
      return;
    }

    this.message = '';

    // Kick off selection-time progress per file
    this.selectedFiles.forEach((file, i) => {
      if (file.size <= this.MAX_REAL_READ_BYTES) {
        this.readFileWithProgress(file, i);
      } else {
        this.simulateProgress(i, file.size);
      }
    });
  }

  /** Show “real” progress by reading the file with FileReader. */
  private readFileWithProgress(file: File, index: number) {
    const reader = new FileReader();
    this.selectionReaders[index] = reader;

    // reset bar
    this.uploadProgress[index] = 0;

    reader.onloadstart = () => {
      this.uploadProgress[index] = 0;
    };

    reader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / (e.total || file.size || 1)) * 100);
        this.uploadProgress[index] = Math.min(100, Math.max(0, pct));
      }
    };

    reader.onload = () => {
      this.uploadProgress[index] = 100;
    };

    reader.onerror = () => {
      // Keep at current value or reset; here we reset and add a note
      this.uploadProgress[index] = 0;
      this.message = `Could not read ${file.name}.`;
    };

    reader.onabort = () => {
      // selection changed mid-read
      this.uploadProgress[index] = 0;
    };

    // Reading as ArrayBuffer triggers progress events
    reader.readAsArrayBuffer(file);
  }

  /**
   * For very large files, avoid loading into memory.
   * Simulate a smooth 0→100% ramp with a duration based on size (bounded).
   */
  private simulateProgress(index: number, sizeBytes: number) {
    // Duration: base 1200ms + 30ms per MB, clamped 1.2–6s
    const sizeMB = sizeBytes / (1024 * 1024);
    const duration = Math.min(6000, Math.max(1200, 1200 + sizeMB * 30));

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      this.uploadProgress[index] = Math.round(t * 100);

      if (t < 1) {
        this.selectionTimers[index] = window.requestAnimationFrame(step) as unknown as number;
      }
    };

    this.selectionTimers[index] = window.requestAnimationFrame(step) as unknown as number;
  }

  /** Abort file reads and stop simulated timers. */
  private clearSelectionProgress() {
    this.selectionReaders.forEach(r => { try { r.abort(); } catch { } });
    this.selectionReaders = [];

    this.selectionTimers.forEach(id => { try { cancelAnimationFrame(id as unknown as number); } catch { } });
    this.selectionTimers = [];
  }

  // ———————————— Optional: keep your existing upload / download flows ————————————

  onUpload(): void {
    if (this.selectedFiles.length !== 2) {
      this.message = 'Please select exactly two files.';
      return;
    }
    if (this.isUploading) return;

    const [adcopy, master] = this.selectedFiles;
    // const uploadUrl = 'http://localhost:8062/multifile/upload';
    const uploadUrl = 'https://datteamwork.com:8062/multifile/upload';


    this.isUploading = true;
    this.isLoaded = false;
    this.message = '';

    // Use your existing API service; progress bars are NOT tied to upload
    this.api.uploadAdcopyAndMaster([adcopy, master], uploadUrl).subscribe({
      next: (response) => {
        this.summaryData = response.summary;
        this.errorSummary = this.summaryData;
        // this.total_records = this.summaryData.overall_counts.total_records;
        // this.records_with_errors = this.summaryData.overall_counts.records_with_errors;
        // this.records_without_errors = this.summaryData.overall_counts.records_without_errors;
        // this.overall_status = this.summaryData.overall_status;
        // this.unique_error_type_analysis = this.summaryData.unique_error_type_analysis;

        this.showSummary = true;
        this.isUploading = false;
        this.isLoaded = true;
        this.message = 'Files uploaded successfully!';
        // if you want the bars to remain at 100%, do nothing here
      },
      error: (err) => {
        console.error('Upload error', err);
        this.isUploading = false;
        this.isLoaded = false;
        this.message = 'Upload failed. Please try again.';
      }
    });
  }

 getTotalErrorCount(): number {
  return this.errorSummary.reduce(
    (sum: number, e: ErrorSummaryEntry) => sum + e.ErrorCount,
    0
  );
}
  onDownload(): void {
    if (this.selectedFiles.length !== 2) {
      this.message = 'Please select exactly two files.';
      return;
    }

    // const downloadUrl = 'http://localhost:8062/file/download';
    const downloadUrl = 'https://datteamwork.com:8062/file/download';

    window.open(downloadUrl, '_blank');
    this.message = '';
    Swal.fire({
      title: 'Download successfully!',
      text: '',
      icon: 'success'
    }).then(() => {
      window.location.reload();
    });
  }

  demoVideo() {
    this.showDemo = !this.showDemo;
    if (!this.showDemo && this.demoPlayer?.nativeElement) {
      const vid = this.demoPlayer.nativeElement;
      vid.pause();
      vid.currentTime = 0;
    }
  }
}
