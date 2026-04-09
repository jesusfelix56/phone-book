import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppToastService } from '../../../../../../services/app-toast.service';
import { ContactUiService } from '../../../../../../services/contact-ui.service';
import { ContactCardComponent } from './contact-card.component';

describe('ContactCardComponent', () => {
  let component: ContactCardComponent;
  let fixture: ComponentFixture<ContactCardComponent>;

  beforeEach(async () => {
    const contactUiServiceSpy = jasmine.createSpyObj<ContactUiService>('ContactUiService', ['getDisplayData']);
    contactUiServiceSpy.getDisplayData.and.returnValue({
      avatar: 'assets/default-user.svg',
      nameColor: '#2563eb',
      tagSeverity: 'info',
    });
    const toastSpy = jasmine.createSpyObj<AppToastService>('AppToastService', ['copyWithFeedback']);

    await TestBed.configureTestingModule({
      declarations: [ContactCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ContactUiService, useValue: contactUiServiceSpy },
        { provide: AppToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactCardComponent);
    component = fixture.componentInstance;
    component.contact = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      phone: '555-0101',
      email: 'test@example.com',
      jobTitle: 'QA',
      address: 'Address 123',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
