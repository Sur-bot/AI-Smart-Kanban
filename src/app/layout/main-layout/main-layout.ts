import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RightBarComponent } from '../right-bar/right-bar';
import { RightBarPopupComponent } from '../right-bar/components/right-bar-popup/right-bar-popup';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent, RouterOutlet, RightBarComponent, RightBarPopupComponent]
})
export class MainLayoutComponent {
  sidebarCollapsed = true;
  activeRightBarFeature: string | null = null;

  toggleSidebar(isCollapsed?: boolean) {
    if (isCollapsed !== undefined) {
      this.sidebarCollapsed = isCollapsed;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  onRightBarFeatureClick(featureId: string) {
    this.activeRightBarFeature = featureId;
  }

  onRightBarPopupClose() {
    this.activeRightBarFeature = null;
  }
}
