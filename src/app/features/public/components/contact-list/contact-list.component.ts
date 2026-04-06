import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactService } from '../../../../services/contact.service';
import {
  Contact,
  ContactSortField,
  ContactSortOption,
} from '../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  selectedContact: Contact | null = null;
  profileVisible = false;
  loading = true;
  searchTerm = '';
  selectedSort: ContactSortField = 'firstName';
  readonly sortOptions: ContactSortOption[] = [
    { label: 'Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Job Title', value: 'jobTitle' },
  ];

  private _contactsSub?: Subscription;

  constructor(private _contactService: ContactService) {}

  ngOnInit(): void {
    this._contactsSub = this._contactService.getContacts().subscribe((contacts) => {
      this.contacts = [...contacts];
      this._applyFilters();
      this.loading = false;
    });
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

  openProfile(contact: Contact): void {
    this.selectedContact = contact;
    this.profileVisible = true;
  }

  closeProfile(): void {
    this.profileVisible = false;
    this.selectedContact = null;
  }

  ngOnDestroy(): void {
    this._contactsSub?.unsubscribe();
  }

  private _applyFilters(): void {
    const search = this.searchTerm.trim();
    const source = !search
      ? [...this.contacts]
      : this.contacts.filter((contact) => {
          const fullName = `${contact.firstName} ${contact.lastName}`;
          return (
            contact.firstName.includes(search) ||
            contact.lastName.includes(search) ||
            fullName.includes(search) ||
            contact.phone.includes(search)
          );
        });

    this.filteredContacts = source.sort((left, right) => {
      const leftValue = left[this.selectedSort];
      const rightValue = right[this.selectedSort];
      return leftValue.localeCompare(rightValue);
    });
  }
}
