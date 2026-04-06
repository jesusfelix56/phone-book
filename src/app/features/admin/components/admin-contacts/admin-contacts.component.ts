import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { ContactService } from '../../../../services/contact.service';
import {
  Contact,
  ContactColumnOption,
} from '../../../../shared/interfaces/contact.interface';
import { isContactBodyValid } from '../../../../shared/utils/contact-validation';
import { AdminContactsTableComponent } from './components/admin-contacts-table/admin-contacts-table.component';

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
  deleteDialogMode: 'single' | 'bulk' = 'single';

  columns: ContactColumnOption[] = [
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'jobTitle', header: 'Job Title' },
    { field: 'address', header: 'Address' },
  ];
  selectedColumns: ContactColumnOption[] = [...this.columns];

  formModel: Omit<Contact, 'id'> = this._emptyForm();
  formSubmitted = false;
  deleteDialogTitle = '';
  deleteDialogMessage = '';
  deleteDialogConfirmLabel = '';

  private _contactsSub?: Subscription;
  private _clonedContacts: Record<number, Contact> = {};
  @ViewChild(AdminContactsTableComponent)
  private _contactsTableComponent?: AdminContactsTableComponent;

  constructor(
    private _toast: AppToastService,
    private _contactService: ContactService,
  ) {}

  ngOnInit(): void {
    this._contactsSub = this._contactService.getContacts().subscribe((contacts) => {
      this.contacts = [...contacts].sort((left, right) =>
        left.firstName.localeCompare(right.firstName),
      );
    });
  }

  openCreate(): void {
    this.formModel = this._emptyForm();
    this.formSubmitted = false;
    this.contactDialogVisible = true;
  }

  save(): void {
    this.formSubmitted = true;
    if (!isContactBodyValid(this.formModel)) {
      return;
    }

    this._contactService.addContact(this.formModel).subscribe(() => {
      this.contactDialogVisible = false;
      this.formSubmitted = false;
      this._showSuccess('Contact created', 'The new contact was saved successfully.');
    });
  }

  openDelete(contact: Contact): void {
    this.deleteDialogMode = 'single';
    this.selectedContact = contact;
    this.deleteDialogTitle = 'Delete contact';
    this.deleteDialogMessage = `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`;
    this.deleteDialogConfirmLabel = 'Delete';
    this.deleteDialogVisible = true;
  }

  openDeleteSelected(): void {
    this.deleteDialogMode = 'bulk';
    this.deleteDialogTitle = 'Delete selected contacts';
    this.deleteDialogMessage = `Are you sure you want to delete ${this.selectedContacts.length} selected contacts?`;
    this.deleteDialogConfirmLabel = 'Delete selected';
    this.deleteDialogVisible = true;
  }

  confirmDeleteDialog(): void {
    if (this.deleteDialogMode === 'single') {
      if (!this.selectedContact) {
        return;
      }

      this._contactService.deleteContact(this.selectedContact.id).subscribe(() => {
        this.deleteDialogVisible = false;
        this.selectedContact = null;
        this._showSuccess('Contact deleted', 'Contact removed successfully.');
      });
      return;
    }

    const selectedIds = this.selectedContacts.map((contact) => contact.id);
    if (!selectedIds.length) {
      return;
    }

    forkJoin(selectedIds.map((id) => this._contactService.deleteContact(id))).subscribe(() => {
      this.deleteDialogVisible = false;
      this.selectedContacts = [];
      this._showSuccess('Contacts deleted', 'Selected contacts were removed.');
    });
  }

  onRowEditInit(contact: Contact): void {
    this._clonedContacts[contact.id] = { ...contact };
  }

  onRowEditSave(contact: Contact): void {
    if (!isContactBodyValid(contact)) {
      this.onRowEditCancel(contact);
      this._toast.error(
        'Invalid contact',
        'Please complete required fields with valid phone and email.',
      );
      return;
    }

    this._contactService.updateContact(contact).subscribe({
      next: () => {
        this._showSuccess('Contact updated', 'Changes saved successfully.');
        delete this._clonedContacts[contact.id];
      },
      error: () => {
        this.onRowEditCancel(contact);
        this._toast.error(
          'Update failed',
          'The contact could not be updated. Please try again.',
        );
      },
    });
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
    this._contactsSub?.unsubscribe();
  }

  updateFormModel(model: Omit<Contact, 'id'>): void {
    this.formModel = model;
  }

  closeFormDialog(): void {
    this.contactDialogVisible = false;
    this.formSubmitted = false;
  }

  onGlobalFilterChange(value: string): void {
    this._contactsTableComponent?.applyGlobalFilter(value);
  }

  private _emptyForm(): Omit<Contact, 'id'> {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      jobTitle: '',
      address: '',
    };
  }

  private _showSuccess(summary: string, detail: string): void {
    this._toast.success(summary, detail);
  }
}
