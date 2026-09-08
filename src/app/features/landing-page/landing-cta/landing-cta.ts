import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-cta',
  imports: [RouterModule, MatIconModule, TranslatePipe],
  templateUrl: './landing-cta.html',
  styleUrl: './landing-cta.scss',
})
export class LandingCtaComponent {}
