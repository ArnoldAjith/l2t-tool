import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

interface TabData {
  key: string;
  label: string;
  data: any[];
  columns: string[];
}


@Component({
  selector: 'app-label-checks',
  imports: [CommonModule],
  templateUrl: './label-checks.html',
  styleUrl: './label-checks.css'
})
export class LabelChecks implements OnInit {

  constructor(private api: Api) { }

  loading: boolean = false;
  error: string = '';
  rawResponse: any = {};

  tabs: TabData[] = [];
  activeTab: number = 0;
  // currentTabCount: number = 0;

  get currentTabData(): TabData | null {
    return this.tabs.length > 0 ? this.tabs[this.activeTab] : null;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "LabelChecks";
    const sheetName = "";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
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

  currentTabCount: number = 0;
  noOfunique: number = 0;
  processTabs(response: any): void {
    this.tabs = [];
    Object.keys(response).forEach((key) => {
      const data = Array.isArray(response[key]) ? response[key] : [];
      if (data.length > 0) {
        this.tabs.push({
          key,
          label: this.formatTabLabel(key),
          data,
          columns: Object.keys(data[0] || {})
        });
      }
    });

    this.activeTab = this.tabs.length > 0 ? 0 : -1;
    this.currentTabCount = this.activeTab >= 0 ? this.tabs[this.activeTab].data.length : 0;
    this.noOfunique = this.activeTab >= 0 ? this.getUniqueAccountIdCount(this.tabs[this.activeTab].data) : 0;

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
      this.currentTabCount = this.tabs[index].data.length;
      this.noOfunique = this.getUniqueAccountIdCount(this.tabs[index].data);
    }
  }

  getUniqueAccountIdCount(data: any[]): number {
    if (!Array.isArray(data) || data.length === 0) return 0;

    const normalize = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, "");

    // Detect the "account id" column (handles "Account ID", "accountId", "account_id", etc.)
    const keys = Object.keys(data[0] ?? {});
    const accountKey =
      keys.find(k => {
        const nk = normalize(k);
        return (
          nk === "accountid" ||
          nk === "customerid" ||
          nk === "adwordsid" ||
          (nk.includes("account") && nk.includes("id"))
        );
      }) ?? null;

    if (!accountKey) return 0;

    const extract = (v: any): string => {
      if (v && typeof v === "object") {
        const cand = v.display ?? v.raw ?? v.value ?? v.id;
        return cand != null ? String(cand).trim() : "";
      }
      return v != null ? String(v).trim() : "";
    };

    const ids = data
      .map(row => extract(row?.[accountKey]))
      .filter(Boolean);

    return new Set(ids).size;
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

  // formatCellData(data: any): string {
  //   if (data.display === null || data.display === undefined) {
  //     return '';
  //   }
  //   if (typeof data.display === 'object') {
  //     return JSON.stringify(data.display);
  //   }
  //   return String(data.display);
  // }

  // refreshData(): void {
  //   this.loadData();
  // }

  formatColumnHeader(column: string): string {
    // Replace "Campaign Cost(mtd)" with "Cost(mtd)"
    if (column.toLowerCase() === "campaign cost(mtd)") {
      return "Cost(mtd)";
    }
    return column;
  }

  formatCellData(data: any, column?: string): string {
    if (data == null) return '';

    // If it's an object, extract usable value
    let value: any = (typeof data === 'object')
      ? (data.display ?? data.raw ?? data.value ?? '')
      : data;

    if (value == null) return '';

    // Normalize column name
    const colName = (column ?? '').toLowerCase().replace(/\s+/g, '');

    if (colName.includes("cost(mtd)")) {
      const num = Number(value);
      if (!isNaN(num)) {
        return `$${num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
      return `$${value}`;
    }

    return String(value);
  }



}