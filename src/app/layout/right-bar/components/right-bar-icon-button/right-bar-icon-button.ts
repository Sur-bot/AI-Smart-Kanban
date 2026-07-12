import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-right-bar-icon-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './right-bar-icon-button.html',
  styleUrls: ['./right-bar-icon-button.scss']
})
export class RightBarIconButtonComponent {
  @Input() icon!: string;
  @Input() tooltip: string = '';
  @Output() onClick = new EventEmitter<void>();
}
