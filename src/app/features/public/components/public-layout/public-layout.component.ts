import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private _authSub?: Subscription;

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this._authSub = this._authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/contacts']);
  }

  ngOnDestroy(): void {
    this._authSub?.unsubscribe();
  }
}
