import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { SocialLoginComponent } from '../components/social-login/social-login.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, FormsModule, MatIconModule, AuthLayoutComponent, SocialLoginComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  email = signal('');
  agreeUpdates = signal(false);
  agreeTraining = signal(false);
  recaptchaVerified = signal(false);

  isFormValid() {
    return this.email().trim().length > 0 || this.agreeUpdates() || this.agreeTraining() || this.recaptchaVerified();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      // TODO: Implement registration logic
    }
  }
}
