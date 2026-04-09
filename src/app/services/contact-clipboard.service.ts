import { Injectable } from '@angular/core';
import { AppToastService } from './app-toast.service';
import { Contact } from '../shared/interfaces/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactClipboardService {
  constructor(private _toast: AppToastService) {}

  phone(contact: Contact | null): void {
    this._toast.copyWithFeedback(contact?.phone ?? '', 'Phone');
  }

  email(contact: Contact | null): void {
    this._toast.copyWithFeedback(contact?.email ?? '', 'Email');
  }

  address(contact: Contact | null): void {
    this._toast.copyWithFeedback(contact?.address ?? '', 'Address');
  }
}
