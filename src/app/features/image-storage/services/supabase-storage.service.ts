import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap, catchError, throwError, of } from 'rxjs';
import { ImageFile } from '../models/image.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private supabaseUrl = environment.supabase.url;
  private supabaseAnonKey = environment.supabase.anonKey;
  private bucketName = 'ai-kanban-storage';

  private readonly imagesSubject = new BehaviorSubject<ImageFile[]>([]);
  readonly images$: Observable<ImageFile[]> = this.imagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Cập nhật thông tin Supabase Credentials động
   */
  initCredentials(url: string, anonKey: string, bucket = 'ai-kanban-storage'): void {
    this.supabaseUrl = url.replace(/\/$/, '');
    this.supabaseAnonKey = anonKey;
    this.bucketName = bucket;
    this.loadImages();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * 1. Tải danh sách ảnh từ Supabase Database (REST API)
   */
  loadImages(): void {
    const url = `${this.supabaseUrl}/rest/v1/storage_files?is_deleted=eq.false&order=created_at.desc`;

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
            uploadedAt: new Date(item.created_at),
            uploadedBy: { name: 'Người dùng Supabase' },
          }));
          this.imagesSubject.next(mapped);
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
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileId = crypto.randomUUID();
    const storagePath = `uploads/${new Date().getFullYear()}/${fileId}.${fileExt}`;

    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`;
    const uploadHeaders = this.getHeaders().set('Content-Type', file.type || 'application/octet-stream');

    return this.http.post(uploadUrl, file, { headers: uploadHeaders }).pipe(
      catchError(err => {
        console.error('[Upload] Lỗi tải file lên Storage:', err.status);
        return throwError(() => err);
      }),
      switchMap((storageRes) => {
        const dbUrl = `${this.supabaseUrl}/rest/v1/storage_files`;
        const payload = {
          id: fileId,
          original_name: file.name,
          storage_key: storagePath,
          mime_type: file.type || 'image/png',
          extension: fileExt,
          size_bytes: file.size,
          hash_sha256: fileId,
          status: 'READY',
        };

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
          uploadedAt: new Date(),
          uploadedBy: { name: 'Bạn' },
        };

        this.imagesSubject.next([newImage, ...this.imagesSubject.value]);

        // Gửi yêu cầu đến Backend Worker (Fire and forget)
        this.http.post('http://localhost:3000/api/jobs/process-image', {
          fileId: fileId,
          storageKey: storagePath
        }).subscribe({
          error: (err) => console.error('[Backend] Worker không phản hồi:', err.status)
        });

        return newImage;
      })
    );
  }

  /**
   * 3. Xóa ảnh (Soft Delete DB + Xóa file Storage Bucket)
   */
  deleteImage(id: string): Observable<void> {
    // Xóa ngay khỏi danh sách giao diện
    const updatedLocalList = this.imagesSubject.value.filter(img => img.id !== id);
    this.imagesSubject.next(updatedLocalList);

    return this.http.delete<void>(`http://localhost:3000/api/jobs/image/${id}`).pipe(
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
