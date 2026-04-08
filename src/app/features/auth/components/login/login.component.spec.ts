import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('should create the component', () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const toast = jasmine.createSpyObj<AppToastService>('AppToastService', [
      'success',
    ]);
    authService.login.and.returnValue(of(true));
    const component = new LoginComponent(authService, router, toast);

    expect(component).toBeTruthy();
  });

  it('should show an error when credentials are invalid', () => {
    const authService = jasmine.createSpyObj('AuthService', ['login']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toast = jasmine.createSpyObj('AppToastService', ['success']);
    const component = new LoginComponent(authService, router, toast);

    authService.login.and.returnValue(of(false));
    component.username = 'admin';
    component.password = 'wrong-password';

    component.login();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(toast.success).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate when credentials are valid', () => {
    const authService = jasmine.createSpyObj('AuthService', ['login']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toast = jasmine.createSpyObj('AppToastService', ['success']);
    const component = new LoginComponent(authService, router, toast);

    authService.login.and.returnValue(of(true));
    component.username = 'admin';
    component.password = '123';

    component.login();

    expect(component.errorMessage).toBe('');
    expect(toast.success).toHaveBeenCalledWith(
      'Welcome',
      'You are now logged in as admin.',
    );
    expect(router.navigate).toHaveBeenCalledWith(['/contacts']);
  });
});
