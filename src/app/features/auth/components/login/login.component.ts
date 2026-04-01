import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  ) {}

  login(): void {
    this._authService.login(this.username, this.password).subscribe((isValid) => {
      if (!isValid) {
        this.errorMessage = 'Invalid credentials. Use admin / admin123.';
        return;
      }

      this.errorMessage = '';
      this._router.navigate(['/admin/contacts']);
    });
  }
}
