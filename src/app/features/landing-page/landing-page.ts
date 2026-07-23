import { Component } from '@angular/core';

import { LandingHeaderComponent } from './landing-header/landing-header';
import { LandingHeroComponent } from './landing-hero/landing-hero';
import { LandingSolutionsComponent } from './landing-solutions/landing-solutions';
import { LandingTechComponent } from './landing-tech/landing-tech';
import { LandingCtaComponent } from './landing-cta/landing-cta';
import { LandingFooterComponent } from './landing-footer/landing-footer';
import { LandingFeedbackComponent } from './landing-feedback/landing-feedback';

@Component({
  selector: 'app-landing-page',
  imports: [
    LandingHeaderComponent,
    LandingHeroComponent,
    LandingSolutionsComponent,
    LandingTechComponent,
    LandingCtaComponent,
    LandingFooterComponent,
    LandingFeedbackComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {}
