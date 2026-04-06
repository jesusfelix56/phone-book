import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/contacts']);
  }
}
