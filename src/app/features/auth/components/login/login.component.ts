import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _toast: AppToastService,
  ) {}

  login(): void {
    this._authService.login(this.username, this.password).subscribe((isValid) => {
      if (!isValid) {
        this.errorMessage = 'Invalid credentials';
        return;
      }

      this.errorMessage = '';
      this._toast.success('Welcome', 'You are now logged in as admin.');
      this._router.navigate(['/admin/contacts']);
    });
  }
}
