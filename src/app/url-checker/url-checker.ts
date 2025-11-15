import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

// ---- Types -----------------------------------------------------------------
type UrlResult = {
  url: string;
  statusCode: number;
  redirectUrl?: string;
  statusMessage?: string;
  fileId?: { id: number };
};

// ---- Component --------------------------------------------------------------
@Component({
  selector: 'app-url-checker',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './url-checker.html',
  styleUrls: ['./url-checker.css'],
})
export class UrlChecker implements OnInit {
  @ViewChild('fileupload', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  // UI
  cardTitle = 'Url Checker';
  loading = false;   // drives spinner inside Generate button
  submitBtn = true;  // disables Generate until a file is chosen

  // File state
  selectedFile?: File;
  selectedFileName = '';
  inputLabelText = 'Choose File (.xlsx)';

  // Summary
  statusCounts: Record<string, number> = {};
  redirectCount = 0;

  // Config
  // private readonly BASE_URL = 'http://localhost:8092';
  private readonly BASE_URL = 'https://datteamwork.com:8067';
  // private readonly BASE_URL = 'https://tagbees.com:8067';
  userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246';

  // Results (keep as array to simplify template logic)
results: UrlResult[] | null = null;

  constructor(private http: HttpClient) {}

  // Restore last session (optional)
  ngOnInit(): void {
    const restored = this.safeParse<UrlResult[]>(sessionStorage.getItem('excelResults'));
    const fileName = sessionStorage.getItem('fileName');
    if (Array.isArray(restored) && restored.length) {
      this.results = restored;
      this.selectedFileName = fileName || '';
      this.inputLabelText = this.selectedFileName || 'Choose File (.xlsx)';
      this.submitBtn = false;
      this.computeSummary(); // ✅ ensure counts reflect restored data
    }
  }

  // ---------- Summary helpers ----------
  private isRedirectStatus(code: number): boolean {
    const n = Number(code);
    return [301, 302, 303, 307, 308].includes(n);
  }

  private hasRealRedirect(url?: string, redirectUrl?: string): boolean {
    const redir = (redirectUrl ?? '').trim();
    if (!redir || redir === '-') return false;
    if (!url) return true;
    return redir !== url; // ignore echoes of the same URL
  }

  private computeSummary(): void {
    const res = Array.isArray(this.results) ? this.results : [];
    const counts: Record<string, number> = {};
    let redirects = 0;

    for (const r of res) {
      const codeKey = String(r?.statusCode ?? 'unknown');
      counts[codeKey] = (counts[codeKey] || 0) + 1;

      if (this.hasRealRedirect(r?.url, r?.redirectUrl) || this.isRedirectStatus(r?.statusCode)) {
        redirects += 1;
      }
    }

    this.statusCounts = counts;
    this.redirectCount = redirects;
  }

  // ---------- File input ----------
  onFileChange(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];

    // reset state
    this.results = [];
    this.computeSummary();  // ✅ reset counters to zero
    this.submitBtn = true;
    this.loading = false;

    if (!file) {
      this.selectedFile = undefined;
      this.selectedFileName = '';
      this.inputLabelText = 'Choose File (.xlsx)';
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.inputLabelText = file.name;
    this.submitBtn = false;
  }

  // Public handler for the Generate button
  async generate(): Promise<void> {
    await this.uploadAndProcess();
  }

  // Core: read Excel → get fileId → post URLs → set results
  private async uploadAndProcess(): Promise<void> {
    if (!this.selectedFile) {
      alert('Please select file');
      return;
    }

    const fn = this.selectedFileName || this.selectedFile.name;
    sessionStorage.setItem('fileName', fn);

    if (!/\.(xlsx|xls)$/i.test(fn) || !/\.(xlsx|xls)$/i.test(this.selectedFile.name)) {
      alert('Please select excel file only');
      this.inputLabelText = 'File Upload (.xlsx)';
      return;
    }

    if (typeof FileReader === 'undefined') {
      alert('This browser does not support HTML5.');
      return;
    }

    try {
      this.loading = true;
      this.submitBtn = true;

      // 1) Read Excel (as binary string)
      const binary = await this.readAsBinaryStringCompat(this.selectedFile);

      // 2) Parse first sheet rows (expects a column named "urls")
      const wb = XLSX.read(binary, { type: 'binary' });
      const firstSheet = wb.SheetNames[0];
      const excelRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '', raw: false });

      if (!excelRows.length) {
        this.results = [];
        this.computeSummary(); // ✅
        alert('No rows detected in the uploaded sheet.');
        return;
      }

      // 3) Request/ensure file id from backend
      const fileMeta = await firstValueFrom(
        this.http.post<any>(`${this.BASE_URL}/getFileIdByFileName?fileName=${encodeURIComponent(fn)}`, {})
      );
      const fileId = fileMeta?.id;
      if (!fileId) {
        throw new Error('Backend did not return file id.');
      }
      sessionStorage.setItem('excelFileId', String(fileId));

      // 4) Build payload & call URL status endpoint
      const payload = excelRows.map((row, idx) => ({
        url: row.urls,           // make sure your sheet header is exactly "urls"
        file: fileMeta,
        urlNumber: idx + 1,
        userAgent: this.userAgent,
      }));

      const response = await firstValueFrom(
        this.http.post<UrlResult[]>(`${this.BASE_URL}/getUrlStatus`, payload)
      );

      if (!Array.isArray(response) || !response.length) {
        this.results = [];
        this.computeSummary(); // ✅
        alert('No response rows returned.');
        return;
      }

      // Optional sanity check
      const sameFile = response[0]?.fileId?.id === fileId;
      if (!sameFile) {
        console.warn('Warning: Mismatched file id in response.');
      }

      this.results = response;
      this.computeSummary(); // ✅ update counts from fresh data
      sessionStorage.setItem('excelResults', JSON.stringify(this.results));
    } catch (err) {
      console.error(err);
      alert('An error occurred while processing the file.');
    } finally {
      this.loading = false;
      this.submitBtn = false;
    }
  }

  // Download current results as CSV (plain, no styling)
  downloadResults(): void {
    if (!this.results?.length) return;

    const headers = ['URL', 'Status', 'Redirected', 'Status Message'];
    const rows = this.results.map(r => [
      r.url ?? '',
      String(r.statusCode ?? ''),
      r.redirectUrl ?? '',
      (r.statusMessage ?? '').replace(/\r?\n/g, ' ')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'broken_links.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ---- Utils ---------------------------------------------------------------

  // Reads as binary string (falls back to array buffer)
  private readAsBinaryStringCompat(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result); // readAsBinaryString path
        } else if (result instanceof ArrayBuffer) {
          const bytes = new Uint8Array(result); // readAsArrayBuffer path → to binary
          let data = '';
          for (let i = 0; i < bytes.byteLength; i++) data += String.fromCharCode(bytes[i]);
          resolve(data);
        } else {
          reject(new Error('Unsupported FileReader result'));
        }
      };

      reader.onerror = () => reject(reader.error ?? new Error('File read error'));

      if ((reader as any).readAsBinaryString) {
        (reader as any).readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  private safeParse<T = any>(json: string | null): T | null {
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}
