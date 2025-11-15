import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-alert-when-active-campaign-budget',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './alert-when-active-campaign-budget.html',
  styleUrl: './alert-when-active-campaign-budget.css'
})
export class AlertWhenActiveCampaignBudget implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';

  columns: string[] = [];
  showSummary = false;
  summaryData: any;
  account_analysis: any;
  budget_alert_overview: any;
  campaign_analysis: any;
  overall_status = '';
  recommendations: any;

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "CampaignSettings";
    const sheetName = "Alert when Active Campaign budg";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.summaryData = response.summaryData;
        console.log(this.summaryData);
        this.overall_status = this.summaryData.summary;
        this.adsData = response.Alert_when_Active_Campaign_budg || [];
        this.extractColumns();
        this.loading = false;
        this.showSummary = true;
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
  
      XLSX.utils.book_append_sheet(wb, ws, 'Campaign Budget');
  
      const fileName = `campaign-budget-${this.getCurrentDate()}.xlsx`;
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


