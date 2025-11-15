import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpEvent, HttpEventType } from '@angular/common/http';

interface BudgetUpdateResult {
  budgetUpdatePK: {
    updateDate: string;
    adwordId: string;
    service: string;
  };
  accountName: string;
  yesterdayBudget: number;
  todayBudget: number;
  difference: number;
  comments: string;
}

interface MissingAccountResult {
  Client: string;
  Adwords_ID: string;
  Service: string;
  Target_Media_Spend: number;
  Status: string;
  Comments: string;
}

interface BudgetGroupResult {
  account: string;
  budgetGroups: string;
  yestSpend: number;
  yestSpendDev: number;
  deviation: number;
}

interface BudgetGroupData {
  highUnderSpendAccountsFirstSearch: BudgetGroupResult[];
  highUnderSpendAccountsSecondSearch: BudgetGroupResult[];
  mediumUnderSpendAccountsFirstSearch: BudgetGroupResult[];
  mediumUnderSpendAccountsSecondSearch: BudgetGroupResult[];
  highOverSpendAccountsSearch: BudgetGroupResult[];
  mediumOverSpendAccountsSearch: BudgetGroupResult[];
  highUnderSpendAccountsFirstDisplay: BudgetGroupResult[];
  highUnderSpendAccountsSecondDisplay: BudgetGroupResult[];
  mediumUnderSpendAccountsFirstDisplay: BudgetGroupResult[];
  mediumUnderSpendAccountsSecondDisplay: BudgetGroupResult[];
  highOverSpendAccountsDisplay: BudgetGroupResult[];
  mediumOverSpendAccountsDisplay: BudgetGroupResult[];
  highUnderSpendAccountsFirstVideo: BudgetGroupResult[];
  highUnderSpendAccountsSecondVideo: BudgetGroupResult[];
  mediumUnderSpendAccountsFirstVideo: BudgetGroupResult[];
  mediumUnderSpendAccountsSecondVideo: BudgetGroupResult[];
  highOverSpendAccountsVideo: BudgetGroupResult[];
  mediumOverSpendAccountsVideo: BudgetGroupResult[];
}

@Component({
  selector: 'app-dsr',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dsr.html',
  styleUrl: './dsr.css'
})
export class Dsr {
  loading = false;
  uploadXlsx = false;
  budgetGroupTable = false;
  showDownload = false;
  reportName = 'budgetUpdate';
  inputCardTitle = 'Budget Update';
  budgetUpdateDiv = false;
  missingAccountDiv = false;
  activeTab = 'tab1';
  showInstructions = false;

  fileSelected = false;

  // Date fields
  dsrDate = '';
  trackerDate = '';
  yesterdayDate = '';
  todayDate = '';

  // File names
  dsrFileName = '';
  googleMTDFileName = '';
  bingMTDFileName = '';
  bingYTDFileName = '';
  dsrYTDFileName = '';
  dsrTDYFileName = '';
  masterFileName = '';
  trackerYTDFileName = '';
  trackerTDYFileName = '';

  // Results
  budgetUpdateResults: BudgetUpdateResult[] = [];
  missingAccountResults: MissingAccountResult[] = [];
  budgetGroupResults: BudgetGroupData[] = [];

  selectedFiles: File[] = [];
  uploadProgress: number[] = [];

  private formData = new FormData();
  private xlsxObj: any = {
    dsrFileName: {},
    googleMTDFileName: {},
    bingMTDFileName: {},
    bingYTDFileName: {},
    dsrYTDFileName: {},
    dsrTDYFileName: {},
    masterFileName: {},
    trackerYTDFileName: {},
    trackerTDYFileName: {}
  };

  private readonly FILE_ORDER: Record<string, string[]> = {
    dsr: ['dsr'],
    budgetUpdate: ['dsrTDY', 'masterFile'],
    missingAccount: ['dsrTDY', 'masterFile'],
    trackerData: ['googleMTD', 'bingMTD', 'bingYTD', 'dsrYTD', 'dsrTDY', 'masterFile'],
    summary: ['trackerYTD', 'trackerTDY'],
    budgetGroup: ['googleMTD', 'bingYTD', 'dsrTDY', 'masterFile']
  };

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  // === H4 counters ===
  numberOfAccounts = 0;
  numberOfIncreasedFromComments = 0;
  numberOfDecreasedFromComments = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    this.todayDate = this.formatDateForInput(today);
    this.trackerDate = this.formatDateForInput(today);
    this.dsrDate = this.formatDateForInput(today);
    this.yesterdayDate = this.formatDateForInput(yesterday);
  }

  selectReport(): void {
    switch (this.reportName) {
      case 'budgetUpdate':
        this.inputCardTitle = 'Budget Update';
        break;
      case 'missingAccount':
        this.inputCardTitle = 'Missing Account';
        break;
      case 'trackerData':
        this.inputCardTitle = 'Tracker Data';
        break;
      case 'dsr':
        this.inputCardTitle = 'DSR';
        break;
      case 'summary':
        this.inputCardTitle = 'Summary';
        break;
      case 'budgetGroup':
        this.inputCardTitle = 'Budget Grouping Spend';
        break;
    }

    // Reset state
    this.budgetUpdateDiv = false;
    this.missingAccountDiv = false;
    this.resetFileNames();
    this.formData = new FormData();

    // Reset counters
    this.numberOfAccounts = 0;
    this.numberOfIncreasedFromComments = 0;
    this.numberOfDecreasedFromComments = 0;
  }

  onMultiSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input?.files ?? []);
    const order = this.FILE_ORDER[this.reportName] ?? [];

    this.selectedFiles = files;
    this.uploadProgress = files.map(() => 0);

    this.formData = new FormData();
    this.resetFileNames();
    this.fileSelected = false;

    if (files.length < order.length) {
      this.validateUploadReadiness();
      return;
    }

    const setNameProp = (key: string, name: string) => {
      switch (key) {
        case 'dsr': this.dsrFileName = name; break;
        case 'googleMTD': this.googleMTDFileName = name; break;
        case 'bingMTD': this.bingMTDFileName = name; break;
        case 'bingYTD': this.bingYTDFileName = name; break;
        case 'dsrYTD': this.dsrYTDFileName = name; break;
        case 'dsrTDY': this.dsrTDYFileName = name; break;
        case 'masterFile': this.masterFileName = name; break;
        case 'trackerYTD': this.trackerYTDFileName = name; break;
        case 'trackerTDY': this.trackerTDYFileName = name; break;
      }
    };

    order.forEach((key, idx) => {
      const file = files[idx];
      if (!file) return;
      this.formData.delete(key);
      this.formData.append(key, file);
      setNameProp(key, file.name);
      this.validXlsx(file.name, 'xlsxUpload', key + 'FileName');
    });

    this.validateUploadReadiness();
  }

  private updatePerFileProgress(loaded: number, total: number | null | undefined): void {
    if (!total || total <= 0 || this.selectedFiles.length === 0) {
      this.uploadProgress = this.selectedFiles.map(() => 0);
      return;
    }

    const sizes = this.selectedFiles.map(f => f.size);
    const cumSizes: number[] = [];
    sizes.reduce((acc, s, i) => (cumSizes[i] = acc + s, acc + s), 0);

    let idx = cumSizes.findIndex(cs => loaded <= cs);
    if (idx === -1) idx = this.selectedFiles.length - 1;

    const prevCum = idx === 0 ? 0 : cumSizes[idx - 1];
    const currSize = sizes[idx] || 1;
    const currLoaded = Math.max(0, Math.min(currSize, loaded - prevCum));
    const currPct = Math.floor((currLoaded / currSize) * 100);

    this.uploadProgress = this.selectedFiles.map((_, i) => {
      if (i < idx) return 100;
      if (i === idx) return Math.max(0, Math.min(100, currPct));
      return 0;
    });
  }

  private asNum(v: any): number {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  // === NEW: unified counters updater (uses current active table flag) ===
  private updateCounts(): void {
    if (this.budgetUpdateDiv) {
      const rows = this.budgetUpdateResults || [];

      // Unique accounts by accountName
      this.numberOfAccounts = new Set(
        rows.map(r => (r?.accountName ?? '').toString().trim())
      ).size;

      // Prefer provided difference; else compute today - yesterday
      const diff = (r: BudgetUpdateResult) =>
        this.asNum(r?.difference) ||
        (this.asNum(r?.todayBudget) - this.asNum(r?.yesterdayBudget));

      this.numberOfIncreasedFromComments = rows.filter(r => diff(r) > 0).length;
      this.numberOfDecreasedFromComments = rows.filter(r => diff(r) < 0).length;
      return;
    }

    if (this.missingAccountDiv) {
      const rows = this.missingAccountResults || [];

      // Unique accounts by Client
      this.numberOfAccounts = new Set(
        rows.map(r => (r?.Client ?? '').toString().trim())
      ).size;

      // No numeric deltas in Missing Account dataset
      this.numberOfIncreasedFromComments = 0;
      this.numberOfDecreasedFromComments = 0;
      return;
    }

    // Default reset
    this.numberOfAccounts = 0;
    this.numberOfIncreasedFromComments = 0;
    this.numberOfDecreasedFromComments = 0;
  }

  // keep the rest of your original methods unchanged

  loadFile(event: Event, type: string): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      this.formData.delete(type);
      this.formData.append(type, file);

      switch (type) {
        case 'dsr': this.dsrFileName = file.name; break;
        case 'googleMTD': this.googleMTDFileName = file.name; break;
        case 'bingMTD': this.bingMTDFileName = file.name; break;
        case 'bingYTD': this.bingYTDFileName = file.name; break;
        case 'dsrYTD': this.dsrYTDFileName = file.name; break;
        case 'dsrTDY': this.dsrTDYFileName = file.name; break;
        case 'masterFile': this.masterFileName = file.name; break;
        case 'trackerYTD': this.trackerYTDFileName = file.name; break;
        case 'trackerTDY': this.trackerTDYFileName = file.name; break;
      }

      this.validXlsx(file.name, 'xlsxUpload', type + 'FileName');
    }
  }

  validXlsx(val: string, type: string, name: string): void {
    if (!val) {
      this.xlsxObj[name][type] = val;
      return;
    }

    this.xlsxObj[name][type] = val;
    const fileExtension = val.replace(/^.*\./, '');
    this.xlsxObj[name]['fileFormat'] = (fileExtension === 'xlsx' || fileExtension === 'csv');

    this.validateUploadReadiness();
  }

  private validateUploadReadiness(): void {
    switch (this.reportName) {
      case 'budgetUpdate':
      case 'missingAccount':
        this.uploadXlsx =
          !!this.dsrTDYFileName &&
          !!this.masterFileName &&
          this.isValidFile('dsrTDYFileName') &&
          this.isValidFile('masterFileName');
        this.fileSelected = true;
        break;
      case 'trackerData':
        this.uploadXlsx =
          !!this.googleMTDFileName && !!this.bingMTDFileName &&
          !!this.bingYTDFileName && !!this.dsrYTDFileName &&
          !!this.dsrTDYFileName && !!this.masterFileName &&
          this.isValidFile('googleMTDFileName') &&
          this.isValidFile('bingMTDFileName') &&
          this.isValidFile('bingYTDFileName') &&
          this.isValidFile('dsrYTDFileName') &&
          this.isValidFile('dsrTDYFileName') &&
          this.isValidFile('masterFileName');
        this.fileSelected = true;
        break;
      case 'dsr':
        this.uploadXlsx = !!this.dsrFileName && this.isValidFile('dsrFileName');
        this.fileSelected = true;
        break;
      case 'summary':
        this.uploadXlsx =
          !!this.trackerYTDFileName && !!this.trackerTDYFileName &&
          this.isValidFile('trackerYTDFileName') &&
          this.isValidFile('trackerTDYFileName');
        this.fileSelected = true;
        break;
      case 'budgetGroup':
        this.uploadXlsx =
          !!this.googleMTDFileName && !!this.bingYTDFileName &&
          !!this.dsrTDYFileName && !!this.masterFileName &&
          this.isValidFile('googleMTDFileName') &&
          this.isValidFile('bingYTDFileName') &&
          this.isValidFile('dsrTDYFileName') &&
          this.isValidFile('masterFileName');
        this.fileSelected = true;
        break;
      default:
        this.uploadXlsx = false;
    }
  }

  private isValidFile(fileName: string): boolean {
    return this.xlsxObj[fileName]?.xlsxUpload && this.xlsxObj[fileName]?.fileFormat === true;
  }

  url = 'https://datteamwork.com:8064/';
  // url = 'http://localhost:8064/';
  // url = 'https://tagbees.com:8064/';

  trackerUpload(): void {
    let postUrl = '';

    switch (this.reportName) {
      case 'dsr':
        postUrl = `${this.url}upload/dsrUpload?reportName=${this.reportName}&reportDate=${this.dsrDate}`;
        break;
      case 'summary':
        postUrl = `${this.url}upload/summaryUpload?reportName=${this.reportName}&yesterdayDate=${this.yesterdayDate}&todayDate=${this.todayDate}`;
        break;
      case 'trackerData':
        postUrl = `${this.url}upload/trackerUpload?reportName=${this.reportName}&trackerDate=${this.trackerDate}`;
        break;
      case 'budgetUpdate':
        postUrl = `${this.url}upload/budgetChangeUpload?reportName=${this.reportName}`;
        break;
      case 'missingAccount':
        postUrl = `${this.url}upload/missingAccountUpload?reportName=${this.reportName}`;
        break;
      case 'budgetGroup':
        postUrl = `${this.url}upload/budgetGroupingUpload?reportName=${this.reportName}&trackerDate=${this.trackerDate}`;
        break;
    }

    this.loading = true;
    this.uploadXlsx = false;

    this.http.post(postUrl, this.formData, { reportProgress: true, observe: 'events' })
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const loaded = event.loaded ?? 0;
            const total = event.total ?? undefined;
            this.updatePerFileProgress(loaded, total);
          }
          if (event.type === HttpEventType.Response) {
            this.uploadProgress = this.selectedFiles.map(() => 100);

            const response = event.body;
            this.loading = false;
            this.uploadXlsx = true;

            if (response && response.status === 'Success') {
              this.showDownload = true;

              if (this.reportName === 'budgetUpdate') {
                this.budgetUpdateResults = response.budgetUpdateAccounts;
                this.showBudgetUpdateTable();
                this.updateCounts(); // ← update counters
              } else if (this.reportName === 'missingAccount') {
                this.missingAccountResults = response.missingAccounts;
                this.showMissingAccountTable();
                this.updateCounts(); // ← update counters
              } else {
                this.showSuccessAlert('File generated successfully!');
                // keep counters as-is for other report types
              }
            } else if (response && this.reportName === 'budgetGroup') {
              this.showDownload = true;
              this.budgetGroupResults = response;
              this.showBudgetGroupTable('tab1');
              this.budgetGroupTable = true;
              // counters not used here
            } else {
              this.showDownload = false;
              this.showErrorAlert('Something went wrong!');
            }
          }
        },
        error: (error) => {
          console.log(error);
          this.loading = false;
          this.uploadXlsx = true;
          this.showDownload = false;
          this.showErrorAlert('Something went wrong!');
        }
      });
  }

  private showBudgetUpdateTable(): void {
    this.missingAccountDiv = false;
    this.budgetUpdateDiv = true;
  }

  private showMissingAccountTable(): void {
    this.budgetUpdateDiv = false;
    this.missingAccountDiv = true;
  }

  showBudgetGroupTable(tab: string): void {
    this.activeTab = tab;
  }

  getCurrentTabData(type: 'search' | 'display' | 'video', level: 'first' | 'second', category: 'under' | 'over'): BudgetGroupResult[] {
    if (!this.budgetGroupResults || this.budgetGroupResults.length === 0) {
      return [];
    }

    const typeIndex = type === 'search' ? 0 : type === 'display' ? 1 : 2;
    const data = this.budgetGroupResults[typeIndex];

    if (!data) return [];

    switch (this.activeTab) {
      case 'tab1': return data.highUnderSpendAccountsFirstSearch || [];
      case 'tab2': return data.highUnderSpendAccountsSecondSearch || [];
      case 'tab3': return data.mediumUnderSpendAccountsFirstSearch || [];
      case 'tab4': return data.mediumUnderSpendAccountsSecondSearch || [];
      case 'tab5': return data.highOverSpendAccountsSearch || [];
      case 'tab6': return data.mediumOverSpendAccountsSearch || [];
      default: return [];
    }
  }

  downloadReport(): void {
    const d = new Date(this.trackerDate);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    const formatted = `${mm}/${dd}/${yyyy}`;

    const params = new URLSearchParams({
      report: String(this.reportName || ''),
      trackerDate: formatted,
    });
    console.log(params.toString());
    window.location.href = `${this.url}download/dsrDownload?${params.toString()}`;
  }


  private resetFileNames(): void {
    this.dsrFileName = '';
    this.googleMTDFileName = '';
    this.bingMTDFileName = '';
    this.bingYTDFileName = '';
    this.dsrYTDFileName = '';
    this.dsrTDYFileName = '';
    this.masterFileName = '';
    this.trackerYTDFileName = '';
    this.trackerTDYFileName = '';
  }

  private formatDateForInput(date: Date): string {
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${month}/${day}/${date.getFullYear()}`;
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString === '-') {
      return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  }

  private showSuccessAlert(message: string): void {
    alert(`Success: ${message}`);
  }

  private showErrorAlert(message: string): void {
    alert(`Error: ${message} `);
  }

  showDemo = false;
  @ViewChild('demoPlayer') demoPlayer?: ElementRef<HTMLVideoElement>;

  demoVideo() {
    this.showDemo = !this.showDemo;

    if (!this.showDemo && this.demoPlayer?.nativeElement) {
      const vid = this.demoPlayer.nativeElement;
      vid.pause();
      vid.currentTime = 0;
    }
  }
}
