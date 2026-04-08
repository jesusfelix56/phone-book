import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppToastService } from '../../../../../../services/app-toast.service';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';
import { ContactUiService } from '../../../../../../services/contact-ui.service';

@Component({
  selector: 'app-contact-profile-dialog',
  templateUrl: './contact-profile-dialog.component.html',
  styleUrls: ['./contact-profile-dialog.component.scss'],
})
export class ContactProfileDialogComponent {
  readonly dialogStyle = { width: '34rem' };

  //visibilidad del dialogo y el contacto
  @Input() visible = false;
  @Input() contact: Contact | null = null;

  //emitir el cambio de visibilidad y cerrar el dialogo
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private _contactUi: ContactUiService,
    private _toast: AppToastService,
  ) {}

  get displayData() {
    return this._contactUi.getDisplayData(this.contact);
  }

  //cerrar el dialogo
  onClose(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  //copiar el telefono del contacto
  copyPhone(): void {
    this._toast.copyWithFeedback(this.contact?.phone ?? '', 'Phone');
  }

  //copiar el email del contacto
  copyEmail(): void {
    this._toast.copyWithFeedback(this.contact?.email ?? '', 'Email');
  }

  //copiar la direccion del contacto
  copyAddress(): void {
    this._toast.copyWithFeedback(this.contact?.address ?? '', 'Address');
  }

  //verificar si el contacto tiene direccion
  hasAddress(): boolean {
    return !!this.contact?.address.trim();
  }
}
