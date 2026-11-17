import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiPendingAction } from '@core/models/ai.model';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-card.html'
})
export class ActionCardComponent {
  @Input({ required: true }) action!: AiPendingAction;
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onReject = new EventEmitter<string>();
}
