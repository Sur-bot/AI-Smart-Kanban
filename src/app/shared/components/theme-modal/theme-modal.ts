import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService, ThemeBackground } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './theme-modal.html',
  styleUrls: ['./theme-modal.scss']
})
export class ThemeModalComponent implements OnDestroy {
  themeService = inject(ThemeService);
  dialogRef = inject(MatDialogRef<ThemeModalComponent>);

  themes: ThemeBackground[] = [];
  selectedThemeUrl: string = '';
  initialThemeUrl: string = '';
  isSaved: boolean = false;

  constructor() {
    this.themes = this.themeService.availableThemes;
    this.initialThemeUrl = this.themeService.getCurrentTheme();
    this.selectedThemeUrl = this.initialThemeUrl;
  }

  selectTheme(theme: ThemeBackground) {
    this.selectedThemeUrl = theme.url;
    this.themeService.setTheme(theme.url);
  }

  save() {
    this.isSaved = true;
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    if (!this.isSaved) {
      this.themeService.setTheme(this.initialThemeUrl);
    }
  }
}
