import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardToastService } from '../../../../../../services/clipboard-toast.service';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.scss'],
})
export class ContactCardComponent {
  @Input() contact!: Contact;
  @Output() viewProfile = new EventEmitter<Contact>();
  readonly defaultAvatar = 'assets/default-user.svg';
  private readonly _namePalette = ['#2563eb', '#0f766e', '#9333ea', '#c2410c', '#be123c'];
  private readonly _tagSeverities: Array<
    'info' | 'success' | 'warning' | 'danger' | 'secondary'
  > = ['info', 'success', 'warning', 'danger', 'secondary'];

  constructor(private _clipboardToast: ClipboardToastService) {}

  openProfile(): void {
    this.viewProfile.emit(this.contact);
  }

  getNameColor(): string {
    return this._namePalette[this.contact.id % this._namePalette.length];
  }

  getTagSeverity(): 'info' | 'success' | 'warning' | 'danger' | 'secondary' {
    return this._tagSeverities[this.contact.id % this._tagSeverities.length];
  }

  copyValue(value: string, label: 'Phone' | 'Email'): void {
    this._clipboardToast.copyWithFeedback(value, label);
  }
}
