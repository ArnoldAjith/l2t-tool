import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Dashboard],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  constructor(private router: Router) {}

  activeTab: string = 'Automation Tools';
  isProfileDropdownOpen: boolean = false;
  username: string | null = null;

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username');

    if (!this.username) {
      setTimeout(() => {
        this.username = sessionStorage.getItem('username');
        if (!this.username) {
          this.router.navigate(['/login']);
        }
      }, 200);
    }
  }
}
