import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-language-setting',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './language-setting.html',
  styleUrl: './language-setting.css'
})
export class LanguageSetting implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';

  columns: string[] = [];

  summaryData: any = {};
  language_settings_analysis: { total_campaigns: number; summary: string } = {
    total_campaigns: 0,
    summary: ''
  };
  configuration_overview: { settings_significance: string } = { settings_significance: '' };
  overall_status = '';
  recommendations: string[] = [];
  executive_summary = '';
  showSummary = false;

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "LanguageSettings";
    const sheetName = "language";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.summaryData = response?.summaryData ?? {};
        // this.language_settings_analysis =
        //   this.summaryData?.language_settings_analysis ?? { total_campaigns: 0, summary: '' };
        // this.configuration_overview =
        //   this.summaryData?.configuration_overview ?? { settings_significance: '' };
        this.overall_status = this.summaryData?.summary ?? '';
        // this.recommendations = this.summaryData?.recommendations ?? [];
        // this.executive_summary = this.summaryData?.executive_summary ?? '';
        this.showSummary = true;
        this.adsData = response.Language || [];
        this.extractColumns();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        console.error('Error loading ads data:', err);
      }
    });
  }

  extractColumns(): void {
    if (this.adsData.length > 0) {
      this.columns = Object.keys(this.adsData[0]);
    }
  }

  exportToExcel(): void {
    if (this.adsData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Flatten adsData → only the .raw or .display values
      const flatData = this.adsData.map(row => {
        const newRow: any = {};
        for (const key of Object.keys(row)) {
          // prefer raw, fallback to display
          const cell = row[key];
          if (cell && typeof cell === 'object') {
            newRow[key] = cell.raw ?? cell.display ?? '';
          } else {
            newRow[key] = cell ?? '';
          }
        }
        return newRow;
      });

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatData);

      XLSX.utils.book_append_sheet(wb, ws, 'Language Settings');

      const fileName = `language-settings-${this.getCurrentDate()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel');
    }
  }


  trackByIndex(i: number) { return i; }
  trackByCol(_i: number, col: string) { return col; }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatCellData(data: any): string {
    if (data.display === null || data.display === undefined) {
      return '';
    }
    if (typeof data.display === 'object') {
      return JSON.stringify(data.display);
    }
    return String(data.display);
  }

  refreshData(): void {
    this.loadAdsData();
  }
}

