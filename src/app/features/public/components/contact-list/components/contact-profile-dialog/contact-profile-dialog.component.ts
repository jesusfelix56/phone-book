import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardToastService } from '../../../../../../services/clipboard-toast.service';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-contact-profile-dialog',
  templateUrl: './contact-profile-dialog.component.html',
  styleUrls: ['./contact-profile-dialog.component.scss'],
})
export class ContactProfileDialogComponent {
  @Input() visible = false;
  @Input() contact: Contact | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  readonly defaultAvatar = 'assets/default-user.svg';
  private readonly _namePalette = ['#2563eb', '#0f766e', '#9333ea', '#c2410c', '#be123c'];
  private readonly _tagSeverities: Array<
    'info' | 'success' | 'warning' | 'danger' | 'secondary'
  > = ['info', 'success', 'warning', 'danger', 'secondary'];

  constructor(private _clipboardToast: ClipboardToastService) {}

  onClose(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  copyValue(value: string, label: 'Phone' | 'Email' | 'Address'): void {
    this._clipboardToast.copyWithFeedback(value, label);
  }

  getNameColor(): string {
    if (!this.contact) {
      return this._namePalette[0];
    }
    return this._namePalette[this.contact.id % this._namePalette.length];
  }

  getTagSeverity(): 'info' | 'success' | 'warning' | 'danger' | 'secondary' {
    if (!this.contact) {
      return 'info';
    }
    return this._tagSeverities[this.contact.id % this._tagSeverities.length];
  }
}
