import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { ContactService } from '../../../../services/contact.service';
import { ContactsViewModelService } from '../../../../services/contacts-view-model.service';
import {
  Contact,
  ContactFormModel,
  ContactSortField,
} from '../../../../shared/interfaces/contact.interface';
import { createEmptyContactForm, toContactFormModel } from '../../../../shared/utils/contact-validation';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  selectedContact: Contact | null = null;
  isAdmin = false;
  loading = true;
  searchTerm = '';
  selectedSort: ContactSortField = 'firstName';
  formModel: ContactFormModel = createEmptyContactForm();
  profileVisible = false;
  dialogOpen = false;
  deleteDialogVisible = false;
  saving = false;
  deleting = false;
  editingId: number | null = null;
  toDelete: Contact | null = null;
  rowsPerPage = 10;
  sortOptions: Array<{ label: string; value: ContactSortField }> = [
    { label: 'Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Job Title', value: 'jobTitle' },
  ];

  private _contactsSub!: Subscription;
  private _authSub!: Subscription;

  constructor(
    private _contactService: ContactService,
    private _authService: AuthService,
    private _viewModelService: ContactsViewModelService,
    private _toast: AppToastService,
  ) {}

  ngOnInit(): void {
    this._subscribeAuth();
    this._subscribeContacts();
  }

  ngOnDestroy(): void {
    this._contactsSub.unsubscribe();
    this._authSub.unsubscribe();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this._applyFilters();
  }

  onSortChange(value: ContactSortField): void {
    this.selectedSort = value;
    this._applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSort = 'firstName';
    this._applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this._applyFilters();
  }

  openCreate(): void {
    this.editingId = null;
    this.formModel = createEmptyContactForm();
    this.dialogOpen = true;
  }

  saveContact(form: ContactFormModel): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    const isCreateMode = this.editingId === null;
    const action$ = isCreateMode
      ? this._contactService.addContact(form) : this._contactService.updateContact({ id: this.editingId!, ...form });
    action$.pipe(finalize(() => {
          this.saving = false;
        }),
      ).subscribe({
        next: () => {
          this.closeFormDialog();
          const title = isCreateMode ? 'Contact created' : 'Contact updated';
          this._toast.success(title, 'Contact saved successfully.');
        },
        error: () => {
          const title = isCreateMode ? 'Create failed' : 'Update failed';
          this._toast.error(title, 'The contact could not be saved. Please try again.');
        },
      });
  }

  confirmDelete(): void {
    if (this.deleting || !this.toDelete) {
      return;
    }

    this.deleting = true;
    this._contactService
      .deleteContact(this.toDelete.id)
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.closeDeleteDialog();
          this._toast.success('Contact deleted', 'Contact removed successfully.');
        },
        error: () => {
          this._toast.error('Delete failed', 'Could not delete this contact.');
        },
      });
  }

  get filteredCountLabel(): string {
    const count = this.filteredContacts.length;

    return count === 1 ? '1 result' : `${count} results`;
  }

  openProfile(contact: Contact): void {
    this.selectedContact = contact;
    this.profileVisible = true;
  }

  openEdit(contact: Contact): void {
    this.editingId = contact.id;
    this.formModel = toContactFormModel(contact);
    this.dialogOpen = true;
  }

  closeProfile(): void {
    this.profileVisible = false;
    this.selectedContact = null;
  }

  closeFormDialog(): void {
    this.dialogOpen = false;
    this.editingId = null;
  }

  openDelete(contact: Contact): void {
    this.toDelete = contact;
    this.deleteDialogVisible = true;
  }

  closeDeleteDialog(): void {
    this.deleteDialogVisible = false;
    this.toDelete = null;
  }

  private _applyFilters(): void {
    this.filteredContacts = this._viewModelService.filterAndSortContacts(
      this.contacts,
      this.searchTerm,
      this.selectedSort,
    );
  }

  private _subscribeAuth(): void {
    this._authSub = this._authService
      .isAdmin$
      .subscribe((isAdmin) => (this.isAdmin = isAdmin));
  }

  private _subscribeContacts(): void {
    this._contactsSub = this._contactService.getContacts().subscribe((contacts) => {
      this.contacts = [...contacts];
      this._applyFilters();
      this.loading = false;
    });
  }
}
