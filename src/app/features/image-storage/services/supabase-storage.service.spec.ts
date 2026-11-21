import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import { SupabaseStorageService } from './supabase-storage.service';

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    const mockAuthService = {
      user: signal<{ id: string } | null>({ id: 'user-123' }),
      isGuestMode: signal(false),
      accessToken: signal<string | null>('mock-jwt-token'),
    };

    TestBed.configureTestingModule({
      providers: [
        SupabaseStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(SupabaseStorageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('tải ảnh lên Storage và đăng ký metadata qua Backend POST /api/storage/files thay vì PostgREST (Happy Path)', async () => {
    const file = new File(['image-bytes'], 'banner.png', { type: 'image/png' });
    const uploadPromise = firstValueFrom(service.uploadImage(file));

    const storageReq = httpMock.expectOne((req) =>
      req.url.includes('/storage/v1/object/ai-kanban-storage/users/user-123/')
    );
    expect(storageReq.request.method).toBe('POST');
    storageReq.flush({ Key: 'ai-kanban-storage/users/user-123/banner.png' });

    const metadataReq = httpMock.expectOne(`${apiUrl}/storage/files`);
    expect(metadataReq.request.method).toBe('POST');
    expect(metadataReq.request.body).toMatchObject({
      original_name: 'banner.png',
      mime_type: 'image/png',
      extension: 'png',
      size_bytes: file.size,
    });
    expect(metadataReq.request.body.user_id).toBeUndefined();

    metadataReq.flush({
      id: metadataReq.request.body.id,
      original_name: 'banner.png',
      storage_key: metadataReq.request.body.storage_key,
      size_bytes: file.size,
    });

    const uploaded = await uploadPromise;
    expect(uploaded.name).toBe('banner.png');
    expect(uploaded.userId).toBe('user-123');
    httpMock.expectNone((req) => req.url.includes('/rest/v1/storage_files'));
  });

  it('dừng flow và không gọi Backend metadata khi upload binary lên Storage thất bại (Storage Error Path)', async () => {
    const file = new File(['image-bytes'], 'broken.png', { type: 'image/png' });
    const uploadPromise = firstValueFrom(service.uploadImage(file));

    const storageReq = httpMock.expectOne((req) =>
      req.url.includes('/storage/v1/object/ai-kanban-storage/users/user-123/')
    );
    storageReq.flush({ message: 'Storage unavailable' }, { status: 503, statusText: 'Service Unavailable' });

    await expect(uploadPromise).rejects.toMatchObject({ status: 503 });
    httpMock.expectNone(`${apiUrl}/storage/files`);
  });

  it('trả về lỗi khi Backend POST /api/storage/files từ chối do vượt quá quota (Backend Error Path)', async () => {
    const file = new File(['image-bytes'], 'large.png', { type: 'image/png' });
    const uploadPromise = firstValueFrom(service.uploadImage(file));

    const storageReq = httpMock.expectOne((req) =>
      req.url.includes('/storage/v1/object/ai-kanban-storage/users/user-123/')
    );
    storageReq.flush({ ok: true });

    const metadataReq = httpMock.expectOne(`${apiUrl}/storage/files`);
    metadataReq.flush(
      { code: 'STORAGE_QUOTA_EXCEEDED', error: 'Dung lượng lưu trữ đã đạt giới hạn cho phép' },
      { status: 413, statusText: 'Payload Too Large' }
    );

    await expect(uploadPromise).rejects.toMatchObject({ status: 413 });
  });
});
