import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, KeyValue } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-conversion-check',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './conversion-check.html',
  styleUrl: './conversion-check.css'
})
export class ConversionCheck implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';

  columns: string[] = [];
  showSummary = false;
  summaryData: any;
  totalRecords: any;
  criticalrecord: any;
  successrecord: any;
  recommendations: any;
  nonPerforming: any;
  performaing: any;
  performationDistribution: any;

  private order = ['< -100%', '-80% to -100%', '-50% to -80%', '-20% to -50%', '0% to -20%'];
  keyCompare = (a: KeyValue<string, number>, b: KeyValue<string, number>): number =>
    this.order.indexOf(a.key) - this.order.indexOf(b.key);

  get totalAccountsForNonPerforming(): number {
    const vals = Object.values(this.nonPerforming || {});
    return vals.reduce((sum: number, v) => sum + (Number(v) || 0), 0);
  }

  get totalAccountsofPerforming(): number {
    const vals = Object.values(this.performaing || {});
    return vals.reduce((sum: number, v) => sum + (Number(v) || 0), 0);
  }

  ngOnInit(): void {
    this.loadAdsData();

  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "ConversionCheck";
    const sheetName = "output";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.summaryData = response.summaryData;
        console.log(this.summaryData);
        this.totalRecords = this.summaryData.summary;
        this.criticalrecord = this.summaryData.data.critical_attention_needed;
        this.successrecord = this.summaryData.data.performance_distribution;
        this.performationDistribution = this.summaryData.data.success_stories;
        this.nonPerforming = this.summaryData.data.nonPerforming;
        this.performaing = this.summaryData.data.performing;
        // this.criticalrecord = response.criticalrecord;
        // this.successrecord = response.successrecord;
        // this.performationDistribution = response.performationDistribution;
        this.adsData = response.Alert_when_Active_Campaign_budg || [];
        this.extractColumns();
        this.loading = false;
        this.showSummary = true;
        this.adsData = response.Output || [];
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

  trackByIndex(i: number) { return i; }

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
  
      XLSX.utils.book_append_sheet(wb, ws, 'Conversion Check');
  
      const fileName = `converion-check-${this.getCurrentDate()}.xlsx`;
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

