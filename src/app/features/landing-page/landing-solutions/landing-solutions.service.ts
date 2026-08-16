import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SolutionGroup } from './landing-solutions.data';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LandingSolutionsService {
  private http = inject(HttpClient);
  
  private readonly SUPABASE_STORAGE_BASE = `${environment.supabase.url}/storage/v1/object/public/landing-assets/Solutions/`;

  /**
   * Fetch Solutions from API endpoint (mocked via local JSON).
   */
  getSolutions(): Observable<SolutionGroup[]> {
    return this.http.get<any[]>('/assets/api/landing-solutions.json').pipe(
      map(groups => groups.map(group => ({
        ...group,
        items: group.items.map((item: any) => ({
          ...item,
          // Construct the full URL dynamically based on the environment
          mockupUrl: `${this.SUPABASE_STORAGE_BASE}${item.imageName}`
        }))
      })))
    );
  }
}
