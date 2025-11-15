import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-zero-active-ad-group',
  imports: [CommonModule],
  templateUrl: './zero-active-ad-group.html',
  styleUrl: './zero-active-ad-group.css'
})
export class ZeroActiveAdGroup implements OnInit {

  constructor(private api: Api) { }

  adsData: any[] = [];
  loading: boolean = false;
  error: string = '';

  columns: string[] = [];
  showSummary = false;
  UniqueAccountName: any;
  UniqueAdgroupName: any;
  tableData: any;
  noOfuniqueCampaign: string = '';

  ngOnInit(): void {
    this.loadAdsData();
  }

  loadAdsData(): void {
    this.loading = true;
    this.error = '';

    const fileName = "zeroActive";
    const sheetName = "ZeroactiveAdGroup";

    this.api.getScriptData(fileName, sheetName).subscribe({
      next: (response) => {
        // assign full ads data object
        this.adsData = response.ZeroactiveAdGroup || [];

        // compute unique campaign IDs
        this.noOfuniqueCampaign = Intl.NumberFormat("en-US").format(this.getUniqueCampaignCount(this.adsData));
        console.log('Unique Campaign Count:', this.noOfuniqueCampaign);

        // summary data from backend
        this.UniqueAccountName = Intl.NumberFormat("en-US").format(response.summaryData.summary.rawData.unique_accounnts);
        this.UniqueAdgroupName = response.summaryData.summary.rawData.unique_adgroups;
        this.tableData = response.summaryData.summary.rawData.tableData;

        this.extractColumns();
        this.loading = false;
        this.showSummary = true;


      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        console.error('Error loading ads data:', err);
      }
    });
  }

  private getUniqueCampaignCount(data: any[]): number {
    if (!Array.isArray(data) || data.length === 0) return 0;

    const ids = data
      .map(row => row["Campaign ID"]?.raw ?? row["Campaign ID"]?.display ?? null)
      .filter(id => id !== null && id !== undefined && id !== "");

    return new Set(ids).size;
  }


  trackByAccount(index: number, row: any): any {
    return row.accountId || index;
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

    XLSX.utils.book_append_sheet(wb, ws, 'Zero Active Ad Group');

    const fileName = `zero-active-ad-groups-${this.getCurrentDate()}.xlsx`;
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
    if (typeof data.raw === 'object') {
      return JSON.stringify(data.raw);
    }
    return String(data.raw);
  }

  refreshData(): void {
    this.loadAdsData();
  }
}