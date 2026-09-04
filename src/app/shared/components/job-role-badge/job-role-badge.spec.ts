import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobRoleBadgeComponent } from './job-role-badge';
import { describe, it, expect, beforeEach } from 'vitest';

describe('JobRoleBadgeComponent', () => {
  let component: JobRoleBadgeComponent;
  let fixture: ComponentFixture<JobRoleBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobRoleBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobRoleBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return jobRoleData for valid jobRole', () => {
    component.jobRole = 'FE';
    expect(component.jobRoleData).toBeDefined();
    expect(component.jobRoleData?.label).toBe('Frontend');
  });

  it('should return undefined for invalid jobRole', () => {
    component.jobRole = 'invalid';
    expect(component.jobRoleData).toBeUndefined();
  });
});
