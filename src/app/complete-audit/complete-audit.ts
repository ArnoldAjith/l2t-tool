import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complete-audit',
  imports: [CommonModule],
  templateUrl: './complete-audit.html',
  styleUrls: ['./complete-audit.css'] 
})
export class CompleteAudit implements OnInit {  

  isSidebarOpen = false;
  dataSource: string = 'google';
  uploadedFilesCount = 0;
  completeAuditFilesCount = 0;
  availableChecksCount = 0;

  constructor() {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  onDataSourceChange(value: string) {
    this.dataSource = value;
  }

  runAudit() {
    console.log('Running audit...');
  }

  logout() {
    console.log('Logout clicked');
  }
}
