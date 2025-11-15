import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// ──────────────────────────────────────────────────────────────────────────────
// Type definitions
// ──────────────────────────────────────────────────────────────────────────────
interface SheetData {
  headers: string[];
  data: any[][];
}

interface ProcessedSheetData extends SheetData {
  formatting: Record<string, string>;
}

interface IssueKeyMapping {
  [parentSummary: string]: Array<{ summary: string; issueKey: string }>;
}

interface ColumnTypeMapping {
  [columnName: string]: 'percentage' | 'currency' | 'integer' | 'text';
}

interface FormattingResult {
  formattedData: any[][];
  appliedFormatting: Record<string, string>;
}

// Extend global Window interface for ExcelJS and XLSX
declare global {
  interface Window {
    XLSX: any;
    ExcelJS: any;
    JSZip?: any;
  }
}

@Component({
  selector: 'app-l2t-deviation',
  standalone: true,
  templateUrl: './l2t-deviation.html',
  styleUrls: ['./l2t-deviation.css'],
  imports: [CommonModule],
})
export class L2tDeviation implements OnInit {
  // ── File selection + per-file progress ──────────────────────────────────────
  selectedFiles: File[] = [];
  uploadProgress: number[] = []; // 0..100 per file

  // ── Parsed workbooks + processed output ─────────────────────────────────────
  file1Data: any = null; // Daily Tracker workbook
  file2Data: any = null; // Pacing Issue Ticket workbook
  processedData: Record<string, ProcessedSheetData> | null = null;

  // ── Output to download (after Generate) ─────────────────────────────────────
  outputBlob: Blob | null = null;
  outputFilename = '';

  // ── Display-only names ─────────────────────────────────────────────────────
  file1Name: string = 'No file chosen';
  file2Name: string = 'No file chosen';

  // ── Row counts ─────────────────────────────────────────────────────────────
  counttOfRow: number = 0;
  rowCountsBySheet: Record<string, number> = {};

  // ── UI state ───────────────────────────────────────────────────────────────
  downloadEnabled = false;
  isProcessing = false;      // overall processing (Excel build) spinner/flag
  processProgress = 0;       // overall processing progress (0..100)

  ngOnInit(): void {
    this.loadExternalLibraries();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // External libraries (XLSX + ExcelJS via CDN)
  // ───────────────────────────────────────────────────────────────────────────
  private loadExternalLibraries(): void {
    // XLSX (SheetJS) browser build
    if (!window.XLSX) {
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      document.head.appendChild(script1);
    }
    // ExcelJS browser build
    if (!window.ExcelJS) {
      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
      document.head.appendChild(script2);
    }
    // JSZip fallback for some ExcelJS builds/environments
    if (!window.JSZip) {
      const script3 = document.createElement('script');
      script3.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      document.head.appendChild(script3);
    }
  }

  private waitForLib(check: () => boolean, timeoutMs = 15000): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (check()) return resolve();
        if (Date.now() - start > timeoutMs) return reject(new Error('Library load timeout'));
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  private async ensureLibrariesLoaded(): Promise<void> {
    await this.waitForLib(() => !!window.XLSX);
    await this.waitForLib(() => !!window.ExcelJS);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Progress helpers
  // ───────────────────────────────────────────────────────────────────────────
  private setProcessProgress(pct: number): void {
    this.processProgress = Math.max(0, Math.min(100, Math.round(pct)));
  }
  private bumpProcess(delta: number): void {
    this.setProcessProgress(this.processProgress + delta);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // File selection (NO parsing here; we only store + reset state)
  // ───────────────────────────────────────────────────────────────────────────
  async onMultiSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input?.files ?? []);
    this.counttOfRow = 0;
    this.rowCountsBySheet = {};
    this.selectedFiles = list.slice(0, 2); // expect exactly two
    this.uploadProgress = this.selectedFiles.map(() => 0);

    // Reset all state; parsing happens on Generate
    this.file1Data = null;
    this.file2Data = null;
    this.processedData = null;
    this.outputBlob = null;
    this.outputFilename = '';
    this.downloadEnabled = false;
    this.processProgress = 0;

    this.file1Name = this.selectedFiles[0]?.name ?? 'No file chosen';
    this.file2Name = this.selectedFiles[1]?.name ?? 'No file chosen';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Generate: read both files (with progress) → process → build workbook blob
  // ───────────────────────────────────────────────────────────────────────────
  async handleGenerate(): Promise<void> {
    if (this.selectedFiles.length !== 2) {
      alert('Please select both files first (Daily Tracker and Pacing Issue Ticket).');
      return;
    }

    try {
      this.isProcessing = true;
      this.setProcessProgress(2);
      await this.ensureLibrariesLoaded();

      // read both with progress
      const [wb1, wb2] = await Promise.all([
        this.readWorkbookWithProgress(this.selectedFiles[0], 0),
        this.readWorkbookWithProgress(this.selectedFiles[1], 1),
      ]);
      this.file1Data = wb1;
      this.file2Data = wb2;

      this.setProcessProgress(35);

      // process data
      const ok = this.processFiles();
      if (!ok || !this.processedData) {
        throw new Error('Processing failed or returned no results.');
      }

      // ✅ compute totals now so {{counttOfRow}} updates immediately
      this.computeRowCounts();

      this.setProcessProgress(70);

      // build workbook blob for download (always ensures at least 1 sheet)
      const { blob, filename } = await this.buildWorkbookBlob(this.processedData);
      this.outputBlob = blob;
      this.outputFilename = filename;

      this.setProcessProgress(100);
      this.downloadEnabled = true;
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to generate the output.');
      this.downloadEnabled = false;
    } finally {
      this.isProcessing = false;
    }
  }

  /** Read a workbook and update uploadProgress[index] as it streams */
  private readWorkbookWithProgress(file: File, idx: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (e: ProgressEvent<FileReader>) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          this.uploadProgress[idx] = pct;
        }
      };

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          this.uploadProgress[idx] = 100; // finalize per-file bar
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          if (!window.XLSX) throw new Error('XLSX library not loaded yet.');
          const workbook = window.XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Cleaning / conversion helpers
  // ───────────────────────────────────────────────────────────────────────────
  private cleanPercentageValue(value: any): number | null {
    if (value == null || value === '' || value === undefined) return null;
    const strValue: string = String(value).trim();
    if (strValue.includes('%')) {
      const n = parseFloat(strValue.replace('%', ''));
      return isNaN(n) ? null : n;
    }
    const n = parseFloat(strValue);
    return isNaN(n) ? null : n;
  }

  private cleanDollarValue(value: any): number | null {
    if (value == null || value === '' || value === undefined) return null;
    const strValue: string = String(value).trim();
    const cleaned = strValue.replace(/[$,]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }

  private getColumnTypeMapping(sheetType: string = 'search'): ColumnTypeMapping {
    const base: ColumnTypeMapping = {
      'Deviation': 'percentage',
      'Adwords ID': 'integer',
      'Bing ID': 'text',
      'Validation': 'text',
      'Bing MTD': 'currency',
      'MTD Budget Utilization': 'percentage',
      'Target Budget Utilization': 'percentage',
      'Budget Utilized Group': 'text',
      'Days Completed': 'integer',
      'Remaining Days': 'integer',
      'Total Days': 'integer',
      'Summary': 'text',
      'Comments': 'text',
      'Campaign Budget': 'integer',
      'Bing Hard Allocation': 'integer',
      'Other Inputs': 'text',
      'Google Budget': 'currency',
      'Bing Budget': 'currency',
      'Total Budget': 'currency',
      'DSR Budget': 'currency',
      'Fields 5%': 'currency',
      'Google MTD': 'currency',
      'Total MTD': 'currency',
      'Underspend Amount Difference': 'currency',
      'Google Yest Spend': 'currency',
      'Bing Yest Spend': 'currency',
      'Active Campaign Budget': 'currency',
      'Active Campaign Dev': 'percentage',
      'Issue Key': 'text',
      'Budget': 'currency',
      'MTD': 'currency',
      'Notes': 'text',
    };

    if (sheetType.toLowerCase() === 'search') {
      return {
        ...base,
        'Total Yest Spend': 'currency',
        'Total Avg to spend': 'currency',
        'Avg to spend Google': 'currency',
        'Avg to spend Bing': 'currency',
      };
    } else if (sheetType.toLowerCase() === 'display' || sheetType.toLowerCase() === 'video') {
      return {
        ...base,
        'Yest Spend': 'currency',
        'Avg to spend': 'currency',
      };
    } else if (sheetType.toLowerCase() === 'by budget grouping') {
      return {
        ...base,
        'Service': 'text',
        'Target Media Spend': 'currency',
        '% of Spend': 'percentage',
      };
    }
    return base;
  }

  private mapIssueKeys(dataArray: any[][], headers: string[], issueKeyData: SheetData): any[][] {
  const issueHeaders = issueKeyData.headers;
  const parentSummaryIdx = issueHeaders.indexOf('Parent summary');
  const summaryIdx = issueHeaders.indexOf('Summary');
  const issueKeyIdx = issueHeaders.indexOf('Issue key');

  if (parentSummaryIdx === -1 || summaryIdx === -1 || issueKeyIdx === -1) {
    console.warn('Required columns not found in issue key file');
    return dataArray.map(row => [...row, 'No ticket id is generated']);
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 1: Build the mapping and collect all parent summaries
  // ────────────────────────────────────────────────────────────────
  const issueKeyMapping: IssueKeyMapping = {};
  const parentSummaries = new Set<string>(); // store all parent summary values

  issueKeyData.data.forEach(row => {
    const parentSummary = String(row[parentSummaryIdx] || '').trim();
    const summary = String(row[summaryIdx] || '').trim();
    const issueKey = String(row[issueKeyIdx] || '').trim();

    if (parentSummary) {
      parentSummaries.add(parentSummary); // collect all parent summary names
      if (!issueKeyMapping[parentSummary]) issueKeyMapping[parentSummary] = [];
      issueKeyMapping[parentSummary].push({ summary, issueKey });
    }
  });

  // ────────────────────────────────────────────────────────────────
  // STEP 2: Find Account column
  // ────────────────────────────────────────────────────────────────
  const accountIdx = headers.indexOf('Account');
  if (accountIdx === -1) {
    return dataArray.map(row => [...row, 'No ticket id is generated']);
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 3: Process and exclude rows
  // ────────────────────────────────────────────────────────────────
  return dataArray
    .filter(row => {
      const account = String(row[accountIdx] || '').trim();
      // 🚫 Exclude if account name is one of the parent summaries
      return !parentSummaries.has(account);
    })
    .map(row => {
      const account = String(row[accountIdx] || '').trim();
      let mappedIssueKey = 'No ticket id is generated';

      if (account && issueKeyMapping[account]) {
        for (const entry of issueKeyMapping[account]) {
          if (entry.summary.toLowerCase().includes('ppc pacing issue')) {
            mappedIssueKey = entry.issueKey || 'No ticket id is generated';
            break;
          }
        }
      }

      return [...row, mappedIssueKey];
    });
}


  private convertToExcelPercentage(value: any): number | null {
    if (value == null || value === '' || value === undefined) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }

  private convertToExcelCurrency(value: any): number | null {
    if (value == null || value === '' || value === undefined) return null;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,]/g, '').trim();
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    }
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }

  private convertToExcelInteger(value: any): number | null {
    if (value == null || value === '' || value === undefined) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : Math.round(n);
  }

  private formatColumnsByMapping(
    dataArray: any[][],
    headers: string[],
    sheetType: string = 'search'
  ): FormattingResult {
    const columnMapping = this.getColumnTypeMapping(sheetType);
    const appliedFormatting: Record<string, string> = {};

    const formattedData = dataArray.map(row => {
      const formattedRow = [...row];
      headers.forEach((columnName, colIdx) => {
        if (columnMapping[columnName]) {
          const columnType = columnMapping[columnName];
          appliedFormatting[columnName] = columnType;
          const originalValue = row[colIdx];
          let formattedValue = originalValue;

          switch (columnType) {
            case 'currency':
              formattedValue = this.convertToExcelCurrency(originalValue);
              break;
            case 'percentage':
              if (columnName === '% of Spend') {
                const val = parseFloat(originalValue);
                formattedValue = isNaN(val) ? null : val / 100;
              } else {
                formattedValue = this.convertToExcelPercentage(originalValue);
              }
              break;
            case 'integer':
              formattedValue = this.convertToExcelInteger(originalValue);
              break;
            case 'text':
              formattedValue = originalValue;
              break;
            default:
              formattedValue = originalValue;
              appliedFormatting[columnName] = 'default';
          }

          formattedRow[colIdx] = formattedValue;
        } else {
          appliedFormatting[columnName] = 'default';
        }
      });
      return formattedRow;
    });

    return { formattedData, appliedFormatting };
  }

  private filterSheetData(
    sheetData: SheetData,
    sheetName: string,
    yestSpendCol: string,
    avgSpendCol: string,
    issueKeyData: SheetData
  ): ProcessedSheetData {
    const headers = sheetData.headers;
    const data = sheetData.data;

    const deviationIdx = headers.indexOf('Deviation');
    const yestSpendIdx = headers.indexOf(yestSpendCol);
    const avgSpendIdx = headers.indexOf(avgSpendCol);

    if (deviationIdx === -1 || yestSpendIdx === -1 || avgSpendIdx === -1) {
      throw new Error(`Missing required columns in ${sheetName} sheet`);
    }

    const filteredData = data.filter(row => {
      const deviation = this.cleanPercentageValue(row[deviationIdx]);
      if (deviation === null || (deviation * 100) >= -10) return false;

      const yestSpend = this.cleanDollarValue(row[yestSpendIdx]);
      const avgSpend = this.cleanDollarValue(row[avgSpendIdx]);
      if (yestSpend === null || avgSpend === null) return false;

      return yestSpend < (avgSpend * 0.95);
    });

    const finalHeaders = [...headers, 'Issue Key'];
    const dataWithIssueKeys = this.mapIssueKeys(filteredData, headers, issueKeyData);

    const sheetType = sheetName.toLowerCase();
    const { formattedData, appliedFormatting } =
      this.formatColumnsByMapping(dataWithIssueKeys, finalHeaders, sheetType);

    return {
      headers: finalHeaders,
      data: formattedData,
      formatting: appliedFormatting,
    };
  }

  private processByBudgetGrouping(budgetGroupingData: SheetData, searchData: SheetData): ProcessedSheetData {
    const normalizeHeader = (h: any): string => String(h || '')
      .replace(/_x000D_|\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedHeaders = budgetGroupingData.headers.map(normalizeHeader);
    const headerIndexMap: Record<string, number> = {};
    normalizedHeaders.forEach((h, i) => { headerIndexMap[h.toLowerCase()] = i; });

    const serviceIdx = headerIndexMap['service'];
    const targetMediaSpendIdx = headerIndexMap['target media spend'];
    const percentOfSpendIdx = headerIndexMap['% of spend'];

    if (serviceIdx === undefined || targetMediaSpendIdx === undefined || percentOfSpendIdx === undefined) {
      throw new Error('Missing required columns in By Budget Grouping sheet: Service, Target Media Spend, or % of Spend');
    }

    const data = budgetGroupingData.data;

    const searchHeaders = searchData.headers;
    const targetBudgetUtilizationIdx = searchHeaders.indexOf('Target Budget Utilization');

    let targetBudgetUtilization = this.cleanPercentageValue(searchData.data[0][targetBudgetUtilizationIdx]);
    if (targetBudgetUtilization === null) {
      throw new Error('Target Budget Utilization value is invalid in Search sheet');
    }
    if (targetBudgetUtilization < 1) targetBudgetUtilization = targetBudgetUtilization * 100;

    const filteredData = data.filter(row => {
      const service = String(row[serviceIdx] || '').trim().toLowerCase();
      if (service !== 'ppc') return false;

      const targetMediaSpend = this.cleanDollarValue(row[targetMediaSpendIdx]);
      if (targetMediaSpend === null || targetMediaSpend <= 0) return false;

      const cleanedPercentOfSpend = this.cleanPercentageValue(row[percentOfSpendIdx]);
      if (cleanedPercentOfSpend === null) return false;

      const percentOfSpend = cleanedPercentOfSpend;
      return (percentOfSpend > (targetBudgetUtilization + 10)) ||
             (percentOfSpend < (targetBudgetUtilization - 8));
    });

    const sheetType = 'by budget grouping';
    const { formattedData, appliedFormatting } =
      this.formatColumnsByMapping(filteredData, normalizedHeaders, sheetType);

    return {
      headers: normalizedHeaders,
      data: formattedData,
      formatting: appliedFormatting,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Pipeline: parse/filter/format (with processing progress bumps)
  // ───────────────────────────────────────────────────────────────────────────
  private processFiles(): boolean {
    if (!this.file1Data || !this.file2Data) {
      alert('Please upload both files first');
      return false;
    }

    try {
      this.setProcessProgress(40); // starting processing after reading

      // Issue key sheet (from file2)
      const issueKeySheetName = this.file2Data.SheetNames[0];
      const issueKeySheet = this.file2Data.Sheets[issueKeySheetName];
      const issueKeyJson = window.XLSX.utils.sheet_to_json(issueKeySheet, { header: 1 });
      const issueKeyData: SheetData = {
        headers: issueKeyJson[0] || [],
        data: issueKeyJson.slice(1),
      };
      this.bumpProcess(5);

      const results: Record<string, ProcessedSheetData> = {};

      // Search
      let searchData: SheetData | null = null;
      if (this.file1Data.SheetNames.includes('Search')) {
        const searchSheet = this.file1Data.Sheets['Search'];
        const searchJsonData = window.XLSX.utils.sheet_to_json(searchSheet, { header: 1 });

        if (searchJsonData.length > 1) {
          searchData = {
            headers: searchJsonData[0],
            data: searchJsonData.slice(1),
          };
          const filtered = this.filterSheetData(
            searchData, 'Search', 'Total Yest Spend', 'Total Avg to spend', issueKeyData
          );
          results['Search'] = filtered;
        }
        this.bumpProcess(15);
      }

      // Display + Video
      ['Display', 'Video'].forEach(sheetName => {
        if (this.file1Data.SheetNames.includes(sheetName)) {
          try {
            const sheet = this.file1Data.Sheets[sheetName];
            const jsonData = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (jsonData.length > 1) {
              const sheetData: SheetData = {
                headers: jsonData[0],
                data: jsonData.slice(1),
              };

              const filtered = this.filterSheetData(
                sheetData, sheetName, 'Yest Spend', 'Avg to spend', issueKeyData
              );
              results[sheetName] = filtered;
            }
            this.bumpProcess(15);
          } catch (error) {
            console.warn(`Error processing ${sheetName} sheet:`, error);
          }
        }
      });

      // By Budget Grouping
      if (this.file1Data.SheetNames.includes('By Budget Grouping') && searchData) {
        try {
          const budgetGroupingSheet = this.file1Data.Sheets['By Budget Grouping'];
          const budgetGroupingJsonData = window.XLSX.utils.sheet_to_json(budgetGroupingSheet, { header: 1 });

          if (budgetGroupingJsonData.length > 6) {
            const budgetGroupingData: SheetData = {
              headers: budgetGroupingJsonData[5],
              data: budgetGroupingJsonData.slice(6),
            };

            const filtered = this.processByBudgetGrouping(budgetGroupingData, searchData);
            results['By Budget Grouping'] = filtered;
          }
          this.bumpProcess(15);
        } catch (error) {
          console.warn('Error processing By Budget Grouping sheet:', error);
          alert(`Error processing By Budget Grouping sheet: ${(error as Error).message}`);
        }
      } else if (this.file1Data.SheetNames.includes('By Budget Grouping') && !searchData) {
        console.warn('By Budget Grouping sheet found but Search sheet not available for reference');
      }

      this.processedData = results;
      if (this.processProgress > 90) this.setProcessProgress(90);
      return true;

    } catch (error) {
      console.error('Processing error:', error);
      alert(`Error processing files: ${(error as Error).message}`);
      return false;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Build workbook Blob (ExcelJS) for download — guarantees ≥1 sheet
  // ───────────────────────────────────────────────────────────────────────────
  private async buildWorkbookBlob(processed: Record<string, ProcessedSheetData>): Promise<{ blob: Blob; filename: string }> {
    if (!window.ExcelJS) throw new Error('ExcelJS library not loaded yet.');

    const workbook = new window.ExcelJS.Workbook();
    workbook.creator = 'L2T Deviation Tool';
    workbook.created = new Date();

    const sheetNames = Object.keys(processed);

    // If no sheets -> add a Summary so the file is always valid
    if (sheetNames.length === 0) {
      const ws = workbook.addWorksheet('Summary');
      ws.addRow(['No qualifying rows were found in the provided files.']);
      ws.getRow(1).font = { bold: true };
    } else {
      // For highlighting in By Budget Grouping
      let targetBudgetUtilization: number | null = null;
      if (processed['Search']) {
        const searchHeaders = processed['Search'].headers;
        const tIdx = searchHeaders.indexOf('Target Budget Utilization');
        if (tIdx !== -1 && processed['Search'].data.length > 0) {
          targetBudgetUtilization = processed['Search'].data[0][tIdx];
          if (targetBudgetUtilization !== null && targetBudgetUtilization < 1) {
            targetBudgetUtilization = targetBudgetUtilization * 100;
          }
        }
      }

      // Build sheets
      for (const sheetName of sheetNames) {
        const sheetData = processed[sheetName];
        const worksheet = workbook.addWorksheet(sheetName);

        // Freeze header row (nice UX)
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Header
        worksheet.addRow(sheetData.headers);
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Rows
        sheetData.data.forEach((row: any[]) => worksheet.addRow(row));

        // Column formats / widths
        sheetData.headers.forEach((columnName, colIdx) => {
          const column = worksheet.getColumn(colIdx + 1);
          const columnType = sheetData.formatting[columnName];
          switch (columnType) {
            case 'percentage':
              column.numFmt = '0.00%';
              column.width = 15;
              column.alignment = { horizontal: 'center' };
              break;
            case 'currency':
              column.numFmt = '$#,##0.00';
              column.width = 18;
              column.alignment = { horizontal: 'right' };
              break;
            case 'integer':
              column.numFmt = columnName === 'Adwords ID' ? '0' : '#,##0';
              column.width = 12;
              column.alignment = { horizontal: 'right' };
              break;
            case 'text':
              column.width = (columnName === 'Issue Key') ? 25 : (columnName === 'Service' ? 15 : 20);
              column.alignment = { horizontal: 'left' };
              break;
            default:
              column.width = 15;
              column.alignment = { horizontal: 'left' };
          }

          // Red highlight rule for "% of Spend" when above Target + 10 (By Budget Grouping)
          if (sheetName === 'By Budget Grouping' && columnName === '% of Spend' && targetBudgetUtilization !== null) {
            sheetData.data.forEach((row, rowIndex) => {
              const dataRowNumber = rowIndex + 2;
              const percentOfSpendValue = row[colIdx];
              if (percentOfSpendValue != null) {
                const comparisonValue = percentOfSpendValue * 100; // stored as 0.xx
                if (comparisonValue > (targetBudgetUtilization! + 10)) {
                  const cell = worksheet.getCell(dataRowNumber, colIdx + 1);
                  cell.font = { color: { argb: 'FFFF0000' }, bold: false };
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC0C0' },
                  };
                }
              }
            });
          }
        });
      }
    }

    // produce blob (shared strings/styles improve compatibility)
    const buffer: ArrayBuffer = await workbook.xlsx.writeBuffer({
      useStyles: true,
      useSharedStrings: true,
    });

    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');
    const filename =
      `filtered_output_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
      `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.xlsx`;

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return { blob, filename };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Download — use the blob produced by Generate
  // ───────────────────────────────────────────────────────────────────────────
  downloadFiles(): void {
    if (!this.outputBlob) {
      alert('Please click Generate first.');
      return;
    }
    const url = window.URL.createObjectURL(this.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.outputFilename || 'filtered_output.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Row counts
  // ───────────────────────────────────────────────────────────────────────────
  private computeRowCounts(): void {
    this.counttOfRow = 0;
    this.rowCountsBySheet = {};
    if (!this.processedData) return;

    for (const [sheet, payload] of Object.entries(this.processedData)) {
      const n = payload?.data?.length ?? 0;
      this.rowCountsBySheet[sheet] = n;
      this.counttOfRow += n;
    }
  }
}
