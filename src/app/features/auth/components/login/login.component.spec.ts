import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<AppToastService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    toastSpy = jasmine.createSpyObj<AppToastService>('AppToastService', ['success']);
    authServiceSpy.login.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [RouterTestingModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AppToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty fields', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should show error when credentials are invalid', () => {
    component.username = 'admin';
    component.password = 'bad-password';
    authServiceSpy.login.and.returnValue(of(false));

    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith('admin', 'bad-password');
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(toastSpy.success).not.toHaveBeenCalled();
  });

  it('should navigate when credentials are valid', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.username = 'admin';
    component.password = '123';
    authServiceSpy.login.and.returnValue(of(true));

    component.login();

    expect(component.errorMessage).toBe('');
    expect(toastSpy.success).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/contacts']);
  });
});
