import { Injectable, inject, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap, catchError, throwError, of, tap } from 'rxjs';
import { ImageFile, StorageQuota } from '../models/image.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private supabaseUrl = environment.supabase.url;
  private supabaseAnonKey = environment.supabase.anonKey;
  private bucketName = 'ai-kanban-storage';
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  private readonly imagesSubject = new BehaviorSubject<ImageFile[]>([]);
  readonly images$: Observable<ImageFile[]> = this.imagesSubject.asObservable();

  private readonly quotaSubject = new BehaviorSubject<StorageQuota | null>(null);
  readonly quota$: Observable<StorageQuota | null> = this.quotaSubject.asObservable();

  constructor() {
    effect(() => {
      const user = this.authService.user();
      const isGuest = this.authService.isGuestMode();
      if (!user && !isGuest) { this.clearState(); }
    });
  }

  private clearState(): void {
    this.imagesSubject.next([]);
    this.quotaSubject.next(null);
  }

  initCredentials(url: string, anonKey: string, bucket = 'ai-kanban-storage'): void {
    this.supabaseUrl = url.replace(/\/$/, '');
    this.supabaseAnonKey = anonKey;
    this.bucketName = bucket;
    this.loadImages();
    this.loadQuota();
  }

  private getHeaders(): HttpHeaders {
    const userToken = this.authService.accessToken();
    return new HttpHeaders({
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${userToken ?? this.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    });
  }

  loadQuota(): void {
    const userId = this.authService.user()?.id;
    if (this.authService.isGuestMode() || !userId) {
      const cur = this.imagesSubject.value;
      const used = cur.reduce((s, i) => s + i.size, 0);
      const quota = 524288000;
      this.quotaSubject.next({ userId: 'guest', usedBytes: used, quotaBytes: quota, fileCount: cur.length,
        percentageUsed: Math.min(100, Math.round((used / quota) * 100)), availableBytes: Math.max(0, quota - used),
        isFull: used >= quota, updatedAt: new Date().toISOString() });
      return;
    }
    this.http.get<StorageQuota>(`${this.apiUrl}/storage/quota`).pipe(
      catchError(err => {
        console.warn('[SupabaseStorage] Quota fallback:', err.status);
        const cur = this.imagesSubject.value;
        const used = cur.reduce((s, i) => s + i.size, 0);
        const quota = 524288000;
        return of({ userId, usedBytes: used, quotaBytes: quota, fileCount: cur.length,
          percentageUsed: Math.min(100, Math.round((used / quota) * 100)), availableBytes: Math.max(0, quota - used),
          isFull: used >= quota, updatedAt: new Date().toISOString() });
      })
    ).subscribe(q => this.quotaSubject.next(q));
  }

  loadImages(): void {
    if (this.authService.isGuestMode()) { this.imagesSubject.next([]); this.loadQuota(); return; }
    this.http.get<any[]>(`${this.apiUrl}/storage/files`, { headers: this.getHeaders() }).subscribe({
      next: data => {
        if (data) {
          this.imagesSubject.next(data.map(item => ({
            id: item.id, name: item.original_name,
            url: this.getPublicUrl(item.storage_key),
            thumbnailUrl: item.thumbnail_key ? this.getPublicUrl(item.thumbnail_key) : this.getPublicUrl(item.storage_key),
            size: item.size_bytes, width: item.width || 0, height: item.height || 0,
            format: item.extension, userId: item.user_id, storageKey: item.storage_key,
            thumbnailKey: item.thumbnail_key, uploadedAt: new Date(item.created_at),
            uploadedBy: { name: item.user_id ? 'Tai khoan cua ban' : 'Nguoi dung Supabase' },
          })));
          this.loadQuota();
        }
      },
      error: err => console.error('[Supabase] Load images error:', err.status),
    });
  }

  /**
   * Upload single file. Side-effect-free: no loadQuota(), no process-image call.
   * Caller collects results and calls flushUploadedImages() + batchProcessImages() at end.
   */
  uploadImage(file: File): Observable<ImageFile> {
    const userId = this.authService.user()?.id || null;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileId = crypto.randomUUID();
    const storagePath = `${userId ? 'users/' + userId : 'uploads'}/${new Date().getFullYear()}/${fileId}.${fileExt}`;
    const uploadHeaders = this.getHeaders().set('Content-Type', file.type || 'application/octet-stream');

    return this.http.post(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`, file, { headers: uploadHeaders }).pipe(
      catchError(err => { console.error('[Upload] Storage error:', err.status); return throwError(() => err); }),
      switchMap(() => {
        const payload: Record<string, any> = {
          id: fileId, original_name: file.name, storage_key: storagePath,
          mime_type: file.type || 'image/png', extension: fileExt, size_bytes: file.size,
          hash_sha256: `pending-${fileId}`, status: 'READY',
        };
        if (userId) payload['user_id'] = userId;
        return this.http.post<any[]>(`${this.supabaseUrl}/rest/v1/storage_files`, payload,
          { headers: this.getHeaders().set('Prefer', 'return=representation') }
        ).pipe(catchError(err => { console.error('[Upload] DB error:', err.status); return throwError(() => err); }));
      }),
      map(response => {
        const item = Array.isArray(response) ? response[0] : response;
        return {
          id: item.id || fileId, name: item.original_name || file.name,
          url: this.getPublicUrl(storagePath), thumbnailUrl: this.getPublicUrl(storagePath),
          size: item.size_bytes || file.size, width: 0, height: 0, format: fileExt,
          userId: userId || undefined, storageKey: storagePath,
          uploadedAt: new Date(), uploadedBy: { name: 'Ban' },
        } as ImageFile;
      })
    );
  }

  /** Commit a batch of newly uploaded images to state in one shot + refresh quota. */
  flushUploadedImages(newImages: ImageFile[]): void {
    if (!newImages.length) return;
    this.imagesSubject.next([...newImages, ...this.imagesSubject.value]);
    this.loadQuota();
  }

  /** Queue all completed upload jobs to BullMQ via a single HTTP call (addBulk). */
  batchProcessImages(jobs: { fileId: string; storageKey: string; userId: string | null }[]): void {
    if (!jobs.length) return;
    this.http.post(`${this.apiUrl}/storage/batch-process`, { jobs }).subscribe({
      next: (res: any) => console.log(`[Storage] Batch queued ${res.queued} jobs`),
      error: err => console.error('[Storage] Batch queue error:', err.status),
    });
  }

  deleteImage(id: string): Observable<void> {
    const updatedLocalList = this.imagesSubject.value.filter(img => img.id !== id);
    this.imagesSubject.next(updatedLocalList);
    this.loadQuota();
    return this.http.delete<void>(`${this.apiUrl}/jobs/image/${id}`).pipe(
      tap(() => this.loadQuota()),
      map(() => void 0),
      catchError(err => { console.error('[Delete] error:', err.status); return throwError(() => err); })
    );
  }

  bulkDeleteImages(ids: string[]): Observable<void> {
    const updatedLocalList = this.imagesSubject.value.filter(img => !ids.includes(img.id));
    this.imagesSubject.next(updatedLocalList);
    this.loadQuota();

    const requestOptions = {
      headers: this.getHeaders(),
      body: { ids }
    };

    return this.http.delete<void>(`${this.apiUrl}/jobs/images/bulk`, requestOptions).pipe(
      tap(() => this.loadQuota()),
      map(() => void 0),
      catchError(err => { console.error('[Bulk Delete] error:', err.status); return throwError(() => err); })
    );
  }

  private getPublicUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${path}`;
  }
}
