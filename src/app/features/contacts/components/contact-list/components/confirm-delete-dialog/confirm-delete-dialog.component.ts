import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss'],
})
export class ConfirmDeleteDialogComponent {

  //visibilidad del dialogo y el contacto a eliminar
  @Input() visible = false;
  @Input() contact: Contact | null = null;
  @Input() isDeleting = false;

  //emitir el cambio de visibilidad y cancelar la eliminacion
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  //cerrar el dialogo
  close(): void {
    if (this.isDeleting) {
      return;
    }
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  //eliminar el contacto
  submitDelete(): void {
    if (this.isDeleting) {
      return;
    }
    this.confirm.emit();
  }
}
