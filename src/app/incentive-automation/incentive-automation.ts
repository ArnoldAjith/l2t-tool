import { Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-incentive-automation',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './incentive-automation.html',
  styleUrls: ['./incentive-automation.css'],
})
export class IncentiveAutomation {
  fileType: 'single' | 'multiple' | 'domain' = 'single';
  files: File[] = [];
  uploadProgress: number[] = [];   // per-file progress [0..100]

  uploading = false;
  canDownload = false;
  isUploading = false;
  message = '';
  isLoaded = false;
  showInstructions = false;

  // ✅ counts
  responseCount = 0;
  numberOfRows = 0;
  showSummary = false;

  showDemo = false;
  @ViewChild('demoPlayer') demoPlayer?: ElementRef<HTMLVideoElement>;

  // Endpoints
  // private readonly BASE = 'http://localhost:8063';
  // private readonly BASE2 = 'http://localhost:8063';
  private readonly BASE = 'https://datteamwork.com:8063';
  private readonly BASE2 = 'https://datteamwork.com:8063';

  private readonly URL_SINGLE = `${this.BASE2}/upload`;
  private readonly URL_MULTI = `${this.BASE2}/uploads`;
  private readonly URL_DOMAIN = `${this.BASE}/upload-domain`;
  private readonly URL_ZIP = `${this.BASE}/download-zip`;

  constructor(private http: HttpClient) { }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files = Array.from(input.files ?? []);
    this.uploadProgress = this.files.map(() => 0);
    this.message = this.files.length ? 'Files selected. Ready to upload.' : '';
    this.canDownload = false;
    this.isLoaded = false;

    // reset counts on new selection
    this.responseCount = 0;
    this.numberOfRows = 0;
  }

  uploadFiles(): void {
    if (!this.files.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Files Selected',
        text: 'Please select at least one file.',
        confirmButtonColor: '#3085d6',
        background: '#1a1a2e',
        color: '#fff',
      });
      return;
    }

    const fd = new FormData();
    if (this.fileType === 'single') {
      fd.append('file', this.files[0]);
    } else if (this.fileType === 'multiple') {
      this.files.forEach(f => fd.append('files', f));
    }
    else {
      this.files.forEach(f => fd.append('latest-file', f));
    }

    this.uploading = true;
    this.isUploading = true;
    this.isLoaded = false;
    this.message = '';
    this.uploadProgress = this.files.map(() => 0);

    const sizes = this.files.map(f => f.size || 0);
    const totalBytes = sizes.reduce((a, b) => a + b, 0) || 1;
    const prefixSums: number[] = [0];
    for (let i = 0; i < sizes.length; i++) prefixSums.push(prefixSums[i] + sizes[i]);

    const endpoint = this.fileType === 'single' ? `${this.URL_SINGLE}`
      : this.fileType === 'multiple' ? `${this.URL_MULTI}`
      : `${this.URL_DOMAIN}`;

      console.log(endpoint);

    this.http.post(endpoint, fd, { reportProgress: true, observe: 'events' })
      .pipe(finalize(() => {
        this.uploading = false;
        this.isUploading = false;
        Swal.close();
      }))
      .subscribe({
        next: (event: HttpEvent<any>) => {  
          if (event?.type === HttpEventType.UploadProgress && typeof event.loaded === 'number') {
            const loaded = Math.min(event.loaded, totalBytes);
            this.uploadProgress = sizes.map((size, i) => {
              const start = prefixSums[i];
              const loadedForThis = Math.max(0, Math.min(loaded - start, size));
              return size > 0 ? Math.floor((loadedForThis / size) * 100) : 100;
            });
          }

          if (event?.type === HttpEventType.Response) {
            const httpRes = event as HttpResponse<any>;
            const body = httpRes.body ?? {};

            this.showSummary = true;
            const count = this.extractCount(body);
            this.responseCount = count;
            this.numberOfRows = count;

            console.log('Return map from backend:', body);
            console.log('Processed count:', count);

            const ok = httpRes.status >= 200 && httpRes.status < 300;
            if (ok) {
              this.canDownload = true;
              this.isLoaded = true;
              this.uploadProgress = this.files.map(() => 100);
              this.message = 'Files uploaded successfully.';
            } else {
              this.canDownload = false;
              this.isLoaded = false;
              this.message = 'Something went wrong during the upload.';
            }
          }
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.canDownload = false;
          this.isLoaded = false;
          this.message = err?.error?.message || err?.message || 'Upload failed. Please try again.';
        },
      });
  }

  private extractCount(body: any): number {
    if (!body) return 0;

    if (Array.isArray(body)) return body.length;

    for (const k of ['count', 'total', 'totalCount', 'processedCount', 'numberOfRows', 'rowsCount', 'lineCount']) {
      if (typeof body[k] === 'number') return body[k];
      if (typeof body[k] === 'string' && !isNaN(+body[k])) return +body[k];
    }

    for (const k of ['records', 'items', 'data', 'urls', 'rows']) {
      if (Array.isArray(body[k])) return body[k].length;
    }

    if (typeof body === 'object') return Object.keys(body).length;
    return 0;
  }

  downloadZip(): void {
    if (!this.canDownload) return;

    this.http.get(this.URL_ZIP, { responseType: 'blob', observe: 'response' })
      .pipe(finalize(() => Swal.close()))
      .subscribe({
        next: (res) => {
          const blob = res.body as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');

          const cd = res.headers.get('Content-Disposition') || '';
          const m = /filename="?([^"]+)"?/i.exec(cd);
          const filename = m?.[1] || 'Incentive.zip';

          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Download failed', err);
        },
      });
  }

  onDownload(): void {
    this.downloadZip();
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
