import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ContactService } from '../../../../services/contact.service';
import {
  Contact,
  ContactSortField,
} from '../../../../shared/interfaces/contact.interface';

interface SortOption {
  label: string;
  value: ContactSortField;
}

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
  searchTerm = '';
  selectedSort: ContactSortField = 'firstName';
  sortOptions: SortOption[] = [
    { label: 'Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Job Title', value: 'jobTitle' },
  ];

  private _destroy$ = new Subject<void>();

  constructor(private _contactService: ContactService) {}

  ngOnInit(): void {
    this._contactService
      .getContacts()
      .pipe(takeUntil(this._destroy$))
      .subscribe((contacts) => {
        this.contacts = [...contacts];
        this._applyFilters();
      });
  }

  onSearchChange(): void {
    this._applyFilters();
  }

  onSortChange(): void {
    this._applyFilters();
  }

  openProfile(contact: Contact): void {
    this.selectedContact = contact;
    this.profileVisible = true;
  }

  closeProfile(): void {
    this.profileVisible = false;
  }

  getInitials(contact: Contact): string {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`;
  }

  getAvatarStyle(contact: Contact): Record<string, string> {
    const palette = ['#eff6ff', '#ecfeff', '#f5f3ff', '#fff7ed', '#f0fdf4'];
    const textPalette = ['#1d4ed8', '#0f766e', '#6d28d9', '#c2410c', '#166534'];
    const index = contact.id % palette.length;
    return {
      background: palette[index],
      color: textPalette[index],
    };
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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
