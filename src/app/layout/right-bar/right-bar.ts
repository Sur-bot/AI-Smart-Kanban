import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RightBarIconButtonComponent } from './components/right-bar-icon-button/right-bar-icon-button';
import { RIGHT_BAR_FEATURES, RightBarFeature } from '../../core/config/right-bar.config';

@Component({
  selector: 'app-right-bar',
  standalone: true,
  imports: [CommonModule, RightBarIconButtonComponent],
  templateUrl: './right-bar.html',
  styleUrls: ['./right-bar.scss']
})
export class RightBarComponent {
  topIcons: RightBarFeature[] = RIGHT_BAR_FEATURES
    .filter(f => f.position === 'top')
    .sort((a, b) => (a.barOrder || 0) - (b.barOrder || 0));

  bottomIcons: RightBarFeature[] = RIGHT_BAR_FEATURES
    .filter(f => f.position === 'bottom')
    .sort((a, b) => (a.barOrder || 0) - (b.barOrder || 0));

  @Output() openFeature = new EventEmitter<string>();

  onFeatureClick(iconId: string) {
    this.openFeature.emit(iconId);
  }
}
