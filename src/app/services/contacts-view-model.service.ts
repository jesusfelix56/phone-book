import { Injectable } from '@angular/core';
import { Contact, ContactSortField } from '../shared/interfaces/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsViewModelService {
  filterAndSortContacts(
    contacts: Contact[],
    searchTerm: string,
    selectedSort: ContactSortField,
  ): Contact[] {
    const search = this._normalizeValue(searchTerm);
    const source = !search ? [...contacts] : contacts.filter((contact) => {
      const fullName = this._normalizeValue(`${contact.firstName} ${contact.lastName}`);
      const firstName = this._normalizeValue(contact.firstName);
      const lastName = this._normalizeValue(contact.lastName);
      const phone = this._normalizeValue(contact.phone);
      return (
        firstName.includes(search) ||
        lastName.includes(search) ||
        fullName.includes(search) ||
        phone.includes(search)
      );
    });

    return source.sort((left, right) => {
      const leftValue = left[selectedSort];
      const rightValue = right[selectedSort];
      return leftValue.localeCompare(rightValue);
    });
  }

  private _normalizeValue(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }
}
