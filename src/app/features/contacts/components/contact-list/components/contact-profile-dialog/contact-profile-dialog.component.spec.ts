import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContactUiService } from '../../../../../../services/contact-ui.service';
import { ContactClipboardService } from '../../../../../../services/contact-clipboard.service';
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
    const contactClipboardSpy = jasmine.createSpyObj<ContactClipboardService>(
      'ContactClipboardService',
      ['phone', 'email', 'address'],
    );

    await TestBed.configureTestingModule({
      declarations: [ContactProfileDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ContactUiService, useValue: contactUiServiceSpy },
        { provide: ContactClipboardService, useValue: contactClipboardSpy },
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
