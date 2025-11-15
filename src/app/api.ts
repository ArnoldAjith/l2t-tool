import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorSummary {
  Error: string;
  ErrorCount: number;
  summary?: string;
}

export interface FeedItem {
  title: string;
  link: string;
  publishedDate?: string;
  author?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
  constructor(private http: HttpClient) { }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  /** Upload for AdcopyCheck */
  uploadAdcopyAndMaster(files: File[], uploadUrl: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<any>(uploadUrl, formData, {
      observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  /** Upload for Incentive Tool */
  uploadIncentiveFiles(files: File[], fileType: 'single' | 'multiple'): Observable<any> {
    const formData = new FormData();
    // const endpoint = fileType === 'single'
    //   ? 'http://localhost:8063/upload'
    //   : 'http://localhost:8063/uploads';
const endpoint = fileType === 'single'
      ? 'https://datteamwork.com:8063/upload'
      : 'https://datteamwork.com:8063/uploads';


    files.forEach(file => formData.append('files', file));
    return this.http.post<any>(endpoint, formData, {
      observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  uploadUrlChekerFiles(files: File[], fileType: 'single' | 'multiple'): Observable<any> {
    const formData = new FormData();
    const endpoint = fileType === 'single'
      ? 'http://localhost:8080/upload'
      : 'http://localhost:8080/uploads';

    files.forEach(file => formData.append('files', file));
    return this.http.post<any>(endpoint, formData, {
      observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  downloadIncentiveZip(): Observable<Blob> {
    return this.http.get('http://localhost:8080/download-zip', {
      responseType: 'blob'
    });
  }

  getFeedData(): Observable<FeedItem[]> {
    // return this.http.get<FeedItem[]>('http://localhost:8080/rss/rss-feed').pipe(
    //   catchError(this.handleError)
    // );
    return this.http.get<FeedItem[]>('https://datteamwork.com:8060/rss/rss-feed').pipe(
      catchError(this.handleError)
    );
    // return this.http.get<FeedItem[]>('https://tagbees.com:8060/rss/rss-feed').pipe(
    //   catchError(this.handleError)
    // );
  }

  getScriptData(spreadSheet: string, sheetName: string): Observable<any> {
    // return this.http.get<any>(`http://localhost:8080/export/fetchSheet?spreadSheet=${spreadSheet}&sheetName=${sheetName}`, {
    //   responseType: 'json'
    // })
    return this.http.get<any>(`https://datteamwork.com:8060/export/fetchSheet?spreadSheet=${spreadSheet}&sheetName=${sheetName}`, {
      responseType: 'json'
    })
    // return this.http.get<any>(`https://tagbees.com:8080/export/fetchSheet?spreadSheet=${spreadSheet}&sheetName=${sheetName}`, {
    //   responseType: 'json'
    // })
  }

   getAdcopySummary(): Observable<{ returnList: ErrorSummary[]; records_with_errors: number }> {
    // return this.http.get<{ returnList: ErrorSummary[]; records_with_errors: number }>(
    //   `http://localhost:8080/export/dsrSummary`,
    //   { responseType: 'json' as const }
    // );
    return this.http.get<any>(`https://datteamwork.com:8060/export/dsrSummary`, {
      responseType: 'json' as const
    })
    
  }

  customPost<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body, {
      observe: 'body'
    }).pipe(catchError(this.handleError));
  }
}
