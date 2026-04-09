import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppToastService } from '../../../../../../services/app-toast.service';
import { ContactUiService } from '../../../../../../services/contact-ui.service';
import { ContactProfileDialogComponent } from './contact-profile-dialog.component';

describe('ContactProfileDialogComponent', () => {
  let component: ContactProfileDialogComponent;
  let fixture: ComponentFixture<ContactProfileDialogComponent>;

  beforeEach(async () => {
    const contactUiServiceSpy = jasmine.createSpyObj<ContactUiService>('ContactUiService', ['getDisplayData']);
    contactUiServiceSpy.getDisplayData.and.returnValue({
      avatar: 'assets/default-user.svg',
      nameColor: '#2563eb',
      tagSeverity: 'info',
    });
    const toastSpy = jasmine.createSpyObj<AppToastService>('AppToastService', ['copyWithFeedback']);

    await TestBed.configureTestingModule({
      declarations: [ContactProfileDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ContactUiService, useValue: contactUiServiceSpy },
        { provide: AppToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
