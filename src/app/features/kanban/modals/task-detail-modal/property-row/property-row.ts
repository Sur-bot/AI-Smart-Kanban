import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="prop-row">
      <dt class="prop-label">
        {{ label }}
        <ng-content select="[labelSuffix]" />
      </dt>
      <dd class="prop-value">
        <ng-content />
      </dd>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class PropertyRowComponent {
  @Input({ required: true }) label!: string;
}
