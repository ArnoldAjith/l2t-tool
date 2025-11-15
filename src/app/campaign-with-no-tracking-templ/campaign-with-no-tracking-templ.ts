import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-campaign-with-no-tracking-templ',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './campaign-with-no-tracking-templ.html',
  styleUrl: './campaign-with-no-tracking-templ.css'
})
export class CampaignWithNoTrackingTempl implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';

  columns: string[] = [];

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "CampaignSettings";
    const sheetName = "Campaign With no tracking templ";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.adsData = response.Campaign_With_no_tracking_templ || [];
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
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.adsData);

      XLSX.utils.book_append_sheet(wb, ws, 'Campaign With no tracking templ');

      const fileName = `Campaign-With-no-tracking-templ-${this.getCurrentDate()}.xlsx`;

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

