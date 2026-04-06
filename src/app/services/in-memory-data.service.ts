import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { CONTACTS } from '../core/api/mocks/mock-contacts';
import { Contact } from '../shared/interfaces/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const contacts = [...CONTACTS];
    return { contacts };
  }

  genId(contacts: Contact[]): number {
    return contacts.length > 0
      ? Math.max(...contacts.map((contact) => contact.id)) + 1
      : 1;
  }
}
