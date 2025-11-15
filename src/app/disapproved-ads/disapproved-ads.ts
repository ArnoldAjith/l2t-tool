import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-disapproved-ads',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './disapproved-ads.html',
  styleUrl: './disapproved-ads.css'
})
export class DisapprovedAds implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';
  noOfUniqueAccount: string = '';
  disapprovedAccount: string = '';

  columns: string[] = [];

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "DisapprovedAds";
    const sheetName = "disapproved ads";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.adsData = response.Disapproved_Ads || [];
        this.noOfUniqueAccount = this.getUniqueAccountCount(this.adsData);
        this.disapprovedAccount = Intl.NumberFormat("en-US").format(this.adsData.length);
        this.extractColumns();
        this.loading = false;
        console.log('Ads Data:', this.adsData);
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
  
      XLSX.utils.book_append_sheet(wb, ws, 'Disapproved Ads');
  
      const fileName = `disapproved-ads-${this.getCurrentDate()}.xlsx`;
      XLSX.writeFile(wb, fileName);
  
      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel');
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatCellData(data: any): string {
    if (data.raw === null || data.raw === undefined) {
      return '';
    }
    if (typeof data.display === 'object') {
      return JSON.stringify(data.raw);
    }
    return String(data.raw);
  }

  refreshData(): void {
    this.loadAdsData();
  }

  private findAccountIdKey(rows: any[]): string | null {
    if (!rows?.length) return null;
    const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
    const keys = Object.keys(rows[0] ?? {});
    // common variants
    const wanted = new Set(['accountid', 'customerid', 'adwordsid']);
    for (const k of keys) {
      const nk = normalize(k);
      if (wanted.has(nk) || (nk.includes('account') && nk.includes('id'))) return k;
    }
    return null;
  }

  private unwrapCell(v: any): string {
    if (v && typeof v === 'object') {
      const cand = v.raw ?? v.display ?? v.value ?? v.id;
      return cand != null ? String(cand).trim() : '';
    }
    return v != null ? String(v).trim() : '';
  }

 private getUniqueAccountCount(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return "0";
  const key = this.findAccountIdKey(rows);
  if (!key) return "0";

  const ids = rows.map(r => this.unwrapCell(r?.[key])).filter(Boolean);
  const count = new Set(ids).size;
  return new Intl.NumberFormat("en-US").format(count);
}


}
