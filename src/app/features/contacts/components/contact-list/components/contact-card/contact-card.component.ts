import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppToastService } from '../../../../../../services/app-toast.service';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';
import { ContactUiService } from '../../../../../../services/contact-ui.service';

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
  @Output() profileClick = new EventEmitter<Contact>();
  @Output() onEdit = new EventEmitter<Contact>();
  @Output() delete = new EventEmitter<Contact>();

  //servicio de ui de contacto
  constructor(
    private _contactUi: ContactUiService,
    private _toast: AppToastService,
  ) {}

  //obtener el meta de visualizacion del contacto
  get displayData() {
    return this._contactUi.getDisplayData(this.contact);
  }

  //abrir el dialogo de vista de perfil
  openProfile(): void {
    this.profileClick.emit(this.contact);
  }

  //abrir el dialogo de edicion de contacto
  openEdit(): void {
    this.onEdit.emit(this.contact);
  }

  //abrir el dialogo de eliminacion de contacto
  openDelete(): void {
    this.delete.emit(this.contact);
  }

  //copiar el telefono del contacto
  copyPhone(): void {
    this._toast.copyWithFeedback(this.contact.phone, 'Phone');
  }

  //copiar el email del contacto
  copyEmail(): void {
    this._toast.copyWithFeedback(this.contact.email, 'Email');
  }
}
