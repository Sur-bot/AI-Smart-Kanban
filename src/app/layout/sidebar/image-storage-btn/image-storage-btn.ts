import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-storage-btn',
  templateUrl: './image-storage-btn.html',
  styleUrls: ['./image-storage-btn.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ImageStorageBtnComponent {
  @Input() isCollapsed = false;

  constructor(private router: Router) {}

  navigateToStorage(): void {
    this.router.navigate(['/image-storage']);
  }
}
