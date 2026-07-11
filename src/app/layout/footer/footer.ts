import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangPopupComponent } from './lang-popup/lang-popup';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LangPopupComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {}
