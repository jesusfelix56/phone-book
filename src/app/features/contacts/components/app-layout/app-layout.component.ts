import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdmin = false;
  private _authSub?: Subscription;
  private _adminSub?: Subscription;

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this._authSub = this._authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    this._adminSub = this._authService.isAdmin$.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/contacts']);
  }

  ngOnDestroy(): void {
    this._authSub?.unsubscribe();
    this._adminSub?.unsubscribe();
  }
}
