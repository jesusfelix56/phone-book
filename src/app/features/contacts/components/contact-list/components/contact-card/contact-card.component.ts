import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardToastService } from '../../../../../../services/clipboard-toast.service';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';
import { ContactDisplayMeta, ContactUiService } from '../../../../../../services/contact-ui.service';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.scss'],
})
export class ContactCardComponent {

  //contacto a mostrar
  @Input() contact!: Contact;
  @Input() isAdmin = false;

  //emitir el evento de vista de perfil
  @Output() viewProfile = new EventEmitter<Contact>();
  @Output() editContact = new EventEmitter<Contact>();
  @Output() deleteContact = new EventEmitter<Contact>();

  //servicio de ui de contacto
  constructor(
    private _contactUi: ContactUiService,
    private _clipboardToast: ClipboardToastService,
  ) {}

  //obtener el meta de visualizacion del contacto
  get displayData(): ContactDisplayMeta {
    return this._contactUi.getDisplayData(this.contact);
  }

  //abrir el dialogo de vista de perfil
  openProfile(): void {
    this.viewProfile.emit(this.contact);
  }

  //abrir el dialogo de edicion de contacto
  openEdit(): void {
    this.editContact.emit(this.contact);
  }

  //abrir el dialogo de eliminacion de contacto
  openDelete(): void {
    this.deleteContact.emit(this.contact);
  }

  //copiar el telefono del contacto
  copyPhone(): void {
    this._clipboardToast.copyWithFeedback(this.contact.phone, 'Phone');
  }

  //copiar el email del contacto
  copyEmail(): void {
    this._clipboardToast.copyWithFeedback(this.contact.email, 'Email');
  }
}
