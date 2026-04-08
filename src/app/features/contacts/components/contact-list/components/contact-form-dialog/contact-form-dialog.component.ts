import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ContactFormModel } from '../../../../../../shared/interfaces/contact.interface';
import {
  createEmptyContactForm,
  getContactFormFieldError,
  isContactBodyValid,
} from '../../../../../../shared/utils/contact-validation';

@Component({
  selector: 'app-contact-form-dialog',
  templateUrl: './contact-form-dialog.component.html',
  styleUrls: ['./contact-form-dialog.component.scss'],
})
export class ContactFormDialogComponent implements OnChanges {
  
  readonly dialogStyle = { width: 'min(95vw, 40rem)' };

  //visibilidad del dialogo y el contacto a editar
  @Input() visible = false;
  @Input('editingContactId') editingId: number | null = null;
  @Input() initialModel: ContactFormModel = createEmptyContactForm();
  @Input('isSaving') saving = false;

  //emitir el cambio de visibilidad y cancelar el guardado
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ContactFormModel>();

  //referencia al campo de nombre
  @ViewChild('firstNameInput') firstNameInput?: ElementRef<HTMLInputElement>;

  //modelo de formulario
  formModel: ContactFormModel = createEmptyContactForm();
  //mostrar validacion
  showValidation = false;
  //campos requeridos
  readonly requiredFields: Array<keyof ContactFormModel> = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'jobTitle',
  ];

  //detectar cambios en el dialogo
  ngOnChanges(changes: SimpleChanges): void {
    const openedDialog = changes['visible']?.currentValue === true && changes['visible']?.previousValue === false;
    if (openedDialog || changes['initialModel']) {
      this.formModel = { ...this.initialModel };
      this.showValidation = false;
      if (this.visible) {
        this._focusFirstNameField();
      }
    }
  }

  //detectar cambios en el formulario
  onFormFieldChange(): void {
    this.showValidation = true;
  }

  //cerrar el dialogo
  close(): void {
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  //verificar si el campo es requerido
  isRequiredField(field: keyof ContactFormModel): boolean {
    return this.requiredFields.includes(field);
  }

  //obtener el error del campo
  getFieldError(field: keyof ContactFormModel): string {
    if (!this.showValidation) {
      return '';
    }
    return getContactFormFieldError(field, this.formModel, true);
  }

  //verificar si el campo es invalido
  isFieldInvalid(field: keyof ContactFormModel): boolean {
    return !!this.getFieldError(field);
  }

  //verificar si se puede guardar el contacto
  get canSaveContact(): boolean {
    return !this.saving && isContactBodyValid(this.formModel);
  }

  //guardar el contacto
  submit(): void {
    this.showValidation = true;
    if (!this.canSaveContact) {
      return;
    }
    this.save.emit({ ...this.formModel });
  }

  //enfocar el campo de nombre
  private _focusFirstNameField(): void {
    setTimeout(() => {
      this.firstNameInput?.nativeElement.focus();
    });
  }
}
