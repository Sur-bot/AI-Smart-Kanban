import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { LandingSolutionsService } from './landing-solutions.service';

@Component({
  selector: 'app-landing-solutions',
  imports: [MatIconModule, TranslatePipe, AsyncPipe, NgOptimizedImage],
  templateUrl: './landing-solutions.html',
  styleUrl: './landing-solutions.scss'
})
export class LandingSolutionsComponent {
  private landingSolutionsService = inject(LandingSolutionsService);
  readonly groups$ = this.landingSolutionsService.getSolutions();
}

