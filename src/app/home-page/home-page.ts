import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../api';
import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';


// Helper: decode entities + strip tags
function decodeToPlainText(html: string): string {
  if (!html) return '';
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
  }
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_: any, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_: any, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],           // ⟵ remove StripHtmlPipe (not used)
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('mainCol') mainCol!: ElementRef<HTMLElement>;
  @ViewChild('sidebarCol') sidebarCol!: ElementRef<HTMLElement>;

  private ro?: ResizeObserver;
  private syncSidebarHeight = () => {
    if (!this.mainCol || !this.sidebarCol) return;

    const isMobile = window.matchMedia('(max-width: 992px)').matches;
    const sidebar = this.sidebarCol.nativeElement;

    if (isMobile) {
      sidebar.style.height = '';   // let it flow on mobile
      return;
    }

    const mainH = Math.ceil(this.mainCol.nativeElement.getBoundingClientRect().height);
    sidebar.style.height = `${mainH}px`;   // clamp sidebar to main's height
  };

  ngAfterViewInit() {
    this.ro = new ResizeObserver(this.syncSidebarHeight);
    this.ro.observe(this.mainCol.nativeElement);
    window.addEventListener('resize', this.syncSidebarHeight);

    // initial call (after DOM painted)
    setTimeout(this.syncSidebarHeight, 0);
  }

  ngOnDestroy() {
    this.ro?.disconnect();
    window.removeEventListener('resize', this.syncSidebarHeight);
  }

  feedData: any[] = [];

  constructor(private router: Router, private api: Api) { }

  login() {
    this.router.navigate(['/login']);
  }

  private toTime(v: unknown): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const t = new Date(String(v ?? '')).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  ngOnInit(): void {
    // use callback-style subscribe to avoid the overload confusion
    this.api.getFeedData().subscribe(
      (items) => {
        console.log(items);
        const sorted = (items ?? []).sort(
          (a: any, b: any) => this.toTime(b['Published Date']) - this.toTime(a['Published Date'])
        );

        this.feedData = sorted.map((it: any) => ({
          ...it,
          cleanDescription: decodeToPlainText(it?.Description ?? ''),
          cleanTitle: decodeToPlainText(it?.Title ?? ''),
        }));
      },
      (err) => console.error('Feed error:', err)
    );
  }

  trackByLink = (_: number, item: any) => item?.Link || _;
}
