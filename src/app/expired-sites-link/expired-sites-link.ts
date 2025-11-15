import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

type TopAccount = { account_name: string; expired_sitelinks: number };


@Component({
  selector: 'app-expired-sites-link',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './expired-sites-link.html',
  styleUrl: './expired-sites-link.css'
})
export class ExpiredSitesLink implements OnInit {

  constructor(private api: Api) { }
  
  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';
  
  columns: string[] = [];
  summaryData: any;
  unique_account_analysis: any;
  total_sitelinks_analysis: any;
  top_accounts_analysis: any;
  impact_assessment: any;
  llm_recommendations='';
  showSummary = false;

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';
    
    const fileName = "ExpiredSitelinks";
    const sheetName = "expiredsitelinks";
    
    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.summaryData = response.summaryData;

        this.unique_account_analysis = this.summaryData.no_account.unique_accounts;
        this.total_sitelinks_analysis = this.summaryData.expired_sitelink;
        this.top_accounts_analysis = this.summaryData.no_account.top_3_sites;
        console.log('Top Accounts Analysis:', this.top_accounts_analysis);
        
        // this.impact_assessment = this.summaryData.impact_assessment;
        // this.llm_recommendations = this.summaryData.llm_recommendations;
        this.adsData = response.ExpiredSitelinks || [];
        this.showSummary = true;
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

    trackByAccount(_i: number, row: TopAccount) { return row.account_name; }

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
    
        XLSX.utils.book_append_sheet(wb, ws, 'Expired Site Links');
    
        const fileName = `expired-sitelinks-${this.getCurrentDate()}.xlsx`;
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
