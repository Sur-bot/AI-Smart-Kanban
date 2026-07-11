import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-invite-dropdown',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './invite.html',
  styleUrl: './invite.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('250ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(40px)' }))
      ])
    ])
  ]
})
export class InviteComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}