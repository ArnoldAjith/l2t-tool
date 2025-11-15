import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-wow-conversion',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './wow-conversion.html',
  styleUrl: './wow-conversion.css'
})
export class WowConversion implements OnInit {

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
    
    const fileName = "WOWConversion";
    const sheetName = "WOWConversion_gte_5";
    
    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        console.log(response);
        this.adsData = response.WOWConversion_gte_5 || [];
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
      
      XLSX.utils.book_append_sheet(wb, ws, 'WoW Conversion');
      
      const fileName = `wow-conversion-${this.getCurrentDate()}.xlsx`;
      
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