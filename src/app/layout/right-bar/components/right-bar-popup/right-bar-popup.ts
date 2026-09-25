import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  ChatFeatureComponent,
  TaskChatFeatureComponent,
  CopilotFeatureComponent,
  CollabFeatureComponent,
  ChannelFeatureComponent,
  OpenChannelFeatureComponent,
  NotificationsFeatureComponent,
  TelephonyFeatureComponent,
  AppsFeatureComponent,
  SettingsFeatureComponent
} from '../../../../features/right-bar-features';
import { RIGHT_BAR_FEATURES, RightBarFeature } from '../../../../core/config/right-bar.config';

@Component({
  selector: 'app-right-bar-popup',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    ChatFeatureComponent,
    TaskChatFeatureComponent,
    CopilotFeatureComponent,
    CollabFeatureComponent,
    ChannelFeatureComponent,
    OpenChannelFeatureComponent,
    NotificationsFeatureComponent,
    TelephonyFeatureComponent,
    AppsFeatureComponent,
    SettingsFeatureComponent
  ],
  templateUrl: './right-bar-popup.html',
  styleUrls: ['./right-bar-popup.scss']
})
export class RightBarPopupComponent implements OnInit {
  @Input() activeFeature!: string;
  @Output() close = new EventEmitter<void>();
  @Output() selectFeature = new EventEmitter<string>();

  isClosing = false;

  menuItems: RightBarFeature[] = RIGHT_BAR_FEATURES;

  getFeatureName() {
    return this.menuItems.find(m => m.id === this.activeFeature)?.label || 'Trò chuyện';
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay-bg') || (event.target as HTMLElement).classList.contains('backdrop-blur-md')) {
      this.triggerClose();
    }
  }

  triggerClose() {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 350); // Đợi CSS animation hoàn tất
  }
}
