import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './system-logs.html',
  styleUrls: ['./system-logs.css']
})
export class SystemLogs {
  constructor(private http: HttpClient) {}

  mode: 'single' | 'range' = 'single';
  selectedDate: Date | null = null;
  selectedRange = { start: null as Date | null, end: null as Date | null };

  logsData: any[] = [];
  filteredData: any[] = [];
  searchTerm: string = '';

  displayedColumns: string[] = ['UserName', 'MailId', 'LoginDate', 'LogoutDate', 'SessionHours'];

  // ✅ Fetch single date logs
  onDateSelected(date: Date | null): void {
    if (!date) return;
    const apiUrl = 'https://datteamwork.com:8060/login/monitoring';
    // const apiUrl = 'https://datteamwork.com:8060/login/monitoring';
    const payload = { startDate: date };
    console.log('📅 Selected Date:', payload);

    this.http.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        this.logsData = res.map((item: any) => this.formatLog(item));
        this.filteredData = this.logsData;
      },
      error: (err) => console.error('❌ Error:', err)
    });
  }

  // ✅ Fetch range logs
  onRangeSelected(): void {
    if (this.selectedRange.start && this.selectedRange.end) {
      const apiUrl = 'https://datteamwork.com:8060/login/monitoring';
      // const apiUrl = 'http://localhost:8080/login/monitoring';
      const payload = {
        startDate: this.selectedRange.start,
        endDate: this.selectedRange.end
      };
      console.log('📆 Sending Range:', payload);

      this.http.post(apiUrl, payload).subscribe({
        next: (res: any) => {
          this.logsData = res.map((item: any) => this.formatLog(item));
          this.filteredData = this.logsData;
        },
        error: (err) => console.error('❌ Range Error:', err)
      });
    } else {
      console.warn('⚠️ Please select both start and end dates');
    }
  }

  // ✅ Convert backend date array to readable string
  formatLog(item: any) {
    const convertDate = (arr: number[]) => {
      if (!arr) return '-';
      const d = new Date(
        arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5], Math.floor(arr[6] / 1000000)
      );
      return d.toLocaleString();
    };
    return {
      ...item,
      LoginDate: convertDate(item.LoginDate),
      LogoutDate: convertDate(item.LogoutDate)
    };
  }

  // ✅ Filter table by username/mail
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.logsData.filter(
      (log) =>
        log.UserName.toLowerCase().includes(term) ||
        log.MailId.toLowerCase().includes(term)
    );
  }

  // ✅ Toggle single/range mode
  onModeChange(mode: 'single' | 'range'): void {
    this.mode = mode;
    console.log('🟢 Mode changed to:', mode);
  }
}
