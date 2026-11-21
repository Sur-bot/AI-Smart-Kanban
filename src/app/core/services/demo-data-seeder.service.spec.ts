import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '@env/environment';
import { DemoDataSeederService } from './demo-data-seeder.service';

describe('DemoDataSeederService', () => {
  let service: DemoDataSeederService;
  let httpMock: HttpTestingController;
  const endpoint = `${(environment.apiUrl || 'http://localhost:3000/api').replace(/\/+$/, '')}/demo/seed`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DemoDataSeederService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DemoDataSeederService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gọi duy nhất endpoint POST /api/demo/seed để khởi tạo dữ liệu khách (Happy Path)', async () => {
    const seedPromise = service.seedForGuest();

    const req = httpMock.expectOne(endpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      seeded: true,
      alreadyExists: false,
      project: { id: 'proj-1', name: 'Dự án Demo (Khách)' },
      tasks: [{ id: 'task-1' }, { id: 'task-2' }],
    });

    const result = await seedPromise;
    expect(result?.seeded).toBe(true);
    expect(result?.project?.id).toBe('proj-1');
  });

  it('bắt lỗi an toàn và trả về null khi Backend /api/demo/seed gặp lỗi (Error Path)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const seedPromise = service.seedForGuest();

    const req = httpMock.expectOne(endpoint);
    req.flush({ error: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    const result = await seedPromise;
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
