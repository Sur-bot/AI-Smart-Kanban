import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ThemeModalComponent } from '../../shared/components/theme-modal/theme-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, MatDialogModule],
      providers: [
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open theme modal on openThemeModal', () => {
    const dialogSpy = vi.spyOn((component as any).dialog, 'open').mockReturnValue({} as any);
    const event = { preventDefault: vi.fn() } as unknown as Event;
    
    component.openThemeModal(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(ThemeModalComponent, expect.any(Object));
  });
});
