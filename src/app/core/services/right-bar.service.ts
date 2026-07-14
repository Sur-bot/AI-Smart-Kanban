import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RightBarService {
  activeFeature = signal<string | null>(null);

  openFeature(featureId: string): void {
    this.activeFeature.set(featureId);
  }

  closeFeature(): void {
    this.activeFeature.set(null);
  }
}
