import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { SocialLoginComponent } from '../components/social-login/social-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, FormsModule, AuthLayoutComponent, SocialLoginComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = signal('');

  isFormValid() {
    return this.email().trim().length > 0;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      // TODO: Implement login logic
    }
  }
}
