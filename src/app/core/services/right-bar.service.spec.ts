import { TestBed } from '@angular/core/testing';
import { RightBarService } from './right-bar.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('RightBarService', () => {
  let service: RightBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RightBarService]
    });
    service = TestBed.inject(RightBarService);
  });

  it('should start with null feature', () => {
    expect(service.activeFeature()).toBeNull();
  });

  it('should open feature', () => {
    service.openFeature('chat');
    expect(service.activeFeature()).toBe('chat');
  });

  it('should close feature', () => {
    service.openFeature('chat');
    service.closeFeature();
    expect(service.activeFeature()).toBeNull();
  });
});
