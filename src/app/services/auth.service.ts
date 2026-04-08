import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated$.asObservable();

  login(username: string, password: string): Observable<boolean> {
    const isValid = username === 'admin' && password === '123';
    this._isAuthenticated$.next(isValid);
    return of(isValid);
  }

  logout(): void {
    this._isAuthenticated$.next(false);
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated$.value;
  }
}
