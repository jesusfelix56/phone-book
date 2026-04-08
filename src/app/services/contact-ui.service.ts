import { Injectable } from '@angular/core';
import { Contact } from '../shared/interfaces/contact.interface';

export type ContactTagSeverity = 'info' | 'success' | 'warning' | 'danger' | 'secondary';

type ContactDisplayMeta = {
  avatar: string;
  nameColor: string;
  tagSeverity: ContactTagSeverity;
};

@Injectable({
  providedIn: 'root',
})
export class ContactUiService {
  readonly defaultAvatar = 'assets/default-user.svg';

  private readonly _namePalette = ['#2563eb', '#0f766e', '#9333ea', '#c2410c', '#be123c'];
  private readonly _tagSeverities: ContactTagSeverity[] = [
    'info',
    'success',
    'warning',
    'danger',
    'secondary',
  ];

  getDisplayData(contact: Contact | null): ContactDisplayMeta {
    return {
      avatar: this.defaultAvatar,
      nameColor: this.getNameColor(contact),
      tagSeverity: this.getTagSeverity(contact),
    };
  }

  getNameColor(contact: Contact | null): string {
    if (!contact) {
      return this._namePalette[0];
    }
    return this._namePalette[contact.id % this._namePalette.length];
  }

  getTagSeverity(contact: Contact | null): ContactTagSeverity {
    if (!contact) {
      return 'info';
    }
    return this._tagSeverities[contact.id % this._tagSeverities.length];
  }
}
