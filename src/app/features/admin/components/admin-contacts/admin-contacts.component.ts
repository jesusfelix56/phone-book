import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ContactService } from '../../../../services/contact.service';
import { Contact } from '../../../../shared/interfaces/contact.interface';

interface ColumnOption {
  field: string;
  header: string;
}

@Component({
  selector: 'app-admin-contacts',
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['./admin-contacts.component.scss'],
})
export class AdminContactsComponent implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  selectedContacts: Contact[] = [];
  contactDialogVisible = false;
  deleteDialogVisible = false;
  deleteSelectedDialogVisible = false;

  columns: ColumnOption[] = [
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'jobTitle', header: 'Job Title' },
    { field: 'address', header: 'Address' },
  ];
  selectedColumns: ColumnOption[] = [...this.columns];

  formModel: Omit<Contact, 'id'> = this._createEmptyForm();
  formSubmitted = false;

  private _destroy$ = new Subject<void>();
  private _clonedContacts: Record<number, Contact> = {};
  private readonly _emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly _phonePattern = /^[\d\s()+-]{7,20}$/;

  constructor(private _contactService: ContactService) {}

  ngOnInit(): void {
    this._contactService
      .getContacts()
      .pipe(takeUntil(this._destroy$))
      .subscribe((contacts) => {
        this.contacts = [...contacts].sort((left, right) =>
          left.firstName.localeCompare(right.firstName),
        );
      });
  }

  openCreate(): void {
    this.formModel = this._createEmptyForm();
    this.formSubmitted = false;
    this.contactDialogVisible = true;
  }

  save(): void {
    this.formSubmitted = true;
    if (!this._isFormValid()) {
      return;
    }

    this._contactService.addContact(this.formModel).subscribe(() => {
      this.contactDialogVisible = false;
      this.formSubmitted = false;
    });
  }

  openDelete(contact: Contact): void {
    this.selectedContact = contact;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (!this.selectedContact) {
      return;
    }

    this._contactService.deleteContact(this.selectedContact.id).subscribe(() => {
      this.deleteDialogVisible = false;
      this.selectedContact = null;
    });
  }

  openDeleteSelected(): void {
    this.deleteSelectedDialogVisible = true;
  }

  confirmDeleteSelected(): void {
    const selectedIds = this.selectedContacts.map((contact) => contact.id);
    if (!selectedIds.length) {
      return;
    }

    forkJoin(selectedIds.map((id) => this._contactService.deleteContact(id))).subscribe(
      () => {
        this.deleteSelectedDialogVisible = false;
        this.selectedContacts = [];
      },
    );
  }

  onRowEditInit(contact: Contact): void {
    this._clonedContacts[contact.id] = { ...contact };
  }

  onRowEditSave(contact: Contact): void {
    if (!this._isContactValid(contact)) {
      this.onRowEditCancel(contact);
      return;
    }

    this._contactService.updateContact(contact).subscribe();
    delete this._clonedContacts[contact.id];
  }

  onRowEditCancel(contact: Contact): void {
    const cachedContact = this._clonedContacts[contact.id];
    if (!cachedContact) {
      return;
    }

    const index = this.contacts.findIndex((item) => item.id === contact.id);
    this.contacts[index] = cachedContact;
    delete this._clonedContacts[contact.id];
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _isFormValid(): boolean {
    return this._isContactValid(this.formModel);
  }

  private _isRequiredFilled(value: string): boolean {
    return !!value.trim();
  }

  isFieldInvalid(field: keyof Omit<Contact, 'id'>): boolean {
    return !!this.getFieldError(field);
  }

  getFieldError(field: keyof Omit<Contact, 'id'>): string {
    if (!this.formSubmitted) {
      return '';
    }

    if (field === 'address') {
      return '';
    }

    if (!this._isRequiredFilled(this.formModel[field])) {
      return `${this._getFieldLabel(field)} is required.`;
    }

    if (field === 'email' && !this._isEmailValid(this.formModel.email)) {
      return 'Email format is invalid.';
    }

    if (field === 'phone' && !this._isPhoneValid(this.formModel.phone)) {
      return 'Phone format is invalid.';
    }

    return '';
  }

  private _isEmailValid(value: string): boolean {
    return this._emailPattern.test(value.trim());
  }

  private _isPhoneValid(value: string): boolean {
    return this._phonePattern.test(value.trim());
  }

  private _isContactValid(contact: Omit<Contact, 'id'> | Contact): boolean {
    return (
      !!contact.firstName.trim() &&
      !!contact.lastName.trim() &&
      this._isPhoneValid(contact.phone) &&
      this._isEmailValid(contact.email) &&
      !!contact.jobTitle.trim()
    );
  }

  private _getFieldLabel(field: keyof Omit<Contact, 'id'>): string {
    const labels: Record<keyof Omit<Contact, 'id'>, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      email: 'Email',
      jobTitle: 'Job title',
      address: 'Address',
    };
    return labels[field];
  }

  private _createEmptyForm(): Omit<Contact, 'id'> {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      jobTitle: '',
      address: '',
    };
  }
}
