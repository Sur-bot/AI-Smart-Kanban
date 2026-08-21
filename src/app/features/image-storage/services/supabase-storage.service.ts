import { Injectable, inject } from '@angular/core';
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

  /**
   * Cập nhật thông tin Supabase Credentials động
   */
  initCredentials(url: string, anonKey: string, bucket = 'ai-kanban-storage'): void {
    this.supabaseUrl = url.replace(/\/$/, '');
    this.supabaseAnonKey = anonKey;
    this.bucketName = bucket;
    this.loadImages();
    this.loadQuota();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Lấy thông tin hạn mức dung lượng từ Backend hoặc tự tính toán
   */
  loadQuota(): void {
    const userId = this.authService.user()?.id;
    if (this.authService.isGuestMode() || !userId) {
      // Chế độ khách (Mock Quota 500 MB)
      const currentImages = this.imagesSubject.value;
      const usedBytes = currentImages.reduce((sum, img) => sum + img.size, 0);
      const quotaBytes = 524288000; // 500 MB
      this.quotaSubject.next({
        userId: 'guest',
        usedBytes,
        quotaBytes,
        fileCount: currentImages.length,
        percentageUsed: Math.min(100, Math.round((usedBytes / quotaBytes) * 100)),
        availableBytes: Math.max(0, quotaBytes - usedBytes),
        isFull: usedBytes >= quotaBytes,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    this.http.get<StorageQuota>(`${this.apiUrl}/storage/quota`).pipe(
      catchError(err => {
        console.warn('[SupabaseStorage] Không thể tải quota từ backend, tự tính toán từ local list:', err.status);
        const currentImages = this.imagesSubject.value;
        const usedBytes = currentImages.reduce((sum, img) => sum + img.size, 0);
        const quotaBytes = 524288000;
        return of({
          userId,
          usedBytes,
          quotaBytes,
          fileCount: currentImages.length,
          percentageUsed: Math.min(100, Math.round((usedBytes / quotaBytes) * 100)),
          availableBytes: Math.max(0, quotaBytes - usedBytes),
          isFull: usedBytes >= quotaBytes,
          updatedAt: new Date().toISOString()
        });
      })
    ).subscribe(quota => {
      this.quotaSubject.next(quota);
    });
  }

  /**
   * 1. Tải danh sách ảnh từ Supabase Database (REST API)
   */
  loadImages(): void {
    const userId = this.authService.user()?.id;
    let url = `${this.supabaseUrl}/rest/v1/storage_files?is_deleted=eq.false&order=created_at.desc`;
    if (userId && !this.authService.isGuestMode()) {
      url += `&user_id=eq.${userId}`;
    }

    this.http.get<any[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        if (data) {
          const mapped: ImageFile[] = data.map((item: any) => ({
            id: item.id,
            name: item.original_name,
            url: this.getPublicUrl(item.storage_key),
            thumbnailUrl: item.thumbnail_key ? this.getPublicUrl(item.thumbnail_key) : this.getPublicUrl(item.storage_key),
            size: item.size_bytes,
            width: item.width || 0,
            height: item.height || 0,
            format: item.extension,
            userId: item.user_id,
            storageKey: item.storage_key,
            thumbnailKey: item.thumbnail_key,
            uploadedAt: new Date(item.created_at),
            uploadedBy: { name: item.user_id ? 'Tài khoản của bạn' : 'Người dùng Supabase' },
          }));
          this.imagesSubject.next(mapped);
          this.loadQuota();
        }
      },
      error: (err) => {
        console.error('[Supabase] Lỗi tải danh sách ảnh:', err.status, err.statusText);
      },
    });
  }

  /**
   * 2. Upload file lên Supabase Storage & Chèn metadata vào bảng storage_files
   */
  uploadImage(file: File): Observable<ImageFile> {
    const userId = this.authService.user()?.id || null;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileId = crypto.randomUUID();
    const userFolder = userId ? `users/${userId}` : 'uploads';
    const storagePath = `${userFolder}/${new Date().getFullYear()}/${fileId}.${fileExt}`;

    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`;
    const uploadHeaders = this.getHeaders().set('Content-Type', file.type || 'application/octet-stream');

    return this.http.post(uploadUrl, file, { headers: uploadHeaders }).pipe(
      catchError(err => {
        console.error('[Upload] Lỗi tải file lên Storage:', err.status);
        return throwError(() => err);
      }),
      switchMap((storageRes) => {
        const dbUrl = `${this.supabaseUrl}/rest/v1/storage_files`;
        const payload: Record<string, any> = {
          id: fileId,
          original_name: file.name,
          storage_key: storagePath,
          mime_type: file.type || 'image/png',
          extension: fileExt,
          size_bytes: file.size,
          hash_sha256: fileId,
          status: 'READY',
        };

        if (userId) {
          payload['user_id'] = userId;
        }

        const dbHeaders = this.getHeaders().set('Prefer', 'return=representation');
        return this.http.post<any[]>(dbUrl, payload, { headers: dbHeaders }).pipe(
          catchError(dbErr => {
            console.error('[Upload] Lỗi chèn metadata vào DB:', dbErr.status);
            return throwError(() => dbErr);
          })
        );
      }),
      map((response) => {
        const item = Array.isArray(response) ? response[0] : response;
        const newImage: ImageFile = {
          id: item.id || fileId,
          name: item.original_name || file.name,
          url: this.getPublicUrl(storagePath),
          thumbnailUrl: this.getPublicUrl(storagePath),
          size: item.size_bytes || file.size,
          width: 0,
          height: 0,
          format: fileExt,
          userId: userId || undefined,
          storageKey: storagePath,
          uploadedAt: new Date(),
          uploadedBy: { name: 'Bạn' },
        };

        this.imagesSubject.next([newImage, ...this.imagesSubject.value]);
        this.loadQuota();

        // Gửi yêu cầu đến Backend Worker để nén WebP và tạo Thumbnail
        this.http.post(`${this.apiUrl}/jobs/process-image`, {
          fileId: fileId,
          storageKey: storagePath,
          userId: userId
        }).subscribe({
          next: () => {
            // Sau khi worker xử lý xong, refresh lại quota
            setTimeout(() => this.loadQuota(), 2000);
          },
          error: (err) => console.error('[Backend] Worker không phản hồi:', err.status)
        });

        return newImage;
      })
    );
  }

  /**
   * 3. Xóa ảnh (Soft Delete DB + Xóa file Storage Bucket + Giảm Quota)
   */
  deleteImage(id: string): Observable<void> {
    // Xóa ngay khỏi danh sách giao diện
    const updatedLocalList = this.imagesSubject.value.filter(img => img.id !== id);
    this.imagesSubject.next(updatedLocalList);
    this.loadQuota();

    return this.http.delete<void>(`${this.apiUrl}/jobs/image/${id}`).pipe(
      tap(() => this.loadQuota()),
      map(() => void 0),
      catchError(err => {
        console.error('[Delete] Lỗi xóa ảnh:', err.status);
        return throwError(() => err);
      })
    );
  }

  /** Lấy Public Storage URL */
  private getPublicUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${path}`;
  }
}

