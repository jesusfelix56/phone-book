import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export type UserRole = 'admin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private _role$ = new BehaviorSubject<UserRole | null>(null);

  isAuthenticated$ = this._isAuthenticated$.asObservable();
  role$ = this._role$.asObservable();
  isAdmin$ = new Observable<boolean>((subscriber) => {
    const subscription = this.role$.subscribe((role) => {
      subscriber.next(role === 'admin');
    });

    return () => subscription.unsubscribe();
  });

  login(username: string, password: string): Observable<boolean> {
    const role = this._resolveRole(username, password);
    const isValid = role !== null;

    this._isAuthenticated$.next(isValid);
    this._role$.next(role);
    return of(isValid);
  }

  logout(): void {
    this._isAuthenticated$.next(false);
    this._role$.next(null);
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated$.value;
  }

  isAdmin(): boolean {
    return this._role$.value === 'admin';
  }

  getRole(): UserRole | null {
    return this._role$.value;
  }

  private _resolveRole(username: string, password: string): UserRole | null {
    if (username === 'admin' && password === '123') {
      return 'admin';
    }

    return null;
  }
}
