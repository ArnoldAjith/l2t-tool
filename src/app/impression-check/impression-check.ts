import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

interface TabData {
  key: string;
  label: string;
  data: any[];
  columns: string[];
}

@Component({
  selector: 'app-impression-check',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './impression-check.html',
  styleUrl: './impression-check.css'
})
export class ImpressionCheck implements OnInit {

  constructor(private api: Api) { }

  loading: boolean = false;
  error: string = '';
  rawResponse: any = {};

  tabs: TabData[] = [];
  activeTab: number = 0;
  summaryData: any;
  account_analysis: any;
  campaign_analysis: any;
  impression_issue_overview: any;
  overall_status = '';
  recommendations: any;
  showSummary = false;

  // Current active tab data (for easier template access)
  get currentTabData(): TabData | null {
    return this.tabs.length > 0 ? this.tabs[this.activeTab] : null;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "ImpressionCheck";
    const sheetName = "";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log('Full Response:', response);
        this.summaryData = response?.summaryData ?? {};

        // FIX: correct property names and add safe fallbacks
        // this.account_analysis = this.summaryData?.account_analysis ?? { summary: '', unique_accounts: 0 };
        // this.campaign_analysis = this.summaryData?.campaign_analysis ?? { summary: '', unique_campaigns: 0 };
        // this.impression_issue_overview = this.summaryData?.impression_issue_overview ?? {
        //   campaigns_per_account: 0,
        //   issue_significance: ''
        // };
        this.overall_status = this.summaryData?.summary ?? '';
        // this.recommendations = this.summaryData?.recommendations ?? [];

        this.showSummary = true;
        this.rawResponse = response;
        this.processTabs(response);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        console.error('Error loading data:', err);
      }
    });
  }

  trackByIndex(i: number) { return i; }
  processTabs(response: any): void {
    this.tabs = [];

    // Process each key in the response
    Object.keys(response).forEach((key, index) => {
      const data = Array.isArray(response[key]) ? response[key] : [];

      if (data.length > 0) {
        const tabData: TabData = {
          key: key,
          label: this.formatTabLabel(key),
          data: data,
          columns: Object.keys(data[0] || {})
        };
        this.tabs.push(tabData);
      }
    });

    // Set first tab as active if available
    this.activeTab = this.tabs.length > 0 ? 0 : -1;

    console.log('Processed Tabs:', this.tabs);
  }

  formatTabLabel(key: string): string {
    // Convert camelCase or snake_case to readable format
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim();
  }

  setActiveTab(index: number): void {
    if (index >= 0 && index < this.tabs.length) {
      this.activeTab = index;
    }
  }

  exportToExcel(): void {
    const currentTab = this.currentTabData;
    if (!currentTab || currentTab.data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(currentTab.data);

      XLSX.utils.book_append_sheet(wb, ws, currentTab.label);

      const fileName = `${currentTab.key.toLowerCase()}-${this.getCurrentDate()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel');
    }
  }

  exportAllToExcel(): void {
    if (this.tabs.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      this.tabs.forEach(tab => {
        if (tab.data.length > 0) {
          const flatData = tab.data.map(row => {
            const newRow: any = {};
            for (const key of Object.keys(row)) {
              const cell = row[key];
              if (cell && typeof cell === 'object') {
                newRow[key] = cell.display ?? cell.raw ?? '';
              } else {
                newRow[key] = cell ?? '';
              }
            }
            return newRow;
          });

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatData);
          XLSX.utils.book_append_sheet(wb, ws, tab.label.substring(0, 31));
        }
      });

      const fileName = `all-data-${this.getCurrentDate()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('All data exported successfully');
    } catch (error) {
      console.error('Error exporting all data to Excel:', error);
      alert('Error exporting data to Excel');
    }
  }

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
    this.loadData();
  }
}