import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RightBarComponent } from '../right-bar/right-bar';
import { RightBarPopupComponent } from '../right-bar/components/right-bar-popup/right-bar-popup';
import { RightBarService } from '../../core/services/right-bar.service';
import { ThemeService } from '../../core/services/theme.service';
import { TaskStore } from '../../core/state/task.store';
import { AiChatBubbleComponent } from '../../features/right-bar-features/copilot-feature/components/ai-chat-bubble.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent, RouterOutlet, RightBarComponent, RightBarPopupComponent, AiChatBubbleComponent]
})
export class MainLayoutComponent implements OnInit {
  private taskStore = inject(TaskStore);
  private rightBarService = inject(RightBarService);
  themeService = inject(ThemeService);

  // Expose signal trực tiếp để Angular template tự track reactively
  activeRightBarFeature = this.rightBarService.activeFeature;

  sidebarCollapsed = true;

  ngOnInit() {
    this.taskStore.loadProjects();
  }

  toggleSidebar(isCollapsed?: boolean) {
    if (isCollapsed !== undefined) {
      this.sidebarCollapsed = isCollapsed;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  onRightBarFeatureClick(featureId: string) {
    this.rightBarService.openFeature(featureId);
  }

  onRightBarPopupClose() {
    this.rightBarService.closeFeature();
  }
}
