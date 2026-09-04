import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { App } from './app';

describe('App — Smoke Test', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: TranslateService,
          useValue: { use: vi.fn(), setDefaultLang: vi.fn() }
        }
      ]
    }).compileComponents();
  });

  it('khởi tạo component thành công (không throw)', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

