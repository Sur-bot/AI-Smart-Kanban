import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-cta',
  imports: [RouterModule, MatIconModule],
  templateUrl: './landing-cta.html',
  styleUrl: './landing-cta.scss',
})
export class LandingCtaComponent {}
