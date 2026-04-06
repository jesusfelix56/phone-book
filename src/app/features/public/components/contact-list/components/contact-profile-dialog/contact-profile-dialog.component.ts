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

  constructor(private _clipboardToast: ClipboardToastService) {}

  onClose(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  copyValue(value: string, label: 'Phone' | 'Email' | 'Address'): void {
    this._clipboardToast.copyWithFeedback(value, label);
  }
}
