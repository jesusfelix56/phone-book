import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';
import { ContactUiService } from '../../../../../../services/contact-ui.service';
import { ContactClipboardService } from '../../../../../../services/contact-clipboard.service';

@Component({
  selector: 'app-contact-profile-dialog',
  templateUrl: './contact-profile-dialog.component.html',
  styleUrls: ['./contact-profile-dialog.component.scss'],
})
export class ContactProfileDialogComponent {
  dialogStyle = { width: '34rem' };

  //visibilidad del dialogo y el contacto
  @Input() visible = false;
  @Input() contact: Contact | null = null;

  //emitir el cambio de visibilidad y cerrar el dialogo
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private _contactUi: ContactUiService,
    public contactClipboard: ContactClipboardService,
  ) {}

  get displayData() {
    return this._contactUi.getDisplayData(this.contact);
  }

  //cerrar el dialogo
  onClose(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  //verificar si el contacto tiene direccion
  hasAddress(): boolean {
    return !!this.contact?.address.trim();
  }
}
