import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { ContactService } from '../../../../services/contact.service';
import { ContactsViewModelService } from '../../../../services/contacts-view-model.service';
import { ContactListComponent } from './contact-list.component';

describe('ContactListComponent', () => {
  let component: ContactListComponent;
  let fixture: ComponentFixture<ContactListComponent>;
  let contactServiceSpy: jasmine.SpyObj<ContactService>;
  let viewModelServiceSpy: jasmine.SpyObj<ContactsViewModelService>;

  beforeEach(async () => {
    contactServiceSpy = jasmine.createSpyObj<ContactService>('ContactService', [
      'getContacts',
      'addContact',
      'updateContact',
      'deleteContact',
    ]);
    contactServiceSpy.getContacts.and.returnValue(of([]));

    const authServiceStub = {
      isAdmin$: of(false),
    };

    viewModelServiceSpy = jasmine.createSpyObj<ContactsViewModelService>(
      'ContactsViewModelService',
      ['filterAndSortContacts'],
    );
    viewModelServiceSpy.filterAndSortContacts.and.returnValue([]);

    const toastSpy = jasmine.createSpyObj<AppToastService>('AppToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [ContactListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ContactService, useValue: contactServiceSpy },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ContactsViewModelService, useValue: viewModelServiceSpy },
        { provide: AppToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contacts on init', () => {
    expect(contactServiceSpy.getContacts).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should render child components in parent template', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-contact-list-filters')).toBeTruthy();
    expect(element.querySelector('app-contact-profile-dialog')).toBeTruthy();
    expect(element.querySelector('app-contact-form-dialog')).toBeTruthy();
    expect(element.querySelector('app-confirm-delete-dialog')).toBeTruthy();
  });

  it('should open create dialog', () => {
    component.openCreate();
    expect(component.dialogOpen).toBeTrue();
    expect(component.editingId).toBeNull();
  });

  it('should open and close profile dialog', () => {
    const mockContact = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Lopez',
      phone: '123',
      email: 'ana@test.com',
      jobTitle: 'Dev',
      address: '',
    };

    component.openProfile(mockContact);
    expect(component.profileVisible).toBeTrue();
    expect(component.selectedContact).toEqual(mockContact);

    component.closeProfile();
    expect(component.profileVisible).toBeFalse();
    expect(component.selectedContact).toBeNull();
  });

  it('should apply filters when search changes', () => {
    component.onSearchChange('ana');
    expect(component.searchTerm).toBe('ana');
    expect(viewModelServiceSpy.filterAndSortContacts).toHaveBeenCalled();
  });

  it('should open and close delete dialog', () => {
    const mockContact = {
      id: 2,
      firstName: 'Luis',
      lastName: 'Perez',
      phone: '456',
      email: 'luis@test.com',
      jobTitle: 'QA',
      address: '',
    };

    component.openDelete(mockContact);
    expect(component.deleteDialogVisible).toBeTrue();
    expect(component.toDelete).toEqual(mockContact);

    component.closeDeleteDialog();
    expect(component.deleteDialogVisible).toBeFalse();
    expect(component.toDelete).toBeNull();
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedSort = 'phone';

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedSort).toBe('firstName');
    expect(viewModelServiceSpy.filterAndSortContacts).toHaveBeenCalled();
  });
});
