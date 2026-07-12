import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatFeatureComponent } from './features/chat-feature/chat-feature.component';
import { TaskChatFeatureComponent } from './features/task-chat-feature/task-chat-feature.component';
import { CopilotFeatureComponent } from './features/copilot-feature/copilot-feature.component';
import { CollabFeatureComponent } from './features/collab-feature/collab-feature.component';
import { ChannelFeatureComponent } from './features/channel-feature/channel-feature.component';
import { OpenChannelFeatureComponent } from './features/open-channel-feature/open-channel-feature.component';
import { NotificationsFeatureComponent } from './features/notifications-feature/notifications-feature.component';
import { TelephonyFeatureComponent } from './features/telephony-feature/telephony-feature.component';
import { AppsFeatureComponent } from './features/apps-feature/apps-feature.component';
import { SettingsFeatureComponent } from './features/settings-feature/settings-feature.component';
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
export class RightBarPopupComponent {
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
