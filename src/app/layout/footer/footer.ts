import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangPopupComponent } from './lang-popup/lang-popup';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ThemeModalComponent } from '../../shared/components/theme-modal/theme-modal';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LangPopupComponent, MatDialogModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  constructor(private dialog: MatDialog) {}

  openThemeModal(event: Event) {
    event.preventDefault();
    this.dialog.open(ThemeModalComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'custom-theme-dialog',
      backdropClass: 'custom-theme-backdrop'
    });
  }
}
