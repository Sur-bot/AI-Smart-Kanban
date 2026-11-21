import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { SolutionGroup } from './landing-solutions.data';
import { APP_CONFIG } from '@core/config/app-config.token';

@Injectable({
  providedIn: 'root',
})
export class LandingSolutionsService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly appConfig = inject(APP_CONFIG);

  private readonly SUPABASE_STORAGE_BASE = `${this.appConfig.supabase.url}/storage/v1/object/public/landing-assets/Solutions/`;
  private solutionsCache$?: Observable<SolutionGroup[]>;

  constructor() {
    this.ensureStoragePreconnect();
  }

  private ensureStoragePreconnect(): void {
    const origin = this.appConfig.supabase?.url;
    if (!origin || !this.document?.head) return;

    const selector = `link[rel="preconnect"][href="${origin}"]`;
    if (this.document.head.querySelector(selector)) return;

    const preconnect = this.document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = origin;
    preconnect.crossOrigin = 'anonymous';
    this.document.head.appendChild(preconnect);

    const dnsPrefetch = this.document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = origin;
    this.document.head.appendChild(dnsPrefetch);
  }

  getSolutions(): Observable<SolutionGroup[]> {
    if (!this.solutionsCache$) {
      this.solutionsCache$ = this.http.get<any[]>('/assets/api/landing-solutions.json').pipe(
        map(groups =>
          groups.map(group => ({
            ...group,
            items: group.items.map((item: any) => ({
              ...item,
              mockupUrl: `${this.SUPABASE_STORAGE_BASE}${item.imageName}`,
            })),
          }))
        ),
        shareReplay(1)
      );
    }
    return this.solutionsCache$;
  }
}
